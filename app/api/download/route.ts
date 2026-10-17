import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Badi video stream hone me time lagta hai — Hobby plan par bhi 60s allowed hai.
export const maxDuration = 60;

/**
 * Download proxy: Instagram CDN blocks cross-origin fetches, so the browser
 * can't save the file directly. This route streams the media through with a
 * Content-Disposition header so the browser downloads instead of playing it.
 * Only the CDN hosts of supported platforms (Instagram/Facebook, YouTube
 * thumbnails, Pinterest, Twitter, TikTok, SnapSave's rapidcdn) are allowed — NOT an open proxy.
 *
 * Koi naya CDN host chahiye ho to code badle bina Vercel env me daalo:
 *   EXTRA_DOWNLOAD_HOSTS = host1.com,host2.net      (subdomains bhi allowed)
 */
const ALLOWED_HOST_RE =
  /(^|\.)(cdninstagram\.com|fbcdn\.net|ytimg\.com|pinimg\.com|twimg\.com|tiktokcdn(-[a-z0-9]+)?\.com|rapidcdn\.app)$/;
const ALLOWED_EXACT_HOSTS = new Set(["img.youtube.com"]);
const MAX_REDIRECTS = 4;

function extraHosts(): string[] {
  return (process.env.EXTRA_DOWNLOAD_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/^\.+/, ""))
    .filter((h) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(h));
}

function isAllowedUrl(u: URL): boolean {
  if (u.protocol !== "https:" || u.username || u.password) return false;
  const host = u.hostname.toLowerCase();
  if (ALLOWED_HOST_RE.test(host) || ALLOWED_EXACT_HOSTS.has(host)) return true;
  return extraHosts().some((h) => host === h || host.endsWith("." + h));
}

function refererFor(u: URL): string | undefined {
  const h = u.hostname.toLowerCase();
  if (h.endsWith("fbcdn.net")) return "https://www.facebook.com/";
  if (h.endsWith("cdninstagram.com")) return "https://www.instagram.com/";
  return undefined;
}

function safeFilename(name: string, fallback: string): string {
  const cleaned = name.replace(/[^\w.-]+/g, "_").slice(0, 80);
  return cleaned || fallback;
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("dl:" + ip, 60)) {
    return NextResponse.json({ error: "Too many downloads — slow down a bit." }, { status: 429 });
  }

  const src = req.nextUrl.searchParams.get("url") ?? "";
  const requestedName =
    req.nextUrl.searchParams.get("filename") ??
    req.nextUrl.searchParams.get("name") ??
    "";

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }
  if (!isAllowedUrl(target)) {
    return NextResponse.json({ error: "URL not allowed." }, { status: 403 });
  }

  // Redirects hum khud follow karte hain: har hop par host dobara allow-list se check hota hai (SSRF safe).
  // Header milne tak hi timeout — uske baad body ki streaming ko beech me nahi kaatna.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  let upstream: Response | null = null;
  try {
    let current = target;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const referer = refererFor(current);
      const res = await fetch(current.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "*/*",
          ...(referer ? { Referer: referer } : {}),
        },
        redirect: "manual",
        cache: "no-store",
        signal: controller.signal,
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        let next: URL;
        try {
          next = new URL(res.headers.get("location")!, current);
        } catch {
          break;
        }
        if (!isAllowedUrl(next)) {
          return NextResponse.json({ error: "URL not allowed." }, { status: 403 });
        }
        current = next;
        continue;
      }
      upstream = res;
      break;
    }
  } catch {
    clearTimeout(timer);
    return NextResponse.json(
      { error: "Could not reach the media server — please try again." },
      { status: 504 }
    );
  }
  clearTimeout(timer);

  if (!upstream || !upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Media expired — please extract the link again." },
      { status: 502 }
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const ext =
    contentType.includes("video") ? "mp4" :
    contentType.includes("audio") ? "m4a" :
    contentType.includes("png") ? "png" : "jpg";
  let filename = safeFilename(requestedName, `instagrab-${Date.now()}.${ext}`);
  if (!/\.(mp4|m4a|mp3|jpe?g|png|webp|heic)$/i.test(filename)) filename += `.${ext}`;

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      ...(upstream.headers.get("content-length")
        ? { "Content-Length": upstream.headers.get("content-length")! }
        : {}),
    },
  });
}
