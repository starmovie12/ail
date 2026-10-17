/**
 * Shared server helpers for the Inventions Lab (roadmap PART 7). Each
 * invention route summarises a public profile / transcript and asks Gemini
 * for a structured, fun result. All reuse callGemini + the extractor.
 */
import type { ProfileFeedResult } from "./instagram-extractor";
import type { AiLanguage } from "./ai";

const LANG_LINE: Record<AiLanguage, string> = {
  english: "Write in natural English.",
  hinglish:
    "Write in HINGLISH — casual Hindi in Latin script mixed with English, the way young Indians text (\"Aaj ka vibe ✨\"). No Devanagari.",
  hindi: "Write in natural conversational Hindi (Devanagari).",
};

function avg(ns: number[]) { return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0; }

/** Compact, model-friendly stat block from a public profile feed. */
export function profileFacts(d: ProfileFeedResult): {
  summary: string;
  followers: number; posts: number;
  avgLikes: number; avgComments: number; erPct: number;
  bestShortcode: string | null; nightScore: number; captionStyle: string;
} {
  const list = d.postsList ?? [];
  const avgLikes = avg(list.map((p) => p.likes));
  const avgComments = avg(list.map((p) => p.comments));
  const erPct = d.followers > 0 ? ((avgLikes + avgComments) / d.followers) * 100 : 0;
  const best = [...list].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))[0] ?? null;
  const hours = list.map((p) => p.takenAt).filter(Boolean).map((t) => new Date(t * 1000).getHours());
  const nightPosts = hours.filter((h) => h >= 21 || h < 5).length;
  const nightScore = hours.length ? nightPosts / hours.length : 0;
  const avgCapLen = avg(list.map((p) => p.caption.length));
  const avgTags = avg(list.map((p) => (p.caption.match(/#[\p{L}\p{N}_]+/gu) ?? []).length));
  const captionStyle = avgCapLen > 150 ? "long storyteller" : avgCapLen > 40 ? "medium" : "short & punchy";

  const summary = [
    `@${d.username}${d.fullName ? ` (${d.fullName})` : ""}`,
    `${d.followers} followers, ${d.following} following, ${d.posts} posts`,
    `bio: "${(d.biography || "").slice(0, 200)}"`,
    `recent avg likes ${Math.round(avgLikes)}, avg comments ${Math.round(avgComments)}, engagement ${erPct.toFixed(2)}%`,
    `posts mostly ${nightScore > 0.5 ? "late night" : nightScore > 0.25 ? "evening" : "daytime"}`,
    `captions are ${captionStyle}, ~${Math.round(avgTags)} hashtags/post`,
  ].join("; ");

  return { summary, followers: d.followers, posts: d.posts, avgLikes, avgComments, erPct, bestShortcode: best?.shortcode ?? null, nightScore, captionStyle };
}

/* ── INV-7: Insta Kundli ── */
export function kundliPrompt(facts: string, lang: AiLanguage): string {
  return `You are a witty Instagram jyotish (astrologer). Read this public profile and write a fun "Instagram Kundli". Playful, never mean, PG-13.
PROFILE: ${facts}
Format exactly:
🌟 INSTA-RASHI: (invent a fun sign based on their posting behaviour, e.g. "Reel Rashi: Karka 🦀 — emotional posting", one line)
🔮 PERSONALITY: (2-3 lines reading their vibe from stats + bio)
📅 IS HAFTE KA BHAVISHYA: (a fun 2-line "this week's prediction")
🍀 LUCKY HASHTAG: #something
⏰ LUCKY POSTING TIME:
${LANG_LINE[lang]}`;
}

export function compatibilityPrompt(a: string, b: string, lang: AiLanguage): string {
  return `You are a fun Instagram-astrology compatibility engine. Compare these two public profiles and give a playful "Insta-compatibility" reading. Kind and funny, never mean, PG-13.
PROFILE A: ${a}
PROFILE B: ${b}
Format exactly:
💞 COMPATIBILITY: XX% (a number, with one witty line why)
✨ THEIR DYNAMIC: (2-3 lines — who's the poster, who's the ghost, etc.)
💡 ADVICE: (one fun line)
${LANG_LINE[lang]}`;
}

/* ── INV-4: Voice Cloner ── */
export function voicePrompt(samples: string[], topic: string, lang: AiLanguage): string {
  const s = samples.slice(0, 12).map((c, i) => `${i + 1}. ${c.replace(/\s+/g, " ").slice(0, 300)}`).join("\n");
  return `You are a caption ghost-writer. Study this creator's real recent captions and learn their VOICE — tone, emoji habits, sentence length, structure, how they use hashtags and CTAs.
THEIR CAPTIONS:
${s}
Now write 3 NEW Instagram captions in that exact voice about: ${topic}
Match their style closely but write original content. Number them 1-3.
${lang === "english" ? "Match whatever language THEY write in." : LANG_LINE[lang]}
Output the 3 captions only.`;
}

/* ── INV-5: Crystal Ball (vision) ── */
export const CRYSTAL_PROMPT = `You are a viral content strategist doing a PRE-POST review of this image/frame the creator is about to post.
Give a structured virality report:
🎯 VIRALITY SCORE: XX/100 (honest)
🪝 HOOK: (is there a clear visual hook / text hook? is it readable in 2 seconds?)
🎨 VISUAL: (composition, lighting, colour, scroll-stopping power — 1-2 lines)
📝 CAPTION TIP: (what the caption should do)
⏰ BEST TIME: (suggest a posting window)
✅ VERDICT: "Post it 🚀" or "Fix this first: ..." with the single most important fix
Be specific and honest. If it's low quality say so kindly.`;

/* ── INV-8: Reel Repurposer prompt is registered in lib/ai.ts (AI_PROMPTS.repurpose) ── */

/* ── INV-2: Wrapped personality line ── */
export function wrappedPrompt(facts: string, lang: AiLanguage): string {
  return `Based on this Instagram profile, invent a fun one-line "posting personality" title and a 1-line description, Spotify-Wrapped style.
PROFILE: ${facts}
Format exactly:
TITLE: (e.g. "The Night Owl Poster 🦉" — 2-4 words + emoji)
LINE: (one witty line about their posting personality)
${LANG_LINE[lang]}`;
}
