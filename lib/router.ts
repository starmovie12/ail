/**
 * Smart Link Router — `resolveRoute(raw) → Route` (PRD §7.6).
 * Home SmartLinkBox, app-page mismatch check (R3), /quick-action aur History re-grab sab yahi use karte hain.
 * Poori tarah on-device: koi network nahi. Destination hamesha registry ka internal path (open-redirect nahi).
 */
import { detectUrl, detectUsername, extractLinks, normalizeLink, KIND_LABEL, type Kind } from "./detect";
import { platformById, soonById, PLATFORMS } from "./platforms";
import type { PlatformId, SoonId } from "./platforms";

export type Route =
  | { type: "app"; platform: PlatformId; path: string; kind?: Kind; url: string; label: string; extraLinks?: number; note?: "youtube-thumb-only" }
  | { type: "batch"; urls: string[]; truncated?: boolean }
  | { type: "soon"; platform: SoonId }
  | { type: "unsupported"; platform: PlatformId; url: string }
  | { type: "rejected"; reason: "self" | "scheme" }
  | { type: "unknown" | "empty" | "notlink" };

export type ResolveOptions = {
  /** Sirf Grab/Enter par true — bina `@` ka bare username (paste-event par nahi) */
  allowBareUsername?: boolean;
  /** Hamari apni site ke hostnames (self-link detect) */
  selfHosts?: string[];
};

const DEFAULT_SELF = ["instagrabs.vercel.app", "localhost"];
const BATCH_MAX = 20;
const NOT_URLISH = /^\s*(javascript|data|file|intent|vbscript|blob):/i;

function appRoute(platform: PlatformId, kind: Kind | undefined, url: string): Route {
  const def = platformById(platform)!;
  const base = def.name === "X" ? "X" : def.name;
  const label = kind ? `${base} ${KIND_LABEL[kind] ?? ""}`.trim() : base;
  return {
    type: "app", platform, path: def.route, kind, url, label,
    note: platform === "youtube" ? "youtube-thumb-only" : undefined,
  };
}

export function resolveRoute(raw: string, opts: ResolveOptions = {}): Route {
  const text = (raw ?? "").trim();
  if (!text) return { type: "empty" };
  if (NOT_URLISH.test(text)) return { type: "rejected", reason: "scheme" };

  const links = extractLinks(text);

  // — link nahi: @username / bare username —
  if (!links.length) {
    const uname = detectUsername(text, Boolean(opts.allowBareUsername));
    if (uname) return appRoute("instagram", "profile", "@" + uname);
    return { type: "notlink" };
  }

  const selfHosts = (opts.selfHosts?.length ? opts.selfHosts : DEFAULT_SELF).map((h) => h.toLowerCase());
  type Hit = { route: Route; igLink: boolean; url: string };
  const hits: Hit[] = [];
  let sawScheme = false;
  let sawSelf = false;

  for (const l of links) {
    const n = normalizeLink(l);
    if ("rejected" in n) { if (n.rejected === "scheme") sawScheme = true; continue; }
    const host = n.url.hostname;
    if (selfHosts.some((s) => host === s || host.endsWith("." + s))) { sawSelf = true; continue; }
    const d = detectUrl(n.url);
    const href = n.url.toString();
    if (d.type === "soon") { hits.push({ route: { type: "soon", platform: d.platform }, igLink: false, url: href }); continue; }
    if (d.type === "unknown") { hits.push({ route: { type: "unknown" }, igLink: false, url: href }); continue; }
    if (d.unsupported) { hits.push({ route: { type: "unsupported", platform: d.platform, url: href }, igLink: false, url: href }); continue; }
    hits.push({ route: appRoute(d.platform, d.kind, d.isUsername && d.kind === "profile" ? "@" + n.url.pathname.split("/").filter(Boolean)[0] : href), igLink: d.platform === "instagram", url: href });
  }

  if (!hits.length) {
    if (sawSelf) return { type: "rejected", reason: "self" };
    if (sawScheme) return { type: "rejected", reason: "scheme" };
    return { type: "notlink" };
  }

  // 2+ Instagram links → batch
  const ig = hits.filter((h) => h.igLink && h.route.type === "app");
  if (ig.length >= 2) {
    const urls = ig.map((h) => h.url);
    return { type: "batch", urls: urls.slice(0, BATCH_MAX), truncated: urls.length > BATCH_MAX };
  }

  // pehla useful link. Supported/soon ko unknown par tarjeeh (share-text me tracker links ho sakte hain)
  const first = hits.find((h) => h.route.type === "app" || h.route.type === "soon" || h.route.type === "unsupported") ?? hits[0];
  const route = first.route;
  if (route.type === "app") {
    const others = hits.filter((h) => h !== first && (h.route.type === "app" || h.route.type === "soon")).length;
    if (others > 0) return { ...route, extraLinks: others };
  }
  return route;
}

/** App page par link kis platform ka hai (R3 mismatch check) — undefined = koi supported platform nahi. */
export function platformOfLink(raw: string): PlatformId | undefined {
  const r = resolveRoute(raw, { allowBareUsername: false });
  return r.type === "app" ? r.platform : undefined;
}

export { PLATFORMS, soonById };
