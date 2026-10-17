import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Short-link redirector for /api/shorten. Unknown or expired codes go home. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const home = new URL("/", req.url);

  if (!url || !token || !/^[a-z0-9]{4,10}$/i.test(code)) {
    return NextResponse.redirect(home, 302);
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["GET", `s:${code}`]),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const json = await res.json().catch(() => null);
    const target = typeof json?.result === "string" ? json.result : null;
    if (target && /^https?:\/\//.test(target)) {
      return NextResponse.redirect(target, 302);
    }
  } catch { /* fall through to home */ }
  return NextResponse.redirect(home, 302);
}
