"use client";
/**
 * Tiny localStorage-backed retention helpers: which tools you used recently.
 * Everything stays on-device — nothing is sent to a server (privacy USP).
 */

const RECENT_KEY = "ig.recentTools";
const RECENT_MAX = 8;

function read(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / private mode — retention is best-effort */
  }
}

/** Record a visit to a tool page (href like "/reels-downloader"). */
export function recordToolVisit(href: string) {
  const list = read(RECENT_KEY).filter((h) => h !== href);
  list.unshift(href);
  write(RECENT_KEY, list.slice(0, RECENT_MAX));
}

/** Most-recently-used tool hrefs, newest first. */
export function getRecentTools(): string[] {
  return read(RECENT_KEY);
}

/* ── Download history (H1) — private, on-device only ── */

export type HistoryItem = {
  shortcode: string;
  kind: string;
  username: string;
  thumbnail: string;
  at: number; // ms epoch
};

const HISTORY_KEY = "ig.downloadHistory";
const HISTORY_MAX = 60;

export function recordDownload(item: Omit<HistoryItem, "at">) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: HistoryItem[] = raw ? JSON.parse(raw) : [];
    const next = [{ ...item, at: Date.now() }, ...list.filter((h) => h.shortcode !== item.shortcode)];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, HISTORY_MAX)));
  } catch { /* best-effort */ }
}

export function getDownloadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

export function clearDownloadHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch {}
}

/* ── Recent searches (I10) — chips under the golden bar ── */

const SEARCH_KEY = "ig.recentSearches";

export function recordSearch(value: string) {
  try {
    const v = value.trim().slice(0, 200);
    if (!v) return;
    const raw = localStorage.getItem(SEARCH_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [v, ...list.filter((x) => x !== v)].slice(0, 5);
    localStorage.setItem(SEARCH_KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch { return []; }
}

/* ── Sound toggle (I11) — subtle coin-clink on downloads, default OFF ── */

const SOUND_KEY = "ig.sound";

export function isSoundOn(): boolean {
  try { return localStorage.getItem(SOUND_KEY) === "1"; } catch { return false; }
}

export function setSoundOn(on: boolean) {
  try { localStorage.setItem(SOUND_KEY, on ? "1" : "0"); } catch {}
}

/** Two quick sine pings — a tiny coin clink, synthesized so no audio asset is needed. */
export function playCoin() {
  if (!isSoundOn()) return;
  try {
    const AC: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    [[1320, 0], [1760, 0.07]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    });
    setTimeout(() => ctx.close(), 600);
  } catch { /* no audio — fine */ }
}

const STREAK_KEY = "ig.streak";

function localDay(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Bump today's visit streak and return the current count (H4 — subtle gamification). */
export function bumpStreak(): number {
  try {
    const today = localDay();
    const raw = localStorage.getItem(STREAK_KEY);
    const s: { last: string; count: number } | null = raw ? JSON.parse(raw) : null;
    if (s?.last === today) return s.count;
    const count = s?.last === localDay(-1) ? s.count + 1 : 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify({ last: today, count }));
    return count;
  } catch {
    return 0;
  }
}
