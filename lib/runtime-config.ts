/**
 * Runtime-editable Instagram config. The hardcoded defaults live in
 * instagram-config.ts; the admin panel writes overrides to Upstash Redis
 * (env-gated) so doc_id etc. can be changed WITHOUT a code deploy.
 *
 * getLiveConfig() = { ...IG_CONFIG, ...admin overrides }, cached ~60s.
 * With no Redis configured it returns the hardcoded defaults instantly.
 */
import { IG_CONFIG } from "./instagram-config";

const KV_URL = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const CONFIG_KEY = "ig:config";

/** String fields the admin panel may override. */
export const STRING_FIELDS = [
  "docId",
  "appId",
  "lsd",
  "userAgent",
  "graphqlUrl",
  "webProfileInfoUrl",
  "fallbackApiUrl",
  "fallbackApiKey",
  "fallbackApiKeyHeader",
  "fallbackProfileApiUrl",
] as const;

export type ConfigOverride = Partial<
  Record<(typeof STRING_FIELDS)[number], string> & {
    rateLimitPerMinute: number;
    useFallbackApi: boolean;
  }
>;

export type LiveConfig = typeof IG_CONFIG;

export function kvConfigured(): boolean {
  return !!(KV_URL && KV_TOKEN);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function kvCmd(cmd: (string | number)[]): Promise<any> {
  if (!KV_URL || !KV_TOKEN) return null;
  const res = await fetch(KV_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("kv");
  const json = await res.json();
  return json?.result ?? null;
}

export async function getConfigOverride(): Promise<ConfigOverride> {
  if (!kvConfigured()) return {};
  try {
    const raw = (await kvCmd(["GET", CONFIG_KEY])) as string | null;
    return raw ? (JSON.parse(raw) as ConfigOverride) : {};
  } catch {
    return {};
  }
}

/** Persist the admin's override object (and drop the cache so it applies fast). */
export async function saveConfigOverride(ov: ConfigOverride): Promise<boolean> {
  if (!kvConfigured()) return false;
  cache = null;
  try {
    const ok = await kvCmd(["SET", CONFIG_KEY, JSON.stringify(ov)]);
    return ok === "OK";
  } catch {
    return false;
  }
}

let cache: { at: number; cfg: LiveConfig } | null = null;

/** The effective config used by the extractor — defaults with admin overrides applied. */
export async function getLiveConfig(): Promise<LiveConfig> {
  if (cache && Date.now() - cache.at < 60_000) return cache.cfg;
  const ov = await getConfigOverride();
  const merged: LiveConfig = { ...IG_CONFIG };
  for (const k of STRING_FIELDS) {
    const v = ov[k];
    if (typeof v === "string" && v.trim()) (merged as Record<string, unknown>)[k] = v.trim();
  }
  if (typeof ov.rateLimitPerMinute === "number" && ov.rateLimitPerMinute > 0) {
    merged.rateLimitPerMinute = ov.rateLimitPerMinute;
  }
  if (typeof ov.useFallbackApi === "boolean") merged.useFallbackApi = ov.useFallbackApi;
  cache = { at: Date.now(), cfg: merged };
  return merged;
}

/** Force the next getLiveConfig() to re-read (used right after a save). */
export function clearConfigCache() {
  cache = null;
}
