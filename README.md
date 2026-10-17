# 👑 InstaGrab

The **premium** Instagram toolkit — every downloader plus **caption + hashtag extraction** (the wedge that makes this more than another downloader).

Built with **Next.js 15 (App Router)**, deployable free on **Vercel**. Designed on the **gold editorial** system: warm paper canvas with a full dark mode, a seven-tier gold palette with one molten CTA gradient, and a three-font contract — **Fraunces** (display serif with gilded italics), **Instrument Sans** (body), **JetBrains Mono** (labels & numbers). Silk-smooth motion (golden-thread loading bar, mask reveals, coin-pop chips) with `prefers-reduced-motion` fallbacks.

## Features / Tools

**URL-based** (paste a post/reel link):
- 🎬 Reels downloader (HD MP4, no watermark)
- ▶️ Video / IGTV downloader
- 🖼️ Photo downloader
- 🎠 Carousel downloader (every slide)
- 📋 Caption extractor — full text, one-click copy *(signature)*
- #️⃣ Hashtag extractor — all tags separated, copy-all *(signature)*
- @ Mentions + 🖼️ video thumbnail download
- 🎵 Reel/story audio-only download (M4A, via Instagram's DASH manifest — no transcoding)

**Username-based** (enter an @handle):
- 🔲 Profile viewer (bio + stats + HD DP + a grid of recent posts, Picuki-style — anonymous)
- ⭕ Story downloader (active 24h stories)
- 👁️ Anonymous story viewer (no trace)
- ✨ Highlights downloader (covers + stories inside each album)
- 🪪 Profile picture / DP downloader (full HD)

**Calculators & utilities** (Phase-1 roadmap tools):
- 💰 Money calculator — followers + ER + niche → rate per post/story/reel (₹ India-mode & global $)
- 🕵️ Fake follower checker — audience quality grade A+ to F from public signals
- 🕐 Best time to post — niche + audience-region golden windows (India-first)
- ✅ Username availability checker (+ tap-to-check suggestions)
- 🔢 Character counter — caption/bio/username limits + "… more"-fold warning
- 🧹 Hashtag counter & cleaner — dedupe, banned-tag drop, trim to 30
- 🚦 Is Instagram down? — live server probe (`/api/ig-status`)
- ▶️ YouTube thumbnail downloader — up to 1280×720, Shorts included

**🤖 AI suite** (Gemini via shared `/api/ai` — set `GEMINI_API_KEY` env var; every tool speaks English/Hindi/**Hinglish**):
- ✍️ Caption, #️⃣ hashtag (3 reach tiers), 🪪 bio, 🎬 reel script, 🧲 hook, 💡 30 content ideas,
  @ username ideas, 🎁 giveaway caption, 💬 comment replies, 🌐 caption translator (18 langs), 🧭 30-day growth strategy
- 🎙️ **Reel transcript extractor** (`/api/transcribe`) — reel → spoken script as text (Hindi/Hinglish faithful) *(unique)*
- 🔁 **Reel remix studio** — viral reel's formula rewritten for YOUR niche *(unique)*
- 🔥 **AI profile roaster** — reads a public profile, roasts it (PG-13, ends with a compliment)

**Creator suite:**
- ⚔️ Profile battle (VS mode) — two accounts, six rounds, one winner
- 📦 Creator Pack ZIP — media + audio + thumbnail + caption.txt + hashtags.txt in one click (in ResultCard)
- 📄 Media kit generator — gold-editorial PNG, canvas-drawn, no watermark
- 📈 Follower growth tracker (localStorage + SVG chart), 🚀 virality score, 🪙 EMV calculator, ⚖️ ratio checker
- 🎡 Wheel spinner (crypto-random), 📇 DM link + QR generator (`qrcode`), 🔗 UTM builder
- 🫥 Invisible character tool, 🔠 case converter (incl. Unicode small caps)
- 🖼️ Studio (100% on-device canvas): photo resizer (IG presets), image compressor, color palette extractor, quote post maker

**Round 3 — "everything else" drop:**
- 💬 Comments exporter (recent ~40-50 → CSV) + 🎟️ giveaway comment picker (filters, multi-winner, backups) + 🏆 winner certificate (unique ID)
- 📊 Post metadata card on results (likes/comments/views/date, when the extractor sees them)
- 🎧 Reel → true MP3 (WebAudio decode + `@breezystack/lamejs` 192 kbps re-encode, on-device)
- 📸 Reel frame grabber (proxied video → untainted canvas → full-res PNG)
- 🖼️ Studio round 2 (all on-device): collage maker, 15 photo filters, blur/pixelate censor, 3×3 grid planner, video trimmer (MediaRecorder, beta), video→GIF (`gifenc`)
- 📡 Story watch mode — multi-account story feed from an on-device watchlist
- 🩺 Account health score — 4 pillars, A+–F report card, shareable
- 🔎 Profile pic zoom (instazoom-style SEO page)
- 🤖 AI additions: alt-text from image (Gemini vision `/api/alt-text`), story poll ideas, carousel outline
- 🌐 Pinterest + Threads downloaders (host-allowlisted `/api/og-extract`; pinimg added to download proxy)
- 📈 Trend radar India (curated, dated honestly) + SnapInsta/FastDL alternative SEO pages
- 🤖 Telegram bot webhook `/api/telegram` (raw Bot API — set `TELEGRAM_BOT_TOKEN` + `TELEGRAM_WEBHOOK_SECRET`, then `setWebhook`)
- 🧩 Browser extension (MV3) in `/extension` — right-click → "Download with InstaGrab"

**Round 4 — the last mile:**
- 🐦 Twitter/X downloader (`/api/twitter` — public syndication endpoint, top-bitrate MP4 + orig photos + tweet text)
- 🎵 TikTok + 📘 Facebook downloaders (og-extract extended; TikTok hydration-JSON fallback; honest best-effort copy)
- ✂️ Link shortener (E9): `/api/shorten` + `/s/[code]` on Upstash Redis REST (env-gated: `UPSTASH_REDIS_REST_URL/TOKEN`)
- 🇮🇳 Hindi SEO pages (J1): `/reels-downloader-hindi`, `/story-downloader-hindi`, `/photo-downloader-hindi`
- 📝 Blog expanded to 17 articles (brand deals, viral script formula, fake-follower checks, IG SEO, giveaway guide)
- ⏱️ Error cards now have countdown-retry (H10); 📴 `/offline` page wired into the service worker (I12)
- 👋 3-step first-visit tour, skippable (I7); 🔊 coin-clink sound toggle in footer, default OFF (I11)

**Retention & UX:**
- ⌘K command palette — jump to any tool (floating button + Ctrl/Cmd+K, "/" also opens it)
- 🕘 "Pick up where you left off" + 📜 /history page (download history with thumbnails, on-device)
- ☀️ Tool of the day spotlight on the homepage (deterministic daily rotation)
- 🔥 Daily-visit streak badge in the nav (appears from day 2)
- 📋 Auto clipboard prefill on the golden bar (only when permission already granted — never prompts)
- 🫳 Drag & drop a link anywhere on the page; recent-searches chips under the bar
- ✨ Gold particle burst + haptic tick on downloads (respects reduced-motion)
- 📢 Ad slots wired to the ad network via `AdFrame` (first frame per page hosts the native banner)

Plus: 🔒 no login ever, public content only, rate-limited API, disclaimer footer, DMCA page.

**🌍 Multi-language:** the tool UI (paste bar, buttons, errors, result card) speaks
21 languages — English, हिन्दी, Español, Português, Bahasa Indonesia, العربية, Türkçe,
Français, Deutsch, Italiano, Русский, 日本語, 한국어, Tiếng Việt, ไทย, বাংলা, اردو, فارسی,
Bahasa Melayu, Polski, Nederlands. Picker in the nav (globe icon); choice persists in
`localStorage` (`ig-lang`) and auto-detects from the browser on first visit. Strings live
in `lib/i18n.tsx` (missing keys fall back to English). SEO prose stays English-first per
the PRD.

## Project structure

```
app/
  page.tsx                → Homepage (the tool)
  reels-downloader/       → SEO landing pages (same tool, targeted copy)
  photo-downloader/
  story-downloader/
  caption-extractor/      → 🌟 unique wedge pages
  hashtag-extractor/
  blog/                   → 5 articles (future AdSense home)
  about|privacy-policy|terms|contact|dmca
  api/extract/route.ts    → serverless extraction endpoint (rate limited)
  api/download/route.ts   → CDN download proxy (Instagram-CDN-only, not open)
  api/profile/route.ts    → username-based tools (dp/stories/highlights)
components/
  GoldenBar.tsx           → the one paste bar (URL tools, whole site)
  ResultCard.tsx          → media + caption + hashtags + mentions ceremony
  UsernameTool.tsx        → @username bar + results (dp/stories/viewer/highlights)
  ToolLanding.tsx         → shared landing shell for URL-based tool pages
  UsernameLanding.tsx     → shared landing shell for username-based tool pages
  Nav / Footer / FAQ / HowItWorks / ToolCard / AdFrame / …
lib/
  instagram-config.ts     → ⚠️ THE swappable config — patch doc_id/endpoints here
  instagram-extractor.ts  → all Instagram-specific logic
  extract-ui.ts           → UI-facing result shapes + mappers from the extractor
  copy.ts                 → central tool registry (drives grid/footer/sitemap)
  rate-limit.ts
app/tokens.css            → design tokens (light + dark)
app/motion.css            → the motion system
```

## Design system

Warm paper canvas (`#FBFAF7`) with a full dark theme (`#0A0906`), toggled via the sun/moon
button and saved in `localStorage` (`ig-theme`) — a FOUC-proof inline script applies it before
paint. A seven-tier gold palette (`--gold-100…700`) where the **molten gradient** is reserved
for the primary CTA, plus `--gold-ink` for accessible gold text. Type contract: **Fraunces**
(display, gilded italic for the one emphasized word), **Instrument Sans** (body),
**JetBrains Mono** (labels, numbers, chips). Tokens live in `app/tokens.css`; the motion
system (golden-thread loading, mask reveals, coin-pop) lives in `app/motion.css`.

## 🔧 When the extractor breaks (every 2–4 weeks — expected!)

Instagram rotates its internal `doc_id` deliberately. When extractions start failing:

1. Open Chrome DevTools → **Network** tab
2. Load any public reel page on instagram.com
3. Find the `graphql` request → copy the new `doc_id` from its form data
4. Paste it into **`lib/instagram-config.ts`** → commit → push (Vercel auto-deploys)

That's the whole fix for a rotated `doc_id`.

## 🛡️ Reliable extraction on Vercel (fallback API)

Instagram frequently blocks **data-center IPs** (Vercel/Cloudflare shared IPs) and returns
empty data no matter how fresh the `doc_id` is — this is the PRD's #1 technical risk, and
self-scraping from a free serverless IP is *not* reliable on its own. The extractor already
primes a session cookie to reduce this, but the guaranteed fix is a **fallback API**.

It's wired in and **automatic**: try Instagram directly first, and if that gets blocked,
fall back to a third-party API — but only once you configure it (otherwise nothing changes).

**Setup (Vercel → Project → Settings → Environment Variables):**

| Variable | Value |
|---|---|
| `FALLBACK_API_URL` | provider endpoint with a `{url}` or `{shortcode}` placeholder |
| `FALLBACK_API_KEY` | your API key |
| `FALLBACK_API_KEY_HEADER` | header name for the key (default `x-api-key`) |
| `USE_FALLBACK_API` | *(optional)* `true` to skip the direct attempt and always use the API |

**Example — ScrapeCreators** (free credits, named in the PRD):

```
FALLBACK_API_URL = https://api.scrapecreators.com/v1/instagram/post?url={url}
FALLBACK_API_KEY = <your key>
FALLBACK_API_KEY_HEADER = x-api-key
```

**Example — a RapidAPI Instagram downloader:**

```
FALLBACK_API_URL = https://<host>/media?shortcode={shortcode}
FALLBACK_API_KEY = <your rapidapi key>
FALLBACK_API_KEY_HEADER = x-rapidapi-key
```

The response normalizer in `lib/instagram-extractor.ts` understands the common provider
shapes (Instagram GraphQL, `{ media:[…] }`, and flat `video_url`/`image_url` fields), so most
providers work with no code change. Redeploy after setting the vars.

## Develop & deploy

```bash
npm install
npm run dev      # local dev
npm run build    # production build
```

Deploy: push to GitHub → import repo in [Vercel](https://vercel.com) → done. Set `NEXT_PUBLIC_SITE_URL` env var once you have a domain.

## Monetization notes (from PRD)

- Day 1: Adsterra / Monetag (they approve downloader sites). Drop their script tag inside `<AdFrame>…</AdFrame>` (`components/AdFrame.tsx`) — every ad sits in a labeled, fixed-height frame so CLS stays 0. Slots: below the result card (280px) and on the homepage (110px).
- Later: AdSense **only on `/blog`** — never on tool pages.
- Keep popunders off initially; protect repeat traffic.

## Disclaimer

InstaGrab is not affiliated with Instagram™ or Meta. No content is hosted; all content belongs to its respective owners.
