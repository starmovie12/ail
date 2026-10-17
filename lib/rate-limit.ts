/**
 * Simple in-memory rate limiter (per serverless instance).
 * Good enough to stop casual abuse and protect free-tier limits.
 */
const hits = new Map<string, number[]>();

const WINDOW_MS = 60_000;
let lastSweep = Date.now();

export function isRateLimited(ip: string, maxPerMinute: number): boolean {
  const now = Date.now();

  // Occasionally sweep old entries so the map doesn't grow forever.
  if (now - lastSweep > WINDOW_MS * 5) {
    lastSweep = now;
    for (const [key, times] of hits) {
      const fresh = times.filter((t) => now - t < WINDOW_MS);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
  }

  const times = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (times.length >= maxPerMinute) {
    hits.set(ip, times);
    return true;
  }
  times.push(now);
  hits.set(ip, times);
  return false;
}
