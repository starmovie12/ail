"use client";
/**
 * Unified storage (PRD §15). Sab kuch device ke localStorage me; server par kuch nahi.
 * Har call try/catch me — private mode / quota fail ho to in-memory fallback, app crash nahi.
 */
import { EV, emit } from "./events";

const mem = new Map<string, string>();

export function lsGet(key: string): string | null {
  try { const v = localStorage.getItem(key); return v ?? mem.get(key) ?? null; } catch { return mem.get(key) ?? null; }
}
export function lsSet(key: string, value: string) {
  mem.set(key, value);
  try { localStorage.setItem(key, value); } catch { /* in-memory fallback */ }
}
export function lsRemove(key: string) {
  mem.delete(key);
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}
function readJson<T>(key: string, fallback: T): T {
  try { const raw = lsGet(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}

/* ── Keys ── */
export const K = {
  theme: "ig-theme",
  lang: "ig-lang",
  history: "ig.history.v2",
  prefs: "ig.prefs.v1",
  migrated: "ig.migrated.v2",
  session: "instagrab_session_id",
  cobalt: "instagrab_cobalt_instance",
  handoff: "ig.handoff",
  // purani keys (migrate/delete)
  oldDownloadHistory: "ig.downloadHistory",
  oldGoldenbar: "ig_goldenbar_recent_v1",
  oldNavHistory: "instagrab_history",
} as const;

/* ── Preferences (PRD §13.2) ── */
export type Prefs = {
  autoFetch: boolean;
  autoRoute: boolean;
  autoSave: boolean;
  quality: "hd" | "saver";
  clipboardSuggest: boolean;
  haptics: boolean;
};
export const DEFAULT_PREFS: Prefs = { autoFetch: true, autoRoute: true, autoSave: true, quality: "hd", clipboardSuggest: true, haptics: true };

export function getPrefs(): Prefs {
  const p = readJson<Partial<Prefs>>(K.prefs, {});
  return { ...DEFAULT_PREFS, ...p };
}
export function setPrefs(patch: Partial<Prefs>): Prefs {
  const next = { ...getPrefs(), ...patch };
  lsSet(K.prefs, JSON.stringify(next));
  emit(EV.settingsUpdated);
  return next;
}

/* ── Advanced: Session ID + Cobalt (purani keys, saved values chalengi) ── */
export function getSessionId(): string { return lsGet(K.session) ?? ""; }
export function getCobaltInstance(): string { return lsGet(K.cobalt) ?? ""; }
export function setAdvanced(sessionId: string, cobalt: string) {
  if (sessionId.trim()) lsSet(K.session, sessionId.trim()); else lsRemove(K.session);
  if (cobalt.trim()) lsSet(K.cobalt, cobalt.trim()); else lsRemove(K.cobalt);
  emit(EV.settingsUpdated);
}

/* ── History v2 ── */
export type GrabPlatform = "instagram" | "facebook" | "tiktok" | "youtube" | "pinterest" | "x" | "threads";
export type GrabKind = "reel" | "story" | "photo" | "carousel" | "video" | "profile" | "audio" | "thumbnail" | "other";
export type GrabRecord = {
  id: string;
  platform: GrabPlatform;
  kind: GrabKind;
  url: string;
  author?: string;
  title?: string;
  thumbnail?: string;
  at: number;
};
export const HISTORY_MAX = 60;

export function getHistory(): GrabRecord[] {
  const list = readJson<GrabRecord[]>(K.history, []);
  return Array.isArray(list) ? list.filter((r) => r && typeof r.url === "string") : [];
}
function saveHistory(list: GrabRecord[]) {
  lsSet(K.history, JSON.stringify(list.slice(0, HISTORY_MAX)));
  emit(EV.historyUpdated);
}
export function addHistory(rec: Omit<GrabRecord, "id" | "at">) {
  const list = getHistory().filter((r) => r.url !== rec.url);
  list.unshift({ ...rec, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now() });
  saveHistory(list);
}
export function removeHistory(id: string): GrabRecord | undefined {
  const list = getHistory();
  const hit = list.find((r) => r.id === id);
  saveHistory(list.filter((r) => r.id !== id));
  return hit;
}
export function restoreHistory(rec: GrabRecord) {
  const list = getHistory();
  if (list.some((r) => r.id === rec.id)) return;
  list.push(rec);
  list.sort((a, b) => b.at - a.at);
  saveHistory(list);
}
export function clearHistory() { lsRemove(K.history); emit(EV.historyUpdated); }

/** 7-din streak jaisi cheez: lagatar din jahan koi grab hua (History title row ka Flame chip). */
export function streakDays(list: GrabRecord[] = getHistory()): number {
  const days = new Set(list.map((r) => new Date(r.at).toDateString()));
  let n = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.now() - i * 86_400_000).toDateString();
    if (days.has(d)) n++; else if (i > 0) break; else continue;
  }
  return n;
}

/* ── Migration (ek baar) — A3 ── */
const LABEL_TO_PLATFORM: Record<string, GrabPlatform> = {
  instagram: "instagram", "ig reel": "instagram", "ig story": "instagram", "ig post": "instagram", "@": "instagram",
  facebook: "facebook", tiktok: "tiktok", youtube: "youtube", pinterest: "pinterest", threads: "threads", "x / twitter": "x", x: "x", twitter: "x",
};
function labelPlatform(label: string | undefined): GrabPlatform {
  const l = (label ?? "").toLowerCase();
  if (l.startsWith("@")) return "instagram";
  return LABEL_TO_PLATFORM[l] ?? "instagram";
}
export function migrateOnce() {
  if (lsGet(K.migrated)) return;
  try {
    const merged: GrabRecord[] = [...getHistory()];
    const old1 = readJson<{ shortcode: string; kind?: string; username?: string; thumbnail?: string; at?: number }[]>(K.oldDownloadHistory, []);
    for (const h of Array.isArray(old1) ? old1 : []) {
      if (!h?.shortcode) continue;
      merged.push({
        id: `m1-${h.shortcode}`, platform: "instagram",
        kind: (["reel", "story", "photo", "carousel", "video"].includes(h.kind ?? "") ? h.kind : "other") as GrabKind,
        url: `https://www.instagram.com/p/${h.shortcode}/`, author: h.username ? "@" + h.username : undefined,
        thumbnail: h.thumbnail || undefined, at: h.at ?? Date.now(),
      });
    }
    const old2 = readJson<{ input?: string; platform?: string; title?: string; thumbnail?: string; timestamp?: number }[]>(K.oldGoldenbar, []);
    for (const h of Array.isArray(old2) ? old2 : []) {
      if (!h?.input) continue;
      merged.push({
        id: `m2-${h.timestamp ?? Math.random().toString(36).slice(2)}`, platform: labelPlatform(h.platform), kind: "other",
        url: h.input, title: h.title, thumbnail: h.thumbnail, at: h.timestamp ?? Date.now(),
      });
    }
    const seen = new Set<string>();
    const deduped = merged
      .sort((a, b) => b.at - a.at)
      .filter((r) => (seen.has(r.url) ? false : (seen.add(r.url), true)))
      .slice(0, HISTORY_MAX);
    if (deduped.length) lsSet(K.history, JSON.stringify(deduped));
    lsRemove(K.oldDownloadHistory); lsRemove(K.oldGoldenbar); lsRemove(K.oldNavHistory);
    lsSet(K.migrated, "1");
  } catch { /* best-effort */ }
}

/* ── Handoff (sessionStorage, ek-baar-padho, 60s TTL) — PRD §7.6.6 ── */
export type Handoff = { url: string; kind?: string; src: "home" | "history"; t: number };
const HANDOFF_TTL = 60_000;

export function setHandoff(h: Omit<Handoff, "t">): boolean {
  try { sessionStorage.setItem(K.handoff, JSON.stringify({ ...h, t: Date.now() })); return true; } catch { return false; }
}
let lastTaken: { h: Handoff | null; at: number } | null = null;
/** Padhte hi delete. React StrictMode ke double-effect ke liye 1.5s cache; refresh par module reset hota hai. */
export function takeHandoff(): Handoff | null {
  if (lastTaken && Date.now() - lastTaken.at < 1500) return lastTaken.h;
  let h: Handoff | null = null;
  try {
    const raw = sessionStorage.getItem(K.handoff);
    if (raw) {
      sessionStorage.removeItem(K.handoff);
      const p = JSON.parse(raw) as Handoff;
      if (p && typeof p.url === "string" && Date.now() - (p.t ?? 0) <= HANDOFF_TTL) h = p;
    }
  } catch { /* blocked */ }
  lastTaken = { h, at: Date.now() };
  return h;
}

/* ── Reset all (theme + language bache rahenge) — §13.4 ── */
export function resetAllLocalData() {
  for (const k of [K.history, K.prefs, K.session, K.cobalt, K.migrated, "ig.recentTools", "ig.recentSearches", "ig.streak", "ig.tourDone", "ig.sound", "ig-install-dismissed"]) lsRemove(k);
  try { sessionStorage.removeItem(K.handoff); } catch { /* ignore */ }
  emit(EV.historyUpdated); emit(EV.settingsUpdated);
}
