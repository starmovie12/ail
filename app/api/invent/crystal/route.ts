import { NextRequest, NextResponse } from "next/server";
import { callGemini, AiError } from "@/lib/ai";
import { CRYSTAL_PROMPT } from "@/lib/inventions";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

/** INV-5 — pre-post virality review of an image/frame via Gemini vision. */
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("crystal:" + ip, 5)) {
    return NextResponse.json({ error: "Slow down a bit — wait a minute." }, { status: 429 });
  }

  let image = "", mimeType = "", caption = "";
  try {
    const b = await req.json();
    image = String(b?.image ?? "");
    mimeType = String(b?.mimeType ?? "");
    caption = String(b?.caption ?? "").slice(0, 500);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!image || !ALLOWED.has(mimeType)) {
    return NextResponse.json({ error: "Send a JPEG, PNG or WebP image." }, { status: 400 });
  }
  if (image.length > (MAX_BYTES * 4) / 3) {
    return NextResponse.json({ error: "Image too large — keep it under 4MB." }, { status: 413 });
  }

  try {
    const prompt = caption
      ? `${CRYSTAL_PROMPT}\n\nThe creator's planned caption is: "${caption}" — factor it into the caption tip.`
      : CRYSTAL_PROMPT;
    const text = await callGemini([
      { inlineData: { mimeType, data: image } },
      { text: prompt },
    ]);
    return NextResponse.json({ report: text });
  } catch (err) {
    if (err instanceof AiError) return NextResponse.json({ error: err.message }, { status: err.code === "NO_KEY" ? 503 : 502 });
    console.error("crystal failed:", err);
    return NextResponse.json({ error: "Something went wrong — please try again." }, { status: 500 });
  }
}
