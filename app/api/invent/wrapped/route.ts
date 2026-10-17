import { NextRequest, NextResponse } from "next/server";
import { extractProfileFeed, ExtractError } from "@/lib/instagram-extractor";
import { callGemini, type AiLanguage } from "@/lib/ai";
import { profileFacts, wrappedPrompt } from "@/lib/inventions";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const LANGS: AiLanguage[] = ["english", "hinglish", "hindi"];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited("wrapped:" + ip, 6)) {
    return NextResponse.json({ error: "Too many requests — wait a minute." }, { status: 429 });
  }

  let username = "", language: AiLanguage = "hinglish";
  try {
    const b = await req.json();
    username = String(b?.username ?? "").trim();
    language = LANGS.includes(b?.language) ? b.language : "hinglish";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!username) return NextResponse.json({ error: "Enter a username." }, { status: 400 });

  try {
    const feed = await extractProfileFeed(username);
    const f = profileFacts(feed);
    const best = (feed.postsList ?? []).find((p) => p.shortcode === f.bestShortcode) ?? null;

    // Personality line is a nice-to-have; if AI isn't configured, fall back.
    let title = f.nightScore > 0.5 ? "The Night Owl 🦉" : f.nightScore > 0.25 ? "The Golden Hour Poster 🌇" : "The Daylight Creator ☀️";
    let line = "";
    try {
      const text = await callGemini([{ text: wrappedPrompt(f.summary, language) }]);
      const t = text.match(/TITLE:\s*(.+)/i)?.[1]?.trim();
      const l = text.match(/LINE:\s*(.+)/i)?.[1]?.trim();
      if (t) title = t;
      if (l) line = l;
    } catch { /* AI optional — the visual wrapped still works */ }

    return NextResponse.json({
      username: feed.username,
      fullName: feed.fullName,
      profilePicHd: feed.profilePicHd,
      isVerified: feed.isVerified,
      stats: {
        followers: feed.followers,
        following: feed.following,
        posts: feed.posts,
        avgLikes: Math.round(f.avgLikes),
        avgComments: Math.round(f.avgComments),
        erPct: Number(f.erPct.toFixed(2)),
        captionStyle: f.captionStyle,
        nightScore: Number(f.nightScore.toFixed(2)),
      },
      bestPost: best ? { shortcode: best.shortcode, thumbnail: best.thumbnail, likes: best.likes, comments: best.comments } : null,
      personality: { title, line },
    });
  } catch (err) {
    if (err instanceof ExtractError) return NextResponse.json({ error: err.message }, { status: 404 });
    console.error("wrapped failed:", err);
    return NextResponse.json({ error: "Something went wrong — please try again." }, { status: 500 });
  }
}
