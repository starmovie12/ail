import type { QA } from "@/lib/seo";

/**
 * Client-safe config for the AI tool suite. Each entry drives one page at
 * /ai/<slug> (fields, copy, SEO) — the matching prompt lives server-side in
 * lib/ai.ts. Adding an AI tool = one entry here + one prompt there.
 */

export type AiField = {
  id: string;
  label: string;
  placeholder?: string;
  type: "text" | "textarea" | "select";
  options?: [string, string][]; // [value, label]
  optional?: boolean;
};

export type AiToolDef = {
  slug: string;
  tool: string; // AI_PROMPTS key
  name: string;
  eyebrow: string;
  h1: [string, string]; // [plain part, gilded part]
  lead: string;
  button: string;
  fields: AiField[];
  langAware: boolean;
  seoTitle: string;
  seoDesc: string;
  faq: QA[];
  prose: { h: string; p: string }[];
};

export const AI_TOOLS: AiToolDef[] = [
  {
    slug: "caption-generator",
    tool: "caption-generator",
    name: "AI caption generator",
    eyebrow: "AI caption generator",
    h1: ["Captions that sound like ", "you"],
    lead: "Tell the AI your topic and tone — get 5 ready-to-post captions. English, Hindi or full desi Hinglish.",
    button: "Write my captions",
    fields: [
      { id: "topic", label: "What's the post about?", placeholder: "e.g. sunset trek at Rajmachi fort with college friends", type: "textarea" },
      { id: "tone", label: "Tone", type: "select", options: [["casual", "Casual"], ["funny", "Funny"], ["aesthetic", "Aesthetic"], ["desi", "Desi / relatable"], ["motivational", "Motivational"], ["professional", "Professional"]] },
      { id: "length", label: "Length", type: "select", options: [["short", "Short (one-liner)"], ["medium", "Medium (2-3 lines)"], ["long", "Long (storytelling)"]] },
      { id: "cta", label: "Call-to-action (optional)", placeholder: "e.g. tag your trek buddy", type: "text", optional: true },
    ],
    langAware: true,
    seoTitle: "AI Instagram Caption Generator — English, Hindi & Hinglish | InstaGrab",
    seoDesc: "Free AI caption generator for Instagram. Pick a topic, tone and language — English, Hindi or Hinglish — and get 5 ready-to-post captions in seconds. No login.",
    faq: [
      { q: "Is the Hinglish really natural?", a: "Yes — that's our specialty. The AI writes the way young Indians actually text: Hindi in Latin script mixed with English, not stiff textbook translation." },
      { q: "How many captions do I get?", a: "Five distinct options per generation, with different angles. Don't like them? Hit generate again — every run is fresh." },
      { q: "Is it free?", a: "Completely. No login, no watermark, no daily paywall — fair-use rate limits keep it fast for everyone." },
    ],
    prose: [
      { h: "The first Hinglish caption AI", p: "Every global caption tool writes American English. Your audience isn't American. InstaGrab's generator writes native-quality Hinglish — \"Aaj ka vibe\" energy, not translated corporate-speak — plus clean English and Devanagari Hindi when you want them." },
      { h: "Built for the fold", p: "Instagram shows ~125 characters before \"… more\", so the generator front-loads the hook in every option. Pair it with our character counter to check your caption's fold line before posting." },
    ],
  },
  {
    slug: "hashtag-generator",
    tool: "hashtag-generator",
    name: "AI hashtag generator",
    eyebrow: "AI hashtag generator",
    h1: ["30 hashtags, ", "3 smart tiers"],
    lead: "Enter your niche — get 30 relevant tags split into high, medium and niche reach, ready to copy.",
    button: "Generate hashtags",
    fields: [
      { id: "topic", label: "Niche / topic / keywords", placeholder: "e.g. home workout for busy professionals", type: "text" },
    ],
    langAware: false,
    seoTitle: "AI Instagram Hashtag Generator — 30 Tags in 3 Reach Tiers | InstaGrab",
    seoDesc: "Free AI hashtag generator: enter your niche and get 30 relevant Instagram hashtags organised by reach tier (high / medium / niche) with one-click copy. No login.",
    faq: [
      { q: "Why three tiers?", a: "Mega-tags bury you in seconds; tiny tags cap your reach. A mix — ~10 high-reach, 10 medium, 10 niche — gives you both immediate visibility and long-tail discovery." },
      { q: "Should I use all 30?", a: "Instagram allows 30; most creators do best with 15-25 highly relevant ones. Run the output through our hashtag counter & cleaner to dedupe and trim." },
      { q: "Are banned tags filtered?", a: "The AI avoids known spammy tags, and you can double-check any set with our banned hashtag checker." },
    ],
    prose: [
      { h: "Relevance beats volume", p: "Instagram's algorithm uses hashtags as topic signals — 30 relevant tags outperform 30 popular-but-generic ones. The generator stays inside your niche and ladders reach tiers so every tag has a job." },
      { h: "From generator to post in one flow", p: "Copy the set, clean it with the hashtag counter, check anything suspicious against the banned list — the whole pipeline lives on InstaGrab, free." },
    ],
  },
  {
    slug: "bio-generator",
    tool: "bio-generator",
    name: "AI bio generator",
    eyebrow: "AI bio generator",
    h1: ["A bio that fits in ", "150 characters"],
    lead: "Your profession + your vibe → 10 scroll-stopping bios, every one inside Instagram's limit.",
    button: "Write my bio",
    fields: [
      { id: "profession", label: "Who are you / what do you do?", placeholder: "e.g. fitness coach helping 9-to-5ers get fit at home", type: "textarea" },
      { id: "vibe", label: "Vibe", type: "select", options: [["clean", "Clean & minimal"], ["fun", "Fun & quirky"], ["premium", "Premium & authority"], ["desi", "Desi & relatable"]] },
      { id: "emoji", label: "Emojis", type: "select", options: [["yes", "Yes, tasteful"], ["no", "No emojis"]] },
    ],
    langAware: true,
    seoTitle: "AI Instagram Bio Generator — 10 Bios Under 150 Chars | InstaGrab",
    seoDesc: "Free AI bio generator for Instagram: describe yourself, pick a vibe and language (English/Hindi/Hinglish) — get 10 bios that fit the 150-character limit. No login.",
    faq: [
      { q: "Will the bios really fit the limit?", a: "The AI is instructed to stay within 150 characters. Paste your pick into our character counter (Bio mode) for a final check — line breaks count too." },
      { q: "What makes a bio convert?", a: "Clarity in line one (who you help / what you post), personality in line two, and a CTA pointing at your link. The generator mixes these structures across its 10 options." },
      { q: "Can it write in Hinglish?", a: "Yes — switch the language chip and it writes the way Indian creators actually talk." },
    ],
    prose: [
      { h: "150 characters is a pitch, not a limit", p: "Visitors decide to follow in about 3 seconds, and the bio is most of that decision. Ten options beat one blank box — pick the structure that fits, then tweak a word or two to make it yours." },
      { h: "Finish the look", p: "Pair your new bio with our font generator for styled text and the story ring maker for a DP that pops." },
    ],
  },
  {
    slug: "reel-script-generator",
    tool: "reel-script-generator",
    name: "AI reel script generator",
    eyebrow: "AI reel script generator",
    h1: ["A full reel script in ", "10 seconds"],
    lead: "Topic + duration → hook, timed beats, on-screen text, CTA and B-roll ideas. In English, Hindi or Hinglish.",
    button: "Write my script",
    fields: [
      { id: "topic", label: "What's the reel about?", placeholder: "e.g. 3 mistakes beginners make in the gym", type: "textarea" },
      { id: "duration", label: "Duration", type: "select", options: [["15", "15 seconds"], ["30", "30 seconds"], ["60", "60 seconds"], ["90", "90 seconds"]] },
    ],
    langAware: true,
    seoTitle: "AI Reel Script Generator — Hook, Beats, CTA (Hindi/Hinglish) | InstaGrab",
    seoDesc: "Free AI script generator for Instagram Reels: enter a topic and duration, get a complete script — hook, timed beats, on-screen text, CTA and B-roll ideas. Hinglish supported.",
    faq: [
      { q: "What exactly do I get?", a: "A scroll-stopping hook for the first 2 seconds, the spoken script broken into timed beats, short on-screen text overlays, a closing CTA, and 3 B-roll shot ideas." },
      { q: "Why does the hook matter so much?", a: "Instagram decides distribution from early retention — if viewers survive the first 2 seconds, your reel travels. That's why the script leads with the hook." },
      { q: "Can I get scripts in Hinglish?", a: "Yes — and Hindi with Devanagari too. Switch the language chip above the form." },
    ],
    prose: [
      { h: "Structure is the shortcut", p: "Viral reels follow a formula: hook → payoff beats → CTA. The generator gives you the skeleton timed to your duration, so filming becomes execution instead of improvisation." },
      { h: "Steal smarter with Remix", p: "Found a viral reel in your niche? Run it through our Reel Remix Studio — it extracts the transcript and rewrites the formula for your niche." },
    ],
  },
  {
    slug: "hook-generator",
    tool: "hook-generator",
    name: "AI hook generator",
    eyebrow: "AI hook generator",
    h1: ["First lines that ", "stop the scroll"],
    lead: "10 proven-pattern hooks for your topic — bold claims, curiosity gaps, warnings and POVs.",
    button: "Generate hooks",
    fields: [
      { id: "topic", label: "Your topic / niche", placeholder: "e.g. saving money in your 20s", type: "text" },
    ],
    langAware: true,
    seoTitle: "AI Hook Generator for Reels — 10 Scroll-Stopping Openers | InstaGrab",
    seoDesc: "Free AI hook generator: get 10 scroll-stopping first lines for Instagram Reels using proven viral patterns. English, Hindi and Hinglish. No login.",
    faq: [
      { q: "What patterns does it use?", a: "The ones that keep working: bold claim, negative warning (\"Stop doing X\"), curiosity gap, specific numbers, POV setups, \"nobody tells you this\", and before/after contrasts." },
      { q: "Text hook or spoken hook?", a: "Both — use the line as your opening sentence and/or your first on-screen text. The first 2 seconds decide your reach either way." },
    ],
    prose: [
      { h: "Retention starts at second zero", p: "Instagram widens distribution for reels people don't swipe away from. A strong first line buys the 2 seconds that decide everything — which is why top creators write ten hooks per reel and pick the sharpest." },
      { h: "Hooks in your language", p: "Hinglish hooks land harder with Indian audiences than translated English — flip the language chip and hear the difference." },
    ],
  },
  {
    slug: "content-ideas",
    tool: "content-ideas",
    name: "AI content ideas",
    eyebrow: "AI content ideas",
    h1: ["Never run out of ", "post ideas"],
    lead: "Your niche → 30 specific, filmable ideas: reels, carousels and stories, labelled and ready.",
    button: "Give me 30 ideas",
    fields: [
      { id: "topic", label: "Your niche", placeholder: "e.g. street food reviews in Delhi", type: "text" },
    ],
    langAware: true,
    seoTitle: "AI Instagram Content Ideas — 30 Reel & Post Ideas Free | InstaGrab",
    seoDesc: "Free AI content idea generator: enter your niche and get 30 specific Instagram ideas — 15 reels, 10 posts, 5 stories — you could film today. Hinglish supported.",
    faq: [
      { q: "How specific are the ideas?", a: "Each idea is one concrete line you could film today — \"rate 3 ₹50 golgappa stalls blind\" — not vague themes like \"share tips\"." },
      { q: "That's a month of content?", a: "Exactly: 30 ideas ≈ a 30-day calendar. Run it monthly, cross off what you've shot, regenerate when the well runs dry." },
    ],
    prose: [
      { h: "The blank page is the real enemy", p: "Most creators don't quit from lack of skill — they quit from deciding what to post every single day. A 30-idea bank turns content into a checklist." },
      { h: "Ideas → scripts → captions, one pipeline", p: "Pick an idea, feed it to the reel script generator, caption it with the caption generator — the full workflow lives here, free." },
    ],
  },
  {
    slug: "username-generator",
    tool: "username-generator",
    name: "AI username generator",
    eyebrow: "AI username generator",
    h1: ["Find a handle worth ", "keeping"],
    lead: "Your name + niche → 20 clean, memorable username ideas. Check any of them live with one tap.",
    button: "Suggest usernames",
    fields: [
      { id: "name", label: "Your name / brand word", placeholder: "e.g. Priya", type: "text" },
      { id: "topic", label: "Niche (optional)", placeholder: "e.g. baking", type: "text", optional: true },
    ],
    langAware: false,
    seoTitle: "AI Instagram Username Generator — 20 Handle Ideas | InstaGrab",
    seoDesc: "Free AI username generator for Instagram: enter your name and niche, get 20 clean handle ideas — then check availability instantly with our username checker.",
    faq: [
      { q: "Are the suggestions guaranteed available?", a: "No generator can promise that — but every suggestion follows Instagram's rules, and our username checker verifies any of them live in one tap." },
      { q: "What makes a good handle?", a: "Short, spellable from hearing it once, no underscore mazes or trailing digits. Keep your brand word intact and modify around it." },
    ],
    prose: [
      { h: "Name first, niche second", p: "The best handles keep your name or brand word whole and add a clean modifier — the., .co, _in, or a niche keyword. The generator mixes these patterns instead of mangling your name." },
      { h: "Generate → check → claim", p: "Copy any suggestion into our username availability checker (or tap through) and claim the winner in the Instagram app before someone else does." },
    ],
  },
  {
    slug: "giveaway-caption",
    tool: "giveaway-caption",
    name: "AI giveaway caption",
    eyebrow: "AI giveaway caption generator",
    h1: ["Giveaway captions that ", "convert"],
    lead: "Prize + rules + deadline → a complete, premium-feeling giveaway announcement, ready to post.",
    button: "Write giveaway caption",
    fields: [
      { id: "prize", label: "What's the prize?", placeholder: "e.g. ₹2000 Nykaa voucher + skincare hamper", type: "text" },
      { id: "rules", label: "Entry rules", placeholder: "e.g. follow us, like this post, tag 2 friends", type: "text" },
      { id: "deadline", label: "Deadline", placeholder: "e.g. Sunday 31st, 9 PM IST", type: "text" },
    ],
    langAware: true,
    seoTitle: "AI Giveaway Caption Generator for Instagram — Free | InstaGrab",
    seoDesc: "Free AI giveaway caption generator: enter the prize, rules and deadline — get a complete, premium giveaway announcement caption with hashtags. Hinglish supported.",
    faq: [
      { q: "What structure does it use?", a: "The one that converts: exciting opener → prize details → numbered entry steps → deadline and announcement date → relevant hashtags. Clear steps = more valid entries." },
      { q: "How do I pick the winner fairly?", a: "Use our wheel spinner for a transparent, animated draw — paste the entrants and spin on screen record." },
    ],
    prose: [
      { h: "Clarity converts, hype doesn't", p: "Giveaway posts fail when the steps are buried. The generator numbers every entry step, states the deadline twice, and keeps the prize above the fold — the mechanics that separate 50 entries from 500." },
      { h: "Run the whole giveaway here", p: "Caption from this tool, winner from the wheel spinner, announcement caption regenerated in one click. Zero paid tools." },
    ],
  },
  {
    slug: "reply-generator",
    tool: "reply-generator",
    name: "AI reply generator",
    eyebrow: "AI comment reply generator",
    h1: ["Replies that keep the ", "conversation alive"],
    lead: "Paste any comment — get 5 human-sounding replies in your chosen vibe. Replies boost reach.",
    button: "Suggest replies",
    fields: [
      { id: "comment", label: "The comment you received", placeholder: "e.g. This recipe looks amazing but seems too hard for me 😅", type: "textarea" },
      { id: "vibe", label: "Reply vibe", type: "select", options: [["friendly", "Friendly"], ["witty", "Witty"], ["professional", "Professional"], ["hype", "Hype / supportive"]] },
    ],
    langAware: true,
    seoTitle: "AI Instagram Comment Reply Generator — 5 Replies Free | InstaGrab",
    seoDesc: "Free AI reply generator for Instagram comments: paste a comment, pick a vibe (witty/professional/friendly) and get 5 human-sounding replies. Hinglish supported.",
    faq: [
      { q: "Why reply to comments at all?", a: "Replies double the comment count (yours count too), signal the algorithm that the post is generating conversation, and train commenters to come back. First-hour replies matter most." },
      { q: "Will they sound like a bot?", a: "No — they're kept under 100 characters, casual and specific to the comment. Pick the closest one and tweak a word if you like." },
    ],
    prose: [
      { h: "The first hour is reply hour", p: "Instagram weighs early engagement heavily, and every reply you write is a comment the algorithm counts. Replying fast — with something better than a heart emoji — is the cheapest reach tactic there is." },
      { h: "Vibe-matched, language-matched", p: "Witty for meme pages, professional for brands, Hinglish for desi audiences — the same comment gets a different perfect reply depending on who you are." },
    ],
  },
  {
    slug: "caption-translator",
    tool: "caption-translator",
    name: "AI caption translator",
    eyebrow: "AI caption translator",
    h1: ["Your caption, in ", "any language"],
    lead: "Natural social-media translation — hashtags, emojis and @mentions preserved exactly.",
    button: "Translate caption",
    fields: [
      { id: "caption", label: "Your caption", placeholder: "Paste the caption to translate — hashtags will be preserved as-is", type: "textarea" },
      { id: "target", label: "Translate to", type: "select", options: [["Hindi", "Hindi"], ["Hinglish (Hindi in Latin script)", "Hinglish"], ["English", "English"], ["Spanish", "Spanish"], ["Portuguese", "Portuguese"], ["Arabic", "Arabic"], ["French", "French"], ["German", "German"], ["Indonesian", "Indonesian"], ["Turkish", "Turkish"], ["Japanese", "Japanese"], ["Korean", "Korean"], ["Russian", "Russian"], ["Bengali", "Bengali"], ["Tamil", "Tamil"], ["Telugu", "Telugu"], ["Marathi", "Marathi"], ["Urdu", "Urdu"]] },
    ],
    langAware: false,
    seoTitle: "AI Instagram Caption Translator — 18 Languages, Hashtags Kept | InstaGrab",
    seoDesc: "Free AI caption translator for Instagram: natural, casual translation into 18 languages including Hindi and Hinglish — hashtags, emojis and mentions preserved exactly.",
    faq: [
      { q: "How is this better than Google Translate?", a: "It translates for Instagram: casual register, natural phrasing, and it never touches your hashtags, @mentions or emojis — those pass through exactly as written." },
      { q: "Why translate captions?", a: "Bilingual captions widen reach — Indian creators posting Hindi + English versions regularly see non-metro engagement jump. Regional languages (Tamil, Telugu, Marathi, Bengali) are underserved and hungry for content." },
    ],
    prose: [
      { h: "Translation that speaks Instagram", p: "Literal translation kills captions — jokes flatten, CTAs turn formal. This translator keeps the caption's energy while switching language, and treats hashtags as untouchable so your discovery strategy survives the swap." },
      { h: "Go regional, grow faster", p: "The fastest-growing Instagram audiences in India scroll in Tamil, Telugu, Marathi and Bengali. Same content, translated caption, new audience." },
    ],
  },
  {
    slug: "growth-strategy",
    tool: "growth-strategy",
    name: "AI growth strategy",
    eyebrow: "AI growth strategy",
    h1: ["Your next 30 days, ", "planned"],
    lead: "Followers + niche + goal → a personalised week-by-week growth plan with specific actions.",
    button: "Build my plan",
    fields: [
      { id: "followers", label: "Current followers", placeholder: "e.g. 1200", type: "text" },
      { id: "topic", label: "Your niche", placeholder: "e.g. personal finance for students", type: "text" },
      { id: "goal", label: "Goal", placeholder: "e.g. reach 5K followers and get first brand deal", type: "text" },
    ],
    langAware: true,
    seoTitle: "AI Instagram Growth Strategy — Free 30-Day Plan | InstaGrab",
    seoDesc: "Free AI growth strategist: enter your followers, niche and goal — get a personalised 30-day Instagram plan with weekly actions and metrics to track. Hinglish supported.",
    faq: [
      { q: "How personalised is it really?", a: "The plan is built for your niche and current size — a 500-follower food page gets different actions than a 50K fitness page. The more specific your goal, the sharper the plan." },
      { q: "What should I track?", a: "The plan ends with 3 metrics matched to your goal. Track them weekly with our engagement calculator and follower tracker — both free." },
    ],
    prose: [
      { h: "A plan beats motivation", p: "Growth stalls when every day starts with \"what should I do?\". A week-by-week plan — posting cadence, content mix, engagement tactics, one experiment — turns growth into execution." },
      { h: "Close the loop with data", p: "Run the plan, then audit yourself monthly with our profile audit and fake follower checker to make sure the growth is real and healthy." },
    ],
  },
];

AI_TOOLS.push(
  {
    slug: "story-poll-ideas",
    tool: "story-poll-ideas",
    name: "AI story poll ideas",
    eyebrow: "AI story poll & question ideas",
    h1: ["Stories your followers can't ", "not tap"],
    lead: "15 ready-to-post interactive Story ideas — polls with both options written, question prompts and quizzes.",
    button: "Give me 15 ideas",
    fields: [
      { id: "topic", label: "Your niche", placeholder: "e.g. fitness coaching", type: "text" },
    ],
    langAware: true,
    seoTitle: "AI Instagram Story Poll & Question Ideas — Free | InstaGrab",
    seoDesc: "Free AI generator for Instagram Story engagement: 15 poll, question-box and quiz ideas for your niche, ready to type into the sticker. Hinglish supported.",
    faq: [
      { q: "Why do Story stickers matter?", a: "Every tap on a poll or quiz is an engagement signal — accounts whose stories get interactions see their stories (and posts) ranked higher. Stickers are the cheapest engagement on Instagram." },
      { q: "What's the mix?", a: "5 polls with both options pre-written, 5 question-box prompts, 5 quiz/slider ideas — labelled so you can post straight from the list." },
    ],
    prose: [
      { h: "Taps train the algorithm", p: "Instagram ranks your stories by who interacts — and poll taps are the lowest-friction interaction there is. A daily interactive story quietly keeps you at the front of the story tray." },
      { h: "Never stare at the sticker again", p: "The hard part of polls isn't posting them, it's thinking of one daily. Fifteen at a time, regenerated whenever the well runs dry, in your language." },
    ],
  },
  {
    slug: "carousel-outline",
    tool: "carousel-outline",
    name: "AI carousel outline",
    eyebrow: "AI carousel outline maker",
    h1: ["Ten slides, outlined in ", "ten seconds"],
    lead: "Your topic → a hook slide, 8 punchy content slides with visual suggestions, a CTA slide — plus caption and hashtags.",
    button: "Outline my carousel",
    fields: [
      { id: "topic", label: "Carousel topic", placeholder: "e.g. 5 money mistakes to avoid in your 20s", type: "textarea" },
    ],
    langAware: true,
    seoTitle: "AI Instagram Carousel Outline Maker — 10 Slides Free | InstaGrab",
    seoDesc: "Free AI carousel generator: enter a topic and get a 10-slide outline — hook, one point per slide with visual suggestions, CTA, caption and hashtags. Hinglish supported.",
    faq: [
      { q: "Why carousels?", a: "Carousels get a second chance in the feed — if someone scrolls past, Instagram often re-shows slide 2. They earn the most saves of any format, and saves are the strongest ranking signal." },
      { q: "What makes a slide work?", a: "One idea, max ~25 words, readable in 2 seconds. The outline enforces that discipline, plus a scroll-stopping hook slide and a save-this CTA at the end." },
    ],
    prose: [
      { h: "The save machine", p: "Educational carousels are Instagram's most-saved format, and every save tells the algorithm your post is worth distributing. The outline structures your knowledge into exactly that shape." },
      { h: "From outline to design in minutes", p: "Take the outline into Canva or our quote maker, one slide per point. The thinking is done — you're just typesetting." },
    ],
  }
);

export function aiToolBySlug(slug: string): AiToolDef | undefined {
  return AI_TOOLS.find((t) => t.slug === slug);
}
