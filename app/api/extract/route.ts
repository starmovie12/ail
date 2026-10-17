import { NextRequest, NextResponse } from "next/server";
import {
  extract,
  extractStories,
  extractHighlightItems,
  ExtractError,
  parseInstagramUrl,
} from "@/lib/instagram-extractor";
import {
  coreToUi,
  storyItemsToUi,
  toUiErrorCode,
  statusForUiError,
  type ExtractResult,
  type Slide,
} from "@/lib/extract-ui";
import { isRateLimited } from "@/lib/rate-limit";
import { getLiveConfig } from "@/lib/runtime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const STORY_RE = /instagram\.com\/stories\/([\w.]+)(?:\/(\d+))?/i;

type UnifiedMediaItem = {
  type: "video" | "image";
  url: string;
  thumbnail: string;
  filename: string;
  quality?: string;
  audioUrl?: string;
};

type UnifiedExtractResponse = ExtractResult & {
  id: string;
  platform: string;
  url: string;
  type: "video" | "image" | "carousel" | "reel" | "post" | "story";
  author: {
    username: string;
    fullName: string;
    avatar: string | null;
  };
  media: UnifiedMediaItem[];
};

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function decodeEscaped(str?: string | null): string | null {
  if (!str) return null;
  let s = str
    .replace(/\\\//g, "/")
    .replace(/\\u0025/g, "%")
    .replace(/\\u0026/g, "&");
  try {
    s = JSON.parse(`"${str}"`);
  } catch {}
  return s.replace(/&amp;/g, "&");
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

function extractMentions(text: string): string[] {
  const matches = text.match(/@[a-zA-Z0-9_.]+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

function metaContent(html: string, prop: string): string | null {
  const re1 = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
    "i"
  );
  const m = html.match(re1) ?? html.match(re2);
  return m ? m[1].replace(/&amp;/g, "&") : null;
}

/** Convert standard ExtractResult into the Unified Dual-Schema format */
function toUnifiedPayload(
  ui: ExtractResult,
  platform: string,
  originalUrl: string,
  avatar: string | null = null,
  fullName = ""
): UnifiedExtractResponse {
  const slides: Slide[] = ui.slides?.length
    ? ui.slides
    : [
        {
          type: "image",
          url: ui.thumbnail,
          thumbnail: ui.thumbnail,
          versions: [{ label: "HD", url: ui.thumbnail }],
        },
      ];

  const media: UnifiedMediaItem[] = slides.map((s, idx) => ({
    type: s.type,
    url: s.url,
    thumbnail: s.thumbnail || s.url,
    audioUrl: s.audioUrl,
    quality: s.versions?.[0]?.label || "HD",
    filename: `${platform}_${ui.shortcode || "media"}_${idx + 1}.${
      s.type === "video" ? "mp4" : "jpg"
    }`,
  }));

  const type =
    slides.length > 1
      ? "carousel"
      : slides[0]?.type === "video"
      ? "video"
      : "image";

  return {
    ...ui,
    id: ui.shortcode || `${platform}_${Date.now()}`,
    platform,
    url: originalUrl,
    type,
    author: {
      username: ui.username || `${platform}_creator`,
      fullName: fullName || ui.username || "",
      avatar: avatar || ui.thumbnail || null,
    },
    media,
  };
}

/** 2. Public Fallback Resolvers for Instagram & Facebook (from instagrab-main) */
async function fetchViaPublicFallback(
  targetUrl: string,
  shortcode: string,
  platform: "instagram" | "facebook",
  cobaltInstance?: string
): Promise<UnifiedExtractResponse | null> {
  // 2A. Try Instagram Embed HTML parser if platform is Instagram
  if (platform === "instagram") {
    try {
      const embedRes = await fetch(
        `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(8000),
        }
      );
      if (embedRes.ok) {
        const html = await embedRes.text();
        const videoMatches = [
          ...html.matchAll(/"video_url":\s*"([^"]+)"/g),
        ].map((m) => decodeEscaped(m[1]) || "");
        const displayMatches = [
          ...html.matchAll(/"display_url":\s*"([^"]+)"/g),
        ].map((m) => decodeEscaped(m[1]) || "");

        const userMatch = html.match(/class="UsernameText"[^>]*>([^<]+)</i);
        const captionMatch = html.match(/class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
        const cleanCaption = captionMatch
          ? captionMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
          : "";

        if (videoMatches[0] || displayMatches[0]) {
          const isVid = Boolean(videoMatches[0]);
          const mediaUrl = videoMatches[0] || displayMatches[0];
          const thumb = displayMatches[0] || mediaUrl;
          const slide: Slide = {
            type: isVid ? "video" : "image",
            url: mediaUrl,
            thumbnail: thumb,
            versions: [{ label: "HD", url: mediaUrl }],
          };
          const ui: ExtractResult = {
            kind: isVid ? "reel" : "post",
            shortcode,
            username: userMatch?.[1]?.trim() || "instagram_user",
            caption: cleanCaption,
            hashtags: extractHashtags(cleanCaption),
            mentions: extractMentions(cleanCaption),
            thumbnail: thumb,
            slides: [slide],
          };
          return toUnifiedPayload(ui, "instagram", targetUrl);
        }
      }
    } catch {}
  }

  // 2B. Try Custom Cobalt Instance if provided
  const cobaltUrl = (
    cobaltInstance ||
    process.env.COBALT_INSTANCE ||
    ""
  )
    .trim()
    .replace(/\/$/, "");

  if (cobaltUrl) {
    try {
      const res = await fetch(`${cobaltUrl}/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          const isVid = !data.url.includes(".jpg");
          const slide: Slide = {
            type: isVid ? "video" : "image",
            url: data.url,
            thumbnail: data.url,
            versions: [{ label: "HD", url: data.url }],
          };
          return toUnifiedPayload(
            {
              kind: isVid ? "reel" : "post",
              shortcode,
              username: `${platform}_creator`,
              caption: "",
              hashtags: [],
              mentions: [],
              thumbnail: data.url,
              slides: [slide],
            },
            platform,
            targetUrl
          );
        }
      }
    } catch {}
  }

  return null;
}

/** 3. Native Facebook Video, Reel & Shortlink Extractor (from instagrab-main) */
async function resolveFacebookShortlink(url: string): Promise<string> {
  if (!/(?:fb\.watch|fb\.me|\/share\/[rv]?\/)/i.test(url)) return url;
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      },
      signal: AbortSignal.timeout(6000),
    });
    const loc = res.headers.get("location");
    if (loc) {
      return loc.startsWith("http")
        ? loc
        : new URL(loc, "https://www.facebook.com").toString();
    }
  } catch {}
  return url;
}

async function extractFacebook(
  rawUrl: string,
  cobaltInstance?: string
): Promise<UnifiedExtractResponse> {
  const resolvedUrl = await resolveFacebookShortlink(rawUrl);
  try {
    if (platformOfHost(new URL(resolvedUrl).hostname) !== "facebook") {
      throw new ExtractError("That doesn't look like a Facebook link.", "INVALID_URL");
    }
  } catch (e) {
    if (e instanceof ExtractError) throw e;
    throw new ExtractError("That doesn't look like a valid link.", "INVALID_URL");
  }
  const idMatch =
    resolvedUrl.match(
      /(?:videos|reel|watch|posts|photos|r|v)\/(?:[^\s/?#]+\/)?([0-9A-Za-z_-]+)/i
    ) ||
    resolvedUrl.match(/[?&](?:v|story_fbid|fbid)=([0-9A-Za-z_-]+)/i) ||
    rawUrl.match(/fb\.watch\/([0-9A-Za-z_-]+)/i);

  const id = idMatch?.[1] || `fb_${Date.now()}`;

  const uas = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  ];

  for (const ua of uas) {
    try {
      const res = await fetch(resolvedUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const html = await res.text();

      const hdMatch =
        html.match(/browser_native_hd_url["']?\s*:\s*["']([^"']+)["']/i) ||
        html.match(/playable_url_quality_hd["']?\s*:\s*["']([^"']+)["']/i) ||
        html.match(/hd_src_no_ratelimit["']?\s*:\s*["']([^"']+)["']/i) ||
        html.match(/hd_src["']?\s*:\s*["']([^"']+)["']/i);

      const sdMatch =
        html.match(/browser_native_sd_url["']?\s*:\s*["']([^"']+)["']/i) ||
        html.match(/playable_url["']?\s*:\s*["']([^"']+)["']/i) ||
        html.match(/sd_src["']?\s*:\s*["']([^"']+)["']/i);

      const ogVideo =
        metaContent(html, "og:video:secure_url") ||
        metaContent(html, "og:video") ||
        metaContent(html, "og:video:url");

      const hdUrl = decodeEscaped(hdMatch?.[1]);
      const sdUrl = decodeEscaped(sdMatch?.[1]);
      const videoUrl = hdUrl || sdUrl || decodeEscaped(ogVideo);

      const thumb =
        metaContent(html, "og:image") ||
        metaContent(html, "twitter:image") ||
        videoUrl ||
        "";

      const title =
        metaContent(html, "og:title") ||
        metaContent(html, "twitter:title") ||
        "Facebook Media";
      const caption =
        metaContent(html, "og:description") ||
        metaContent(html, "twitter:description") ||
        title;

      if (videoUrl || thumb) {
        const isVideo = Boolean(videoUrl);
        const versions = [];
        if (hdUrl) versions.push({ label: "1080p HD", url: hdUrl });
        if (sdUrl) versions.push({ label: "720p SD", url: sdUrl });
        if (!versions.length && videoUrl) {
          versions.push({ label: "HD", url: videoUrl });
        }
        if (!isVideo && thumb) {
          versions.push({ label: "Original", url: thumb });
        }

        const slide: Slide = {
          type: isVideo ? "video" : "image",
          url: videoUrl || thumb,
          thumbnail: thumb,
          versions,
        };

        return toUnifiedPayload(
          {
            kind: isVideo ? "reel" : "post",
            shortcode: id,
            username: "facebook_video",
            caption,
            hashtags: extractHashtags(caption),
            mentions: extractMentions(caption),
            thumbnail: thumb,
            slides: [slide],
          },
          "facebook",
          resolvedUrl,
          thumb,
          title
        );
      }
    } catch {}
  }

  const fbFallback = await fetchViaPublicFallback(
    resolvedUrl,
    id,
    "facebook",
    cobaltInstance
  );
  if (fbFallback) return fbFallback;

  throw new ExtractError(
    "Unable to extract this Facebook link. Please make sure the video or reel is public.",
    "NOT_FOUND"
  );
}

/** 4. Universal OpenGraph / Multi-Platform Handler (Pinterest, Threads, TikTok, X, YouTube) */
async function extractOtherPlatform(
  rawUrl: string,
  platform: string
): Promise<UnifiedExtractResponse> {
  // YouTube Video / Shorts Thumbnail HD Extractor
  if (platform === "youtube") {
    const ytMatch = rawUrl.match(
      /(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/
    );
    const videoId = ytMatch?.[1];
    if (!videoId) {
      throw new ExtractError("Invalid YouTube link.", "INVALID_URL");
    }
    const maxRes = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const hqRes = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const slide: Slide = {
      type: "image",
      url: maxRes,
      thumbnail: hqRes,
      versions: [
        { label: "1080p MaxRes", url: maxRes },
        { label: "720p HQ", url: hqRes },
      ],
    };
    return toUnifiedPayload(
      {
        kind: "post",
        shortcode: videoId,
        username: "youtube_creator",
        caption: `YouTube HD Cover Thumbnail (${videoId})`,
        hashtags: [],
        mentions: [],
        thumbnail: maxRes,
        slides: [slide],
      },
      "youtube",
      rawUrl
    );
  }

  // Twitter / X Syndication API
  if (platform === "twitter") {
    const id = rawUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status(?:es)?\/(\d+)/i)?.[1];
    if (!id) {
      throw new ExtractError("Invalid X / Twitter status link.", "INVALID_URL");
    }
    const token = ((Number(id) / 1e15) * Math.PI)
      .toString(36)
      .replace(/(0+|\.)/g, "");
    const res = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${token}`,
      {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (res.ok) {
      const json = await res.json().catch(() => null);
      const slides: Slide[] = [];
      for (const m of json?.mediaDetails ?? []) {
        if (m?.type === "video" || m?.type === "animated_gif") {
          const variants = (m?.video_info?.variants ?? [])
            .filter(
              (v: { content_type?: string; url?: string }) =>
                v?.content_type === "video/mp4" && v?.url
            )
            .sort(
              (a: { bitrate?: number }, b: { bitrate?: number }) =>
                (b?.bitrate ?? 0) - (a?.bitrate ?? 0)
            );
          if (variants[0]?.url) {
            slides.push({
              type: "video",
              url: variants[0].url,
              thumbnail: m?.media_url_https ?? variants[0].url,
              versions: [{ label: "HD MP4", url: variants[0].url }],
            });
          }
        } else if (m?.media_url_https) {
          slides.push({
            type: "image",
            url: `${m.media_url_https}?name=orig`,
            thumbnail: m.media_url_https,
            versions: [{ label: "Original", url: `${m.media_url_https}?name=orig` }],
          });
        }
      }
      if (slides.length > 0) {
        const text = String(json?.text ?? "");
        return toUnifiedPayload(
          {
            kind: slides.length > 1 ? "carousel" : slides[0].type === "video" ? "reel" : "post",
            shortcode: id,
            username: String(json?.user?.screen_name || "x_user"),
            caption: text,
            hashtags: extractHashtags(text),
            mentions: extractMentions(text),
            thumbnail: slides[0].thumbnail,
            slides,
          },
          "twitter",
          rawUrl
        );
      }
    }
  }

  // Pinterest, Threads & TikTok via OpenGraph Bot Header
  const res = await fetch(rawUrl, {
    headers: {
      "User-Agent":
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      Accept: "text/html",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new ExtractError(
      `Could not fetch ${platform} link (HTTP ${res.status}).`,
      "EXTRACTOR_DOWN"
    );
  }

  const html = await res.text();
  let video =
    metaContent(html, "og:video") ||
    metaContent(html, "og:video:secure_url") ||
    metaContent(html, "twitter:player:stream");

  if (!video && platform === "tiktok") {
    const playMatch = html.match(/"playAddr":"(https:[^"]+)"/);
    if (playMatch) {
      video = decodeEscaped(playMatch[1]);
    }
  }

  const image =
    metaContent(html, "og:image") || metaContent(html, "twitter:image");
  const caption =
    metaContent(html, "og:description") ||
    metaContent(html, "og:title") ||
    "";

  if (!video && !image) {
    throw new ExtractError(
      `No public downloadable media found on this ${platform} link.`,
      "NOT_FOUND"
    );
  }

  const isVid = Boolean(video);
  const bestUrl = (video || image)!;
  const thumb = (image || video)!;
  const code = `${platform}_${Date.now().toString(36)}`;

  return toUnifiedPayload(
    {
      kind: isVid ? "reel" : "post",
      shortcode: code,
      username: `${platform}_creator`,
      caption,
      hashtags: extractHashtags(caption),
      mentions: extractMentions(caption),
      thumbnail: thumb,
      slides: [
        {
          type: isVid ? "video" : "image",
          url: bestUrl,
          thumbnail: thumb,
          versions: [{ label: "HD", url: bestUrl }],
        },
      ],
    },
    platform,
    rawUrl
  );
}

/* ───────────────────────── routing + HTTP handler ───────────────────────── */

type Platform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "twitter"
  | "tiktok"
  | "pinterest"
  | "threads";

const HOST_MAP: Array<[RegExp, Platform]> = [
  [/(^|\.)(instagram\.com|instagr\.am)$/, "instagram"],
  [/(^|\.)(facebook\.com|fb\.watch|fb\.me)$/, "facebook"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(twitter\.com|x\.com)$/, "twitter"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(pinterest\.com|pin\.it)$/, "pinterest"],
  [/(^|\.)(threads\.net|threads\.com)$/, "threads"],
];

function platformOfHost(host: string): Platform | null {
  const h = host.toLowerCase();
  for (const [re, p] of HOST_MAP) if (re.test(h)) return p;
  return null;
}

/** Accepts "https://…", "instagram.com/…" (no scheme) or a bare shortcode. */
function normalizeInput(raw: string): { url: string; platform: Platform } | null {
  const s = raw.trim();
  if (!s || s.length > 2000) return null;
  if (/^[A-Za-z0-9_-]{9,20}$/.test(s)) {
    return { url: `https://www.instagram.com/p/${s}/`, platform: "instagram" };
  }
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol === "http:") u.protocol = "https:";
    const platform = platformOfHost(u.hostname);
    return platform ? { url: u.toString(), platform } : null;
  } catch {
    return null;
  }
}

function errorJson(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

async function resolve(raw: string): Promise<UnifiedExtractResponse> {
  const input = normalizeInput(raw);
  if (!input) {
    throw new ExtractError("Please paste a valid Instagram, Facebook, YouTube, X, TikTok, Pinterest or Threads link.", "INVALID_URL");
  }

  switch (input.platform) {
    case "instagram": {
      // Stories + highlights permalinks
      const st = input.url.match(STORY_RE);
      if (st) {
        if (st[1].toLowerCase() === "highlights") {
          const id = input.url.match(/stories\/highlights\/(\d+)/i)?.[1];
          if (!id) throw new ExtractError("Invalid highlight link.", "INVALID_URL");
          const items = await extractHighlightItems(id);
          return toUnifiedPayload(storyItemsToUi(items, "instagram", id), "instagram", input.url);
        }
        const { username, items } = await extractStories(st[1]);
        const wanted = st[2] ? items.filter((i) => i.id === st[2]) : [];
        return toUnifiedPayload(
          storyItemsToUi(wanted.length ? wanted : items, username, st[2] || username),
          "instagram",
          input.url
        );
      }

      const core = await extract(input.url);
      const canonical = parseInstagramUrl(input.url)?.canonicalUrl ?? input.url;
      return toUnifiedPayload(coreToUi(core), "instagram", canonical, null, core.fullName ?? "");
    }
    case "facebook":
      return extractFacebook(input.url);
    default:
      return extractOtherPlatform(input.url, input.platform);
  }
}

export async function POST(req: NextRequest) {
  const cfg = await getLiveConfig();
  if (isRateLimited("extract:" + clientIp(req), cfg.rateLimitPerMinute)) {
    return errorJson("RATE_LIMITED", "Too many requests — please wait a minute and try again.", 429);
  }

  let url = "";
  try {
    const body = await req.json();
    url = String(body?.url ?? "");
  } catch {
    return errorJson("INVALID_URL", "Invalid request body.", 400);
  }
  if (!url.trim()) return errorJson("INVALID_URL", "Paste a link first.", 400);

  try {
    const data = await resolve(url);
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof ExtractError) {
      const code = toUiErrorCode(err.code);
      return errorJson(code, err.message, statusForUiError(code));
    }
    console.error("extract failed:", err);
    return errorJson("EXTRACTOR_DOWN", "Something went wrong on our side. Please try again in a moment.", 503);
  }
}
