import { NextRequest, NextResponse } from "next/server";
import { callGemini, AiError } from "@/lib/ai";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** B11 — image → SEO-friendly alt text (Gemini vision). Image arrives as base64, never stored. */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("alttext:" + ip, 5)) {
    return NextResponse.json({ error: "Slow down a bit — wait a minute between batches." }, { status: 429 });
  }

  let image = "";
  let mimeType = "";
  try {
    const body = await req.json();
    image = String(body?.image ?? "");
    mimeType = String(body?.mimeType ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!image || !ALLOWED_MIME.has(mimeType)) {
    return NextResponse.json({ error: "Send a JPEG, PNG or WebP image." }, { status: 400 });
  }
  // base64 is ~4/3 of the raw size.
  if (image.length > (MAX_IMAGE_BYTES * 4) / 3) {
    return NextResponse.json({ error: "Image too large — keep it under 4MB (compress it first)." }, { status: 413 });
  }

  try {
    const text = await callGemini([
      { inlineData: { mimeType, data: image } },
      {
        text: `Write alt text for this image for Instagram accessibility and SEO.
Give exactly 3 options, numbered:
1. CONCISE (under 100 characters — what the image shows, plainly)
2. DESCRIPTIVE (1-2 sentences — subject, setting, mood, any visible text)
3. KEYWORD-RICH (natural sentence including likely search keywords, no keyword stuffing)
Rules: describe only what is visible, no "image of/photo of" prefixes, no hashtags. Output the 3 options only.`,
      },
    ]);
    return NextResponse.json({ text });
  } catch (err) {
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "NO_KEY" ? 503 : 502 });
    }
    console.error("alt-text failed:", err);
    return NextResponse.json({ error: "Something went wrong — please try again." }, { status: 500 });
  }
}
