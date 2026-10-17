import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Open-Graph media extractor for the multi-platform downloaders (Pinterest,
 * Threads, TikTok, Facebook). Strictly host-allowlisted — this is NOT an
 * open proxy/scraper. TikTok gets an extra fallback: the page's hydration
 * JSON often carries the play URL even when OG tags don't.
 */
const ALLOWED_PAGE_HOSTS = new Set([
  "www.pinterest.com", "pinterest.com", "in.pinterest.com", "pin.it",
  "www.threads.net", "threads.net", "www.threads.com", "threads.com",
  "www.tiktok.com", "tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com",
  "www.facebook.com", "facebook.com", "m.facebook.com", "web.facebook.com", "fb.watch",
]);

/** TikTok fallback — pull playAddr out of the hydration JSON. */
function tiktokPlayUrl(html: string): string | null {
  const m = html.match(/"playAddr":"(https:[^"]+)"/);
  if (!m) return null;
  const url = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
  try {
    const host = new URL(url).hostname;
    if (/(^|\.)tiktokcdn(-[a-z0-9]+)?\.com$/.test(host) || /tiktok\.com$/.test(host)) return url;
  } catch { /* fall through */ }
  return null;
}

function metaContent(html: string, property: string): string | null {
  // property before content and vice versa — both orders appear in the wild.
  const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i");
  const m = html.match(re1) ?? html.match(re2);
  return m ? m[1].replace(/&amp;/g, "&") : null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("og:" + ip, 15)) {
    return NextResponse.json({ error: "Too many requests — wait a minute." }, { status: 429 });
  }

  let raw = "";
  try {
    const body = await req.json();
    raw = String(body?.url ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a link." }, { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED_PAGE_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Only Pinterest, Threads, TikTok and Facebook links are supported here." }, { status: 400 });
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        // A generic bot UA gets the static OG-tag version of these pages.
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `The page returned HTTP ${res.status} — is the link public?` }, { status: 502 });
    }
    const html = (await res.text()).slice(0, 1_500_000);

    let video = metaContent(html, "og:video") ?? metaContent(html, "og:video:url") ?? metaContent(html, "og:video:secure_url") ?? metaContent(html, "twitter:player:stream");
    if (!video && /tiktok\.com$/.test(target.hostname.replace(/^(www|m|vm|vt)\./, "")) ) {
      video = tiktokPlayUrl(html);
    }
    const image = metaContent(html, "og:image") ?? metaContent(html, "twitter:image");
    const title = metaContent(html, "og:title") ?? "";
    const description = metaContent(html, "og:description") ?? "";

    if (!video && !image) {
      return NextResponse.json(
        { error: "No downloadable media found on that page — it may be private, deleted, or a format we can't read." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      video: video ?? null,
      image: image ?? null,
      title,
      description,
      host: target.hostname,
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach that page — try again in a moment." }, { status: 502 });
  }
}
