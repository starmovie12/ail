import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * E9 — bio link shortener, backed by Upstash Redis (free tier) over plain
 * REST — no SDK dependency. Env-gated: without the env vars the tool shows
 * a friendly "not configured" message instead of breaking.
 *
 * Setup: create a free Upstash Redis DB → set
 *   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=<token>
 */
const TTL_SECONDS = 60 * 60 * 24 * 365; // links live one year

async function redis(cmd: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("redis");
  const json = await res.json();
  return json?.result ?? null;
}

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return Array.from(bytes, (b) => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("").slice(0, 6);
}

export async function POST(req: NextRequest) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json(
      { error: "The shortener isn't configured yet — the site owner needs to add a free Upstash Redis (UPSTASH_REDIS_REST_URL + TOKEN)." },
      { status: 503 }
    );
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("shorten:" + ip, 10)) {
    return NextResponse.json({ error: "Too many links — wait a minute." }, { status: 429 });
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
    target = new URL(raw.startsWith("http") ? raw : "https://" + raw);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid link." }, { status: 400 });
  }
  if (!/^https?:$/.test(target.protocol) || raw.length > 2000) {
    return NextResponse.json({ error: "Only http(s) links up to 2000 characters." }, { status: 400 });
  }
  // Don't shorten ourselves (loops) or localhost/internal names.
  if (/^(localhost|127\.|10\.|192\.168\.|\[)/.test(target.hostname) || !target.hostname.includes(".")) {
    return NextResponse.json({ error: "That host can't be shortened." }, { status: 400 });
  }

  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = randomCode();
      // NX = only set if the code is free (collision-safe).
      const ok = await redis(["SET", `s:${code}`, target.toString(), "NX", "EX", TTL_SECONDS]);
      if (ok === "OK") {
        return NextResponse.json({ code, short: `/s/${code}` });
      }
    }
    return NextResponse.json({ error: "Couldn't allocate a code — try again." }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "The link store is unreachable — try again in a moment." }, { status: 502 });
  }
}
