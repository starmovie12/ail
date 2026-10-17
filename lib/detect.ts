/**
 * Link detection — hostname-based (PRD §16.3, A19/A23).
 * `includes("x.com")` jaisa check kahin nahi: dropbox.com / fedex.com ab X nahi maane jaate.
 * Pure functions: koi network nahi, koi window nahi (tests node me chalte hain).
 */
import { platformOfHost, soonOfHost, type PlatformId, type SoonId } from "./platforms";

const TRACKING = new Set(["igsh", "igshid", "fbclid", "si", "feature", "mibextid", "gclid", "ref_src"]);
const WRAPPER_HOSTS = ["l.facebook.com", "lm.facebook.com", "l.instagram.com"];
const BAD_SCHEME = /^\s*(javascript|data|file|intent|vbscript|blob|about|chrome|ftp):/i;
const COMMON_TLDS = new Set([
  "com", "net", "org", "in", "io", "co", "me", "tv", "app", "dev", "xyz", "info", "biz", "ly", "it", "be",
  "gl", "gg", "to", "cc", "us", "uk", "de", "fr", "ru", "cn", "jp", "br", "au", "ca", "site", "online", "link", "page", "watch",
]);

export type Kind =
  | "reel" | "story" | "highlights" | "post" | "video" | "photo" | "profile" | "thumbnail" | "image";

export type Detected =
  | { type: "live"; platform: PlatformId; kind?: Kind; unsupported?: boolean; isUsername?: boolean }
  | { type: "soon"; platform: SoonId }
  | { type: "unknown" };

/** Text me se link-jaise tokens nikalo (scheme ho ya na ho). Order preserved, dedupe. */
export function extractLinks(raw: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (s: string) => {
    const c = cleanTrailing(s);
    if (c && !seen.has(c)) { seen.add(c); out.push(c); }
  };
  const text = raw.replace(/[\u200B-\u200D\uFEFF]/g, "");
  const withScheme = /https?:\/\/[^\s<>"']+/gi;
  let rest = text;
  for (const m of text.match(withScheme) ?? []) push(m);
  rest = text.replace(withScheme, " ");
  // scheme-less: host.tld/path  (sirf jab "/" ho ya host kisi known platform ka ho)
  const bare = /(?:^|[\s(<\["'])((?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?)/gi;
  let m: RegExpExecArray | null;
  while ((m = bare.exec(rest))) {
    const tok = cleanTrailing(m[1]);
    const host = tok.split("/")[0].toLowerCase();
    const hasPath = tok.includes("/");
    const known = Boolean(platformOfHost(host) || soonOfHost(host));
    if (known || hasPath) push(tok);
  }
  return out;
}

export function cleanTrailing(s: string): string {
  return s.replace(/[)\].,!?;:'"»”’>]+$/g, "");
}

export type Normalized = { url: URL } | { rejected: "scheme" | "invalid" };

/** scheme jodo, sirf http/https, wrapper kholo (ek level), tracking hatao. */
export function normalizeLink(input: string, depth = 0): Normalized {
  let s = input.trim();
  if (!s) return { rejected: "invalid" };
  if (BAD_SCHEME.test(s)) return { rejected: "scheme" };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^[a-z0-9.-]+:\d+/i.test(s)) return { rejected: "scheme" };
    s = "https://" + s.replace(/^\/+/, "");
  }
  let u: URL;
  try { u = new URL(s); } catch { return { rejected: "invalid" }; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return { rejected: "scheme" };
  u.hash = "";
  u.hostname = u.hostname.toLowerCase();
  // wrapper (l.facebook.com/l.php?u=…, l.instagram.com/?u=…)
  if (depth === 0 && WRAPPER_HOSTS.includes(u.hostname)) {
    const inner = u.searchParams.get("u");
    if (inner) return normalizeLink(inner, 1);
  }
  const keep = new URLSearchParams();
  u.searchParams.forEach((v, k) => {
    if (TRACKING.has(k) || k.startsWith("utm_")) return;
    // `s`, `t` Twitter share params hain — sirf x.com / twitter.com par hatao
    if ((k === "s" || k === "t") && /(^|\.)(x|twitter)\.com$/.test(u.hostname)) return;
    keep.append(k, v);
  });
  u.search = keep.toString() ? "?" + keep.toString() : "";
  return { url: u };
}

const IG_RESERVED = new Set([
  "explore", "accounts", "direct", "about", "legal", "developer", "directory", "web", "p", "reel", "reels", "tv", "stories", "s",
  "challenge", "emails", "session", "oauth", "privacy", "terms", "download", "reels_ads", "ar", "music", "tags", "locations",
]);

/** Normalized URL → platform + kind. */
export function detectUrl(u: URL): Detected {
  const host = u.hostname.toLowerCase();
  const live = platformOfHost(host);
  if (!live) {
    const soon = soonOfHost(host);
    return soon ? { type: "soon", platform: soon.id } : { type: "unknown" };
  }
  const segs = u.pathname.split("/").filter(Boolean).map((s) => decodeURIComponent(s).toLowerCase());
  const path = "/" + segs.join("/");

  switch (live.id) {
    case "instagram": {
      if (segs[0] === "stories" && segs[1] === "highlights") return { type: "live", platform: "instagram", kind: "highlights" }; // pehle
      if (segs[0] === "stories" && segs[1]) return { type: "live", platform: "instagram", kind: "story" };
      const hit = (name: string) => segs[0] === name || (segs.length >= 3 && segs[1] === name);
      if (hit("reel") || hit("reels")) return { type: "live", platform: "instagram", kind: "reel" };
      if (hit("p")) return { type: "live", platform: "instagram", kind: "post" };
      if (hit("tv")) return { type: "live", platform: "instagram", kind: "video" };
      if (segs.length >= 1 && !IG_RESERVED.has(segs[0]) && /^[a-z0-9._]{1,30}$/.test(segs[0]))
        return { type: "live", platform: "instagram", kind: "profile", isUsername: true };
      return { type: "live", platform: "instagram" };
    }
    case "facebook": {
      if (host === "fb.watch" || host.endsWith(".fb.watch")) return { type: "live", platform: "facebook", kind: "video" };
      if (host === "fb.me" || host.endsWith(".fb.me")) return { type: "live", platform: "facebook" };
      if (segs[0] === "stories" || path.includes("/media/set") || path.includes("/albums") || segs[0] === "album.php" || /\/photos\/a\./.test(path))
        return { type: "live", platform: "facebook", unsupported: true };
      if (segs[0] === "reel" || (segs[0] === "share" && segs[1] === "r")) return { type: "live", platform: "facebook", kind: "reel" };
      if (segs[0] === "watch" || segs.includes("videos") || segs[0] === "video.php" || (segs[0] === "share" && segs[1] === "v"))
        return { type: "live", platform: "facebook", kind: "video" };
      if (segs[0] === "photo" || segs[0] === "photo.php" || segs.includes("photos")) return { type: "live", platform: "facebook", kind: "photo" };
      return { type: "live", platform: "facebook" };
    }
    case "tiktok":
      return { type: "live", platform: "tiktok", kind: "video" };
    case "youtube":
      return { type: "live", platform: "youtube", kind: "thumbnail" };
    default:
      return { type: "live", platform: live.id };
  }
}

export const KIND_LABEL: Record<string, string> = {
  reel: "Reel", story: "Story", highlights: "Highlights", post: "Post", video: "Video", photo: "Photo",
  profile: "Profile", thumbnail: "Thumbnail", image: "Image",
};

/** Bare / @username pehchaan (Instagram). `allowBare` sirf Grab/Enter par true. */
export function detectUsername(raw: string, allowBare: boolean): string | null {
  const s = raw.trim();
  const at = s.match(/^@([A-Za-z0-9._]{1,30})$/);
  if (at && /[A-Za-z]/.test(at[1])) return at[1];
  if (allowBare && /^[A-Za-z0-9._]{1,30}$/.test(s) && /[A-Za-z]/.test(s)) {
    const last = s.split(".").pop()!.toLowerCase();
    // "instagram.com.evil.com", "fedex.com" jaise domain-jaise tokens username nahi maane jate
    if (s.includes(".") && COMMON_TLDS.has(last)) return null;
    return s;
  }
  return null;
}

/** Ek raw input ke liye ek-line detection (UI chip ke liye). */
export function detectInput(raw: string): Detected | { type: "none" } {
  const links = extractLinks(raw);
  if (!links.length) {
    return detectUsername(raw, true) ? { type: "live", platform: "instagram", kind: "profile", isUsername: true } : { type: "none" };
  }
  const n = normalizeLink(links[0]);
  if ("rejected" in n) return { type: "unknown" };
  return detectUrl(n.url);
}
