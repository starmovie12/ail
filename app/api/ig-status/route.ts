import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Is Instagram down?" probe. The browser can't ask instagram.com directly
 * (CORS), so we ping two Instagram endpoints from the server and report
 * reachability + latency. No user data involved.
 */
const PROBES = [
  "https://www.instagram.com/favicon.ico",
  "https://static.cdninstagram.com/rsrc.php/favicon.ico",
];

async function probe(url: string, timeoutMs: number) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    // Any HTTP answer (even 4xx) means the servers are alive and responding.
    return { ok: res.status < 500, status: res.status, latencyMs: Date.now() - started };
  } catch {
    return { ok: false, status: 0, latencyMs: Date.now() - started };
  }
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("igstatus:" + ip, 10)) {
    return NextResponse.json({ error: "Too many checks — wait a few seconds." }, { status: 429 });
  }

  const results = await Promise.all(PROBES.map((u) => probe(u, 6000)));
  const up = results.some((r) => r.ok);
  const latencyMs = Math.min(...results.filter((r) => r.ok).map((r) => r.latencyMs), 99999);

  return NextResponse.json({
    up,
    latencyMs: up ? latencyMs : null,
    checkedAt: new Date().toISOString(),
  });
}
