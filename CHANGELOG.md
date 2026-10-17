# Changelog

## UI/UX Redesign (PRD_Website_UI_UX_Redesign) — app-shell release

**Shell:** one `AppShell` — tab screens (Home, Tools, History, Settings) get Global Header (logo + language + theme) and Bottom Nav; every other page is a detail screen with a Back Bar. `/admin`, `/offline`, `/s/*` are shell-free. Old `Nav`/`Footer` removed; detail pages end with a short `LegalFoot`.
**Home:** Hero banner → Smart Link Box → How to Download → Tools & Platforms. The textbox is now a router (`lib/router.ts`, 22 unit tests): paste / Grab / Enter / drop → detects app + kind on-device → opens the right app page with a sessionStorage handoff and auto-start. Neon card design (banner, textbox, Paste Link / Grab Media, trust row, "Tools Auto-Supported" card, trust foot bar) kept pixel-identical; the tools count is now computed from the registry.
**New screens:** `/tools` (search, category pills, recents, tool of the day, apps row), `/history` (unified v2 store, Re-grab, delete + UNDO, Clear All), `/settings` (language, theme, download prefs, Advanced Session ID / Cobalt, install, legal), `/how-to-download`, `/instagram-downloader`, `/coming-soon/[id]`.
**One engine:** `PlatformDownloader` + `ResultPanel` serve Instagram + Facebook/TikTok/YouTube/Pinterest/X/Threads (old OgDownloader/TwitterDownloader/YtThumbnail/ResultCard/CreatorPack/HistoryList removed). Auto-detect rules R1–R15, mismatch redirect, kind banner, 10 s re-fetch guard, iOS save pulse.
**Data:** `lib/registry.ts` is the single tool list (94 visible); sitemap, Command Palette and Back Bar read it. `lib/platforms.ts` capability map. History/prefs/handoff in `lib/storage.ts` with one-time migration of the two old history stores.
**Security:** Session ID / Cobalt URL from Settings now actually reach the API (POST body only, never logged); Cobalt URL validated server-side against SSRF (`lib/safe-url.ts`, https-only, private IP / metadata / localhost blocked, redirects refused).
**Misc:** viewport-fit=cover + safe-area insets, RTL `dir` for ar/ur/fa, 16px mobile inputs, default theme dark, manifest shortcuts, SW cache v3.

# CHANGELOG — Unified theme, animated background, responsive sizing

## Final palette (single source: `app/tokens.css`)
| Token | Value | Role |
|---|---|---|
| `--c-cyan` | #22E4FF | primary accent (hero banner cyan) |
| `--c-sky` | #38BDF8 | secondary accent |
| `--c-violet` / `--c-violet-2` | #7C3AED / #6366F1 | brand violet / lighter step |
| `--c-magenta` | #D946EF | brand magenta |
| `--c-pink` | #EC4899 | rare accent |
| `--bg / --surface / --surface-2 / --surface-3` | #050B24 / #0B1230 / #101842 / #1A2254 | dark navy surfaces |
| light theme | #F4F6FF / #FFFFFF / #EEF1FF / #E1E6FB | cool lavender surfaces, indigo accent text |
| `--gradient-brand`, `--gradient-button` | cyan→violet→magenta (135°) | text/logo gradient; button gradient with lighter mid-stops (AA for dark label) |
| `--on-accent` | #050B24 | label colour on gradient fills |
Legacy `--gold-*`, `--molten`, `--brand-*`, `--text-*`, `--bg-card` … are kept as aliases to these tokens (nothing is gold any more).
RGB channel tokens (`--c-cyan-rgb` …) allow `rgb(var(--c-cyan-rgb) / .3)`.

## Files
- **app/tokens.css** – rewritten: only token layer, dark + light.
- **app/globals.css** – competing override block removed; mint/violet/purple hard-codes → tokens; fluid `.container`/`.section`; `.grid-quartet` (1 / 2 / 4 cols), `.grid-tools`, `.grid-guides`, `.feature-card`; `.ambient-glow` background; whole `.gb-neon` card (field, buttons, tools header, platform strip, `›` button, bottom trust strip) resized with `clamp()`.
- **app/layout.tsx** – ambient layer mounted; `theme-color` updated (original `next/font/google` code untouched).
- **app/page.tsx** – hero stack 800px, grid classes, fluid spacing.
- **app/motion.css, app/opengraph-image.tsx, app/icon.svg, public/manifest.webmanifest, public/icon-192/512.png** – recolored (PNG icons regenerated).
- **components/Nav.tsx** – hot-pink/orange → tokens; now follows light/dark theme; fluid height (52→68), logo (34→44), wordmark (20→26), buttons (40→46).
- **components/InstallAppButton.tsx** – tokens; fluid padding/icon/button/title; 40px touch target.
- **components/GoldenBar.tsx** – default-variant amber/pink/violet → tokens; neon block + trust row: one compact 3-column row with dividers on phones.
- **components/HeroBanner.tsx** – accent rgba → tokens; max-width 680 → 800 (artwork unchanged).
- **components/PlatformIcons.tsx** – focus-ring fallback now brand cyan (brand logo colours untouched).
- **components/SupportedTools, ToolCard, ResultCard, QuickAction, CommandPalette, RecentTools, ToolOfTheDay, SimpleToolLanding, ToolLanding, UsernameLanding, VideoToGif, VideoTrimmer, BlurTool, ImageCompressor, AdminPanel, FollowerTracker, CollageMaker, MediaKitMaker, WinnerCertificate, WheelSpinner, DpRingMaker, QuoteMaker, DmLinkGenerator** – leftover gold/orange/pink replaced with palette (canvas drawings use hex equivalents).

## Intentional exceptions / notes
- Ambient layer uses `z-index:-1` (not 0) so no page needs `position/z-index` changes; grain overlay at z-60 untouched.
- Renamed (colour-driven) tool labels: QuoteMaker "Ivory & gold"→"Ivory & indigo", "Noir & gold"→"Noir & cyan"; DpRingMaker "Gold"→"Brand". All other copy unchanged. (Marketing copy that says "golden bar" was left as is.)
- Hero banner text scales with the banner (container units) and can be <11px on very small phones — kept so the artwork doesn't change.
- Third-party brand logos and semantic ok/err/warn colours untouched.
- Trust badges wrap to 3 lines on 320px screens (long labels); 2 lines from ~360px.
