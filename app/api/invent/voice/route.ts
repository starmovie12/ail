import { NextRequest, NextResponse } from "next/server";
import { extractProfileFeed, ExtractError } from "@/lib/instagram-extractor";
import { callGemini, AiError, type AiLanguage } from "@/lib/ai";
import { voicePrompt } from "@/lib/inventions";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const LANGS: AiLanguage[] = ["english", "hinglish", "hindi"];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("voice:" + ip, 6)) {
    return NextResponse.json({ error: "Too many requests — wait a minute." }, { status: 429 });
  }

  let username = "", topic = "", language: AiLanguage = "english";
  try {
    const b = await req.json();
    username = String(b?.username ?? "").trim();
    topic = String(b?.topic ?? "").trim();
    language = LANGS.includes(b?.language) ? b.language : "english";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!username || !topic) return NextResponse.json({ error: "Username aur topic dono chahiye." }, { status: 400 });

  try {
    const feed = await extractProfileFeed(username);
    const captions = (feed.postsList ?? []).map((p) => p.caption).filter((c) => c && c.length > 15);
    if (captions.length < 2) {
      return NextResponse.json({ error: "Is account ke recent captions kaafi nahi hain — koi aur account try karo jiske captions lambe hon." }, { status: 422 });
    }
    const text = await callGemini([{ text: voicePrompt(captions, topic, language) }]);
    return NextResponse.json({ text, username: feed.username, samples: Math.min(captions.length, 12) });
  } catch (err) {
    if (err instanceof ExtractError) return NextResponse.json({ error: err.message }, { status: 404 });
    if (err instanceof AiError) return NextResponse.json({ error: err.message }, { status: err.code === "NO_KEY" ? 503 : 502 });
    console.error("voice failed:", err);
    return NextResponse.json({ error: "Something went wrong — please try again." }, { status: 500 });
  }
}
