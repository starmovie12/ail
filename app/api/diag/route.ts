import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { diagnoseInstagram, parseInstagramUrl } from "@/lib/instagram-extractor";
import { diagnoseFacebook } from "@/lib/facebook-extractor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Diagnostic: "download kyun nahi ho raha?" ka jawab SERVER se.
 *
 * Browser me kholo:
 *   /api/diag?url=https://www.instagram.com/reel/XXXXXXXXXXX/
 *   /api/diag?url=https://www.facebook.com/reel/1234567890123456
 *
 * Har engine alag chalke batata hai: HTTP status, login-wall, kaun chala / kaun block hua.
 * Koi cookie / key / session output me NAHI aata (sirf "set hai ya nahi"). Rate-limited.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("diag:" + ip, 5)) {
    return NextResponse.json({ error: "Too many checks — wait a minute." }, { status: 429 });
  }

  const raw = (req.nextUrl.searchParams.get("url") ?? "").trim();
  if (!raw || raw.length > 600) {
    return NextResponse.json({ error: "Add ?url=<instagram or facebook link>" }, { status: 400 });
  }

  const env = {
    vercelRegion: process.env.VERCEL_REGION ?? "unknown",
    instagramSessionConfigured: Boolean(process.env.INSTAGRAM_SESSION_ID),
    fallbackApiConfigured: Boolean(process.env.FALLBACK_API_URL),
    cobaltConfigured: Boolean(process.env.COBALT_INSTANCE),
  };

  const pretty = (body: unknown) =>
    new NextResponse(JSON.stringify(body, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });

  if (/instagram\.com|instagr\.am/i.test(raw)) {
    const parsed = parseInstagramUrl(raw);
    if (!parsed) return pretty({ error: "Could not read an Instagram post/reel code from that link.", env });
    const rows = await diagnoseInstagram(parsed.shortcode);
    return pretty({ platform: "instagram", shortcode: parsed.shortcode, env, anyEngineWorks: rows.some((r) => r.ok && r.engine.startsWith("engine") || r.ok && r.engine.startsWith("third")), rows });
  }

  if (/facebook\.com|fb\.watch|fb\.me/i.test(raw)) {
    const d = await diagnoseFacebook(raw);
    return pretty({ platform: "facebook", env, ...d, anyEngineWorks: d.rows.some((r) => r.ok) });
  }

  return pretty({ error: "Only Instagram and Facebook links are supported here.", env });
}
