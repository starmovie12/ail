import { NextRequest, NextResponse } from "next/server";
import { extractProfileFeed, ExtractError } from "@/lib/instagram-extractor";
import { callGemini, AiError, type AiLanguage } from "@/lib/ai";
import { profileFacts, kundliPrompt, compatibilityPrompt } from "@/lib/inventions";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const LANGS: AiLanguage[] = ["english", "hinglish", "hindi"];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("kundli:" + ip, 6)) {
    return NextResponse.json({ error: "Thoda ruko — ek minute baad phir try karo." }, { status: 429 });
  }

  let username = "", username2 = "", language: AiLanguage = "hinglish";
  try {
    const b = await req.json();
    username = String(b?.username ?? "").trim();
    username2 = String(b?.username2 ?? "").trim();
    language = LANGS.includes(b?.language) ? b.language : "hinglish";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!username) return NextResponse.json({ error: "Ek username to daalo." }, { status: 400 });

  try {
    const a = await extractProfileFeed(username);
    const aFacts = profileFacts(a);

    if (username2) {
      const b = await extractProfileFeed(username2);
      const bFacts = profileFacts(b);
      const text = await callGemini([{ text: compatibilityPrompt(aFacts.summary, bFacts.summary, language) }]);
      return NextResponse.json({
        mode: "compatibility", text,
        a: { username: a.username, profilePicHd: a.profilePicHd },
        b: { username: b.username, profilePicHd: b.profilePicHd },
      });
    }

    const text = await callGemini([{ text: kundliPrompt(aFacts.summary, language) }]);
    return NextResponse.json({
      mode: "single", text,
      a: { username: a.username, fullName: a.fullName, profilePicHd: a.profilePicHd, followers: a.followers },
    });
  } catch (err) {
    if (err instanceof ExtractError) return NextResponse.json({ error: err.message }, { status: 404 });
    if (err instanceof AiError) return NextResponse.json({ error: err.message }, { status: err.code === "NO_KEY" ? 503 : 502 });
    console.error("kundli failed:", err);
    return NextResponse.json({ error: "Kuch gadbad ho gayi — phir try karo." }, { status: 500 });
  }
}
