"use client";
/**
 * Client-side grab helper (PRD §16.1) — GoldenBar ki inline fetch-ladder yahan nikali gayi.
 * Settings ka Session ID / Cobalt URL ab asli me API tak jaate hain (A5): sirf POST JSON body me,
 * kabhi URL/query me nahi; Session ID sirf Instagram requests ke saath.
 */
import { normalizeApiResponse, type ExtractedResult } from "./normalize";
import { getCobaltInstance, getSessionId } from "./storage";
import { resolveRoute } from "./router";
import type { PlatformId } from "./platforms";

export type ErrorCode = "PRIVATE" | "INVALID_URL" | "EXTRACTOR_DOWN" | "RATE_LIMITED" | "STORY_EXPIRED" | "OFFLINE" | "NOT_FOUND";
export type GrabOk = { ok: true; data: ExtractedResult; platform: PlatformId };
export type GrabErr = { ok: false; code: ErrorCode; message: string };
export type GrabResult = GrabOk | GrabErr;

const CODES: ErrorCode[] = ["PRIVATE", "INVALID_URL", "EXTRACTOR_DOWN", "RATE_LIMITED", "STORY_EXPIRED", "OFFLINE", "NOT_FOUND"];

function codeFrom(status: number, body: unknown): { code: ErrorCode; message: string } {
  let raw = "";
  let message = "";
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (b.error && typeof b.error === "object") {
      const e = b.error as Record<string, unknown>;
      raw = String(e.code ?? "");
      message = String(e.message ?? "");
    } else {
      raw = String(b.code ?? "");
      message = typeof b.error === "string" ? b.error : typeof b.message === "string" ? b.message : "";
    }
  }
  let code: ErrorCode | undefined = CODES.includes(raw as ErrorCode) ? (raw as ErrorCode) : undefined;
  if (!code) {
    if (raw === "INVALID_USERNAME") code = "INVALID_URL";
    else if (raw === "NO_STORIES" || raw === "STORY_UNSUPPORTED") code = "STORY_EXPIRED";
    else if (status === 429) code = "RATE_LIMITED";
    else if (status === 400) code = "INVALID_URL";
    else if (status === 404) code = "NOT_FOUND";
    else code = "EXTRACTOR_DOWN";
  }
  return { code, message };
}

async function postJson(path: string, body: unknown, signal?: AbortSignal): Promise<{ res: Response; json: unknown }> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal });
  const json = await res.json().catch(() => null);
  return { res, json };
}

function youtubeId(input: string): string | null {
  const v = input.trim();
  const direct = v.match(/^[\w-]{11}$/);
  if (direct) return direct[0];
  const m = v.match(/(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : null;
}

/** YouTube — sirf thumbnail, network ke bina (i.ytimg.com download proxy se). */
export function youtubeThumbnail(input: string): ExtractedResult | null {
  const id = youtubeId(input);
  if (!id) return null;
  const sizes = [
    { file: "maxresdefault", label: "Full HD · 1280×720" },
    { file: "sddefault", label: "SD · 640×480" },
    { file: "hqdefault", label: "High · 480×360" },
  ];
  return {
    success: true, platform: "youtube", type: "thumbnail", title: "YouTube thumbnail", caption: "",
    author: {}, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    url: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    media: sizes.map((s) => ({ url: `https://i.ytimg.com/vi/${id}/${s.file}.jpg`, type: "image" as const, thumbnail: `https://i.ytimg.com/vi/${id}/${s.file}.jpg`, quality: s.label, filename: `youtube-${id}-${s.file}.jpg` })),
  };
}

export async function grab(opts: { input: string; platform?: PlatformId; mode?: string; signal?: AbortSignal }): Promise<GrabResult> {
  const input = opts.input.trim();
  if (!input) return { ok: false, code: "INVALID_URL", message: "" };
  const route = resolveRoute(input, { allowBareUsername: true });
  const platform: PlatformId | undefined = opts.platform ?? (route.type === "app" ? route.platform : undefined);
  if (!platform) return { ok: false, code: "INVALID_URL", message: "" };
  const sessionId = platform === "instagram" ? getSessionId() : "";
  const cobaltInstance = getCobaltInstance();

  try {
    // YouTube: sirf thumbnail
    if (platform === "youtube") {
      const t = youtubeThumbnail(input);
      return t ? { ok: true, data: t, platform } : { ok: false, code: "INVALID_URL", message: "" };
    }

    // Instagram @username / profile → DP
    const isProfile = platform === "instagram" && ((route.type === "app" && route.kind === "profile") || opts.mode === "profile");
    if (isProfile) {
      const username = (route.type === "app" ? route.url : input).replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").split(/[/?#]/)[0];
      const { res, json } = await postJson("/api/profile", { type: "dp", username, ...(sessionId ? { sessionId } : {}) }, opts.signal);
      if (!res.ok) { const e = codeFrom(res.status, json); return { ok: false, ...e }; }
      const p = json as Record<string, unknown>;
      const data = normalizeApiResponse({ ...p, type: "profile", platform: "instagram", postsCount: p.posts }, "@" + username);
      data.type = "profile";
      return { ok: true, data, platform };
    }

    // Unified extractor — sab platforms
    const url = route.type === "app" ? (route.url.startsWith("@") ? input : route.url) : input;
    const body: Record<string, unknown> = { url, mode: opts.mode };
    if (sessionId) body.sessionId = sessionId;
    if (cobaltInstance) body.cobaltInstance = cobaltInstance;
    const first = await postJson("/api/extract", body, opts.signal);
    let payload: unknown = first.res.ok ? first.json : null;
    let failure = first.res.ok ? null : codeFrom(first.res.status, first.json);

    // Fallback ladder (purane GoldenBar jaisa)
    if (!payload && failure && failure.code !== "RATE_LIMITED" && failure.code !== "PRIVATE") {
      if (platform === "x") {
        const r = await postJson("/api/twitter", { url }, opts.signal);
        if (r.res.ok && !(r.json as Record<string, unknown> | null)?.error) payload = r.json;
      } else if (platform !== "instagram") {
        const r = await postJson("/api/og-extract", { url }, opts.signal);
        if (r.res.ok && !(r.json as Record<string, unknown> | null)?.error) payload = r.json;
      } else {
        const r = await postJson("/api/og-extract", { url }, opts.signal);
        if (r.res.ok && !(r.json as Record<string, unknown> | null)?.error) payload = r.json;
      }
    }
    if (!payload) return { ok: false, ...(failure ?? { code: "EXTRACTOR_DOWN" as ErrorCode, message: "" }) };

    const data = normalizeApiResponse(payload, input);
    data.platform = data.platform && data.platform !== "instagram" ? data.platform : platform;
    if (!data.media?.length && !data.author?.avatar && !data.url) return { ok: false, code: "NOT_FOUND", message: "" };
    return { ok: true, data, platform };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    return { ok: false, code: offline ? "OFFLINE" : "EXTRACTOR_DOWN", message: "" };
  }
}

/** Instagram profile ke extra panels: stories + highlights. */
export async function profileExtras(username: string, type: "stories" | "highlights" | "highlight-items", extra: { highlightId?: string } = {}, signal?: AbortSignal) {
  const sessionId = getSessionId();
  const { res, json } = await postJson("/api/profile", { type, username, ...extra, ...(sessionId ? { sessionId } : {}) }, signal);
  if (!res.ok) return { ok: false as const, ...codeFrom(res.status, json) };
  return { ok: true as const, json: json as Record<string, unknown> };
}
