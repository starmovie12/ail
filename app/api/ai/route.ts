import { NextRequest, NextResponse } from "next/server";
import { AI_PROMPTS, LANG_AWARE, callGemini, AiError, type AiLanguage } from "@/lib/ai";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LANGS: AiLanguage[] = ["english", "hinglish", "hindi"];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // AI calls burn the free Gemini quota — keep the per-IP ceiling low.
  if (isRateLimited("ai:" + ip, 8)) {
    return NextResponse.json(
      { error: "Whoa, that's a lot of AI — wait a minute and try again." },
      { status: 429 }
    );
  }

  let tool = "";
  let inputs: Record<string, string> = {};
  let language: AiLanguage = "english";
  try {
    const body = await req.json();
    tool = String(body?.tool ?? "");
    language = LANGS.includes(body?.language) ? body.language : "english";
    const raw = body?.inputs ?? {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string" && k.length <= 30) inputs[k] = v.slice(0, 5000);
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const builder = AI_PROMPTS[tool];
  if (!builder) return NextResponse.json({ error: "Unknown AI tool." }, { status: 400 });
  if (!LANG_AWARE.has(tool)) language = "english";

  try {
    const text = await callGemini([{ text: builder(inputs, language) }]);
    return NextResponse.json({ text });
  } catch (err) {
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "NO_KEY" ? 503 : 502 });
    }
    console.error("ai route failed:", err);
    return NextResponse.json({ error: "Something went wrong — please try again." }, { status: 500 });
  }
}
