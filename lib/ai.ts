/**
 * Server-side AI helpers: prompt templates per tool + the Gemini REST caller.
 * One shared route (/api/ai) serves every AI tool — each tool is just a
 * prompt builder here. Language param powers the Hinglish USP.
 */

export type AiLanguage = "english" | "hinglish" | "hindi";

const LANG_LINE: Record<AiLanguage, string> = {
  english: "Write in natural English.",
  hinglish:
    "Write in HINGLISH — casual Hindi written in the Latin script, mixed naturally with English, the way young Indians actually text (e.g. \"Aaj ka vibe ✨\", \"Scene kya hai?\"). Do NOT use Devanagari script.",
  hindi: "Write in Hindi using Devanagari script, natural and conversational.",
};

type Inputs = Record<string, string>;
const clean = (s: string, max = 600) => s.replace(/\s+/g, " ").trim().slice(0, max);

type PromptBuilder = (inputs: Inputs, lang: AiLanguage) => string;

export const AI_PROMPTS: Record<string, PromptBuilder> = {
  "caption-generator": (i, l) => `You are an expert Instagram copywriter.
Write 5 distinct Instagram captions about: ${clean(i.topic)}
Tone: ${clean(i.tone || "casual")}. Length: ${clean(i.length || "medium")} (short=1 line, medium=2-3 lines, long=4-6 lines).
${i.cta ? `End each with a call-to-action along the lines of: ${clean(i.cta)}` : "Include a natural call-to-action in at least 2 of them."}
Use emojis ${i.emoji === "no" ? "sparingly (max 1)" : "naturally (2-4 per caption)"}.
${LANG_LINE[l]}
Number them 1-5. No hashtags inside the captions. No preamble — captions only.`,

  "hashtag-generator": (i) => `You are an Instagram growth expert.
Generate exactly 30 Instagram hashtags for the niche/topic: ${clean(i.topic)}
Organize into three labelled groups of 10:
HIGH REACH (1M+ posts), MEDIUM REACH (100K-1M posts), NICHE (under 100K posts, highly specific).
Rules: all lowercase, no duplicates, no banned/spammy tags, every tag genuinely relevant.
After the groups, add a final line "COPY-ALL:" followed by all 30 tags space-separated. No other commentary.`,

  "bio-generator": (i, l) => `You are an Instagram bio expert.
Write 10 Instagram bios for: ${clean(i.profession)}
Vibe: ${clean(i.vibe || "clean and confident")}. ${i.emoji === "no" ? "No emojis." : "Use emojis tastefully."}
HARD RULE: each bio must be 150 characters or fewer (Instagram's limit) — count carefully.
Mix formats: one-liners, 2-3 line stacked bios (use line breaks), with a CTA in some.
${LANG_LINE[l]}
Number them 1-10. No commentary.`,

  "reel-script-generator": (i, l) => `You are a viral short-form video scriptwriter.
Write a complete Instagram Reel script about: ${clean(i.topic)}
Target duration: ${clean(i.duration || "30")} seconds.
${LANG_LINE[l]}
Format exactly:
HOOK (first 2 seconds, scroll-stopping):
SCRIPT (timed beats, what to say):
ON-SCREEN TEXT (short overlays per beat):
CTA (last line):
B-ROLL IDEAS (3 quick shot suggestions):
Keep it punchy and specific — no generic filler.`,

  "hook-generator": (i, l) => `You are a viral content strategist.
Write 10 scroll-stopping first lines (hooks) for Instagram Reels about: ${clean(i.topic)}
Use proven viral patterns: bold claim, negative warning ("Stop doing X"), curiosity gap, specific number, POV, "nobody tells you", before/after.
${LANG_LINE[l]}
Number them 1-10, one line each. No explanations.`,

  "content-ideas": (i, l) => `You are an Instagram content strategist.
Generate 30 content ideas for the niche: ${clean(i.topic)}
Mix: 15 Reel ideas, 10 post/carousel ideas, 5 Story ideas — label each [REEL] [POST] [STORY].
Each idea = one specific line someone could film today (not vague themes).
${LANG_LINE[l]}
Number 1-30. No commentary.`,

  "username-generator": (i) => `You are a brand-naming expert.
Suggest 20 available-style Instagram usernames for someone named "${clean(i.name, 80)}" in the niche: ${clean(i.topic || "general", 120)}
Rules: lowercase letters/numbers/dots/underscores only, max 24 chars, no consecutive dots, memorable and spellable, avoid spammy digit-strings.
Mix styles: clean, with niche keyword, with prefix (the., its.), with suffix (.co, .official, _in).
Number 1-20, one handle per line, no @ symbol, no commentary.`,

  "giveaway-caption": (i, l) => `You are an Instagram giveaway expert.
Write a complete giveaway announcement caption.
Prize: ${clean(i.prize)}
Rules to enter: ${clean(i.rules || "follow + like + tag friends")}
Deadline: ${clean(i.deadline || "one week from now")}
Structure: exciting opener → prize details → clear numbered entry steps → deadline + winner announcement note → 3-5 relevant hashtags.
${LANG_LINE[l]}
Make it feel premium, not spammy. One caption only.`,

  "reply-generator": (i, l) => `You are a social media manager known for great comment replies.
Someone commented this on an Instagram post: "${clean(i.comment)}"
Write 5 reply options in a ${clean(i.vibe || "friendly")} voice.
Keep each under 100 characters, sound human (not corporate), emoji where natural.
${LANG_LINE[l]}
Number 1-5. No commentary.`,

  "caption-translator": (i) => `You are a native-quality translator for social media.
Translate this Instagram caption into ${clean(i.target || "Hindi", 60)}:
"""${clean(i.caption, 1500)}"""
Rules: keep it natural and casual for Instagram (not literal/formal), preserve all hashtags EXACTLY as-is (do not translate them), preserve emojis and @mentions, keep line breaks.
Output only the translated caption.`,

  "growth-strategy": (i, l) => `You are an Instagram growth coach.
Create a personalised 30-day growth plan.
Current followers: ${clean(i.followers, 40)}. Niche: ${clean(i.topic)}. Goal: ${clean(i.goal || "grow followers and engagement")}
Format: WEEK 1-4 sections, each with 3-4 specific actions (posting cadence, content types, engagement tactics, one experiment). End with 3 metrics to track.
${LANG_LINE[l]}
Be specific to the niche — no generic advice like "post consistently" without saying what exactly.`,

  "story-poll-ideas": (i, l) => `You are an Instagram Stories engagement expert.
Generate 15 interactive Story ideas for the niche: ${clean(i.topic)}
Mix: 5 poll ideas (with both options written), 5 question-box prompts, 5 quiz/slider ideas.
Each = one line, ready to type into the sticker. Label each [POLL] [QUESTION] [QUIZ].
${LANG_LINE[l]}
Number 1-15. No commentary.`,

  "carousel-outline": (i, l) => `You are a viral carousel-post strategist.
Create a 10-slide Instagram carousel outline about: ${clean(i.topic)}
Format exactly:
SLIDE 1 (HOOK — big bold line that stops the scroll):
SLIDE 2-9 (one clear point per slide, max 25 words each, with a suggested visual):
SLIDE 10 (CTA — save/share/follow ask):
Then add: CAPTION (2-3 lines) and 10 HASHTAGS.
${LANG_LINE[l]}
Make each slide punchy enough to survive being read in 2 seconds.`,

  roast: (i, l) => `You are a stand-up comedian doing a light-hearted roast of an Instagram profile. Be funny and cheeky but never cruel, never body-shame, never touch religion/politics, keep it PG-13.
Profile: @${clean(i.username, 40)}
Bio: "${clean(i.bio, 300)}"
Followers: ${clean(i.followers, 20)}, Following: ${clean(i.following, 20)}, Posts: ${clean(i.posts, 20)}, Engagement rate: ${clean(i.er, 20)}%
Write a 4-6 line roast a friend would send in the group chat, then end with one genuinely nice compliment line starting "But real talk —".
${LANG_LINE[l]}`,

  remix: (i, l) => `You are a viral content strategist. A creator wants to remix a viral Reel's formula for their own niche.
VIRAL REEL TRANSCRIPT:
"""${clean(i.transcript, 4000)}"""
THE CREATOR'S NICHE: ${clean(i.niche)}
Produce:
WHY IT WENT VIRAL (2-3 bullet analysis of the formula):
REMIXED SCRIPT (same structure/formula, fully rewritten for the creator's niche — hook, beats, CTA):
3 ALTERNATIVE HOOKS:
CAPTION (ready to post):
10 HASHTAGS:
${LANG_LINE[l]}`,

  repurpose: (i, l) => `You are a content repurposing engine. Turn this Instagram reel's transcript into 6 ready-to-post content pieces for other platforms.
REEL TRANSCRIPT:
"""${clean(i.transcript, 4000)}"""
Produce all six, clearly labelled and copy-ready:
✍️ BLOG POST (2-3 short paragraphs with a title)
🧵 X / TWITTER THREAD (5-7 numbered tweets)
💼 LINKEDIN POST (professional tone, 1 paragraph + a takeaway)
📺 YOUTUBE SHORTS (title + 2-line description + 5 tags)
📱 WHATSAPP STATUS (1-2 punchy lines)
📧 NEWSLETTER SNIPPET (a short intro paragraph)
${LANG_LINE[l]}`,
};

/** Tools whose output language can be switched (the Hinglish USP). */
export const LANG_AWARE = new Set([
  "caption-generator", "bio-generator", "reel-script-generator", "hook-generator",
  "content-ideas", "giveaway-caption", "reply-generator", "growth-strategy", "roast", "remix",
  "story-poll-ideas", "carousel-outline", "repurpose",
]);

const GEMINI_MODEL = "gemini-2.5-flash";

export class AiError extends Error {
  constructor(public code: "NO_KEY" | "UPSTREAM" | "EMPTY", message: string) {
    super(message);
  }
}

type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };

/** Call Gemini with text (and optionally inline audio) parts; return the text answer. */
export async function callGemini(parts: GeminiPart[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new AiError(
      "NO_KEY",
      "AI is not configured yet — the site owner needs to set the GEMINI_API_KEY environment variable."
    );
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
      }),
      signal: AbortSignal.timeout(45_000),
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("gemini error", res.status, body.slice(0, 300));
    throw new AiError("UPSTREAM", res.status === 429
      ? "The free AI quota is busy right now — try again in a minute."
      : "The AI service hiccuped — please try again.");
  }
  const json = await res.json().catch(() => null);
  const text: string | undefined = json?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text?.trim()) throw new AiError("EMPTY", "The AI returned an empty answer — please try again.");
  return text.trim();
}
