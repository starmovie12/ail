/**
 * REGISTRY — tools ka EK source (PRD §9, A17).
 * Tools screen, Command Palette, sitemap, Back-bar titles, Footer/Settings links sab yahin se.
 * Server + client dono me import ho sakta hai (koi "use client" nahi).
 */
import { AI_TOOLS } from "@/lib/ai-tools";
import { PLATFORMS } from "@/lib/platforms";
export { PLATFORMS, SOON_PLATFORMS, platformById, platformByRoute, soonById } from "@/lib/platforms";

export type ToolCategory =
  | "all"
  | "downloaders"
  | "platforms"
  | "ai"
  | "analytics"
  | "visual"
  | "utilities"
  | "fun";

export type ToolBadge = "Popular" | "AI" | "New" | "Hindi" | "Hot";

export interface ToolItem {
  name: string;
  href: string;
  description: string;
  category: Exclude<ToolCategory, "all">;
  icon: string;
  badge?: ToolBadge;
  featured?: boolean;
  keywords?: string[];
  /** Grid se chhupa (search/URL/sitemap me rahega) — PRD §9.4 */
  hidden?: boolean;
}

export const ALL_SUPPORTED_TOOLS: ToolItem[] = [
  // 1. Instagram Downloaders
  {
    name: "Reels Downloader",
    href: "/reels-downloader",
    description: "Download Instagram Reels videos in Full HD MP4 without watermark.",
    category: "downloaders",
    icon: "🎬",
    badge: "Popular",
    featured: true,
    keywords: ["reel", "video", "mp4", "hd", "save"],
  },
  {
    name: "Story Downloader",
    href: "/story-downloader",
    description: "Save Instagram Stories anonymously in original quality.",
    category: "downloaders",
    icon: "⭕",
    badge: "Popular",
    featured: true,
    keywords: ["stories", "anonymous", "status", "save"],
  },
  {
    name: "Photo Downloader",
    href: "/photo-downloader",
    description: "Download full-resolution Instagram photos and single posts.",
    category: "downloaders",
    icon: "🖼️",
    badge: "Popular",
    featured: true,
    keywords: ["image", "pic", "post", "jpg", "hd"],
  },
  {
    name: "Video Downloader",
    href: "/video-downloader",
    description: "Save Instagram feed videos and IGTV clips in high speed.",
    category: "downloaders",
    icon: "📹",
    featured: true,
    keywords: ["igtv", "post video", "mp4"],
  },
  {
    name: "Carousel Downloader",
    href: "/carousel-downloader",
    description: "Download all photos and videos from multi-slide Instagram posts.",
    category: "downloaders",
    icon: "🗂️",
    badge: "Popular",
    featured: true,
    keywords: ["album", "multiple", "slides", "gallery"],
  },
  {
    name: "Audio & Music Downloader",
    href: "/audio-downloader",
    description: "Extract original audio tracks and trending sounds from Reels.",
    category: "downloaders",
    icon: "🎵",
    keywords: ["sound", "music", "song", "mp3"],
  },
  {
    name: "Reel to MP3 Converter",
    href: "/reel-to-mp3",
    description: "Convert any Instagram Reel video directly into a high-bitrate MP3 file.",
    category: "downloaders",
    icon: "🎧",
    featured: true,
    keywords: ["convert", "audio", "mp3", "ringtone"],
  },
  {
    name: "Highlights Downloader",
    href: "/highlights-downloader",
    description: "View and download archived Instagram Story Highlights from any profile.",
    category: "downloaders",
    icon: "✨",
    keywords: ["highlights", "archive", "stories"],
  },
  {
    name: "Profile Picture Downloader",
    href: "/profile-picture-downloader",
    description: "Download full-size HD Instagram DP from any public or private username.",
    category: "downloaders",
    icon: "👤",
    badge: "Popular",
    featured: true,
    keywords: ["dp", "avatar", "pfp", "profile photo"],
  },
  {
    name: "Profile Pic Zoom",
    href: "/profile-pic-zoom",
    description: "Zoom in on any Instagram profile picture in crisp HD resolution.",
    category: "downloaders",
    icon: "🔍",
    keywords: ["zoom", "dp", "enlarge", "pfp"],
  },
  {
    name: "Thumbnail Downloader",
    href: "/thumbnail-downloader",
    description: "Grab high-resolution cover thumbnails from Reels and Instagram videos.",
    category: "downloaders",
    icon: "🖼️",
    keywords: ["cover", "poster", "preview"],
  },
  {
    name: "Batch Downloader",
    href: "/batch-downloader",
    description: "Paste multiple Instagram links and download them all together.",
    category: "downloaders",
    icon: "📦",
    badge: "New",
    keywords: ["multiple", "queue", "links"],
  },
  {
    name: "Bulk Downloader",
    href: "/bulk-downloader",
    description: "Download multiple posts and media files in one streamlined workflow.",
    category: "downloaders",
    icon: "⚡",
    keywords: ["mass", "bulk", "zip"],
  },
  {
    name: "Anonymous Story Viewer",
    href: "/story-viewer",
    description: "Watch Instagram Stories secretly without appearing in the seen list.",
    category: "downloaders",
    icon: "🕵️",
    badge: "Hot",
    featured: true,
    keywords: ["stalk", "secret", "anonymous", "watch"],
  },
  {
    name: "Profile Viewer",
    href: "/profile-viewer",
    description: "Browse public Instagram profiles, bios, and feeds without logging in.",
    category: "downloaders",
    icon: "🌐",
    featured: true,
    keywords: ["account", "browse", "no login"],
  },
  {
    name: "Story Feed Explorer",
    href: "/story-feed",
    description: "View stories in a clean, distraction-free feed layout.",
    category: "downloaders",
    icon: "📱",
    keywords: ["feed", "stories", "timeline"],
  },
  {
    name: "Ghost Feed Mode",
    href: "/ghost-feed",
    description: "Browse Instagram content privately in ghost mode with zero footprint.",
    category: "downloaders",
    icon: "👻",
    badge: "New",
    keywords: ["private", "incognito", "ghost"],
  },
  {
    name: "Reels Downloader (Hindi)",
    href: "/reels-downloader-hindi",
    hidden: true,
    description: "Instagram Reels video seedhe Hindi interface mein HD mein download karein.",
    category: "downloaders",
    icon: "🇮🇳",
    badge: "Hindi",
    keywords: ["hindi", "reels", "bharat"],
  },
  {
    name: "Story Downloader (Hindi)",
    href: "/story-downloader-hindi",
    hidden: true,
    description: "Instagram Story bina login kiye Hindi mein aasani se save karein.",
    category: "downloaders",
    icon: "🇮🇳",
    badge: "Hindi",
    keywords: ["hindi", "story", "status"],
  },
  {
    name: "Photo Downloader (Hindi)",
    href: "/photo-downloader-hindi",
    hidden: true,
    description: "Instagram photos aur DP full HD quality mein Hindi mein download karein.",
    category: "downloaders",
    icon: "🇮🇳",
    badge: "Hindi",
    keywords: ["hindi", "photo", "image"],
  },

  // 2. Multi-Platform Downloaders
  {
    name: "TikTok Downloader",
    href: "/tiktok-downloader",
    description: "Download TikTok videos in HD MP4 without watermark.",
    category: "platforms",
    icon: "🎵",
    badge: "Popular",
    featured: true,
    keywords: ["tiktok", "no watermark", "video"],
  },
  {
    name: "Twitter / X Downloader",
    href: "/twitter-downloader",
    description: "Save videos and GIFs from X (Twitter) posts in highest resolution.",
    category: "platforms",
    icon: "🐦",
    featured: true,
    keywords: ["x", "tweet", "video", "gif"],
  },
  {
    name: "Facebook Video Downloader",
    href: "/facebook-downloader",
    description: "Download public Facebook Reels, Watch videos, and posts in HD.",
    category: "platforms",
    icon: "📘",
    featured: true,
    keywords: ["fb", "watch", "reels"],
  },
  {
    name: "Pinterest Downloader",
    href: "/pinterest-downloader",
    description: "Save Pinterest video pins, idea pins, and high-res images.",
    category: "platforms",
    icon: "📌",
    featured: true,
    keywords: ["pin", "board", "image", "video"],
  },
  {
    name: "Threads Downloader",
    href: "/threads-downloader",
    description: "Download videos, photos, and voice posts from Meta Threads.",
    category: "platforms",
    icon: "🧵",
    badge: "New",
    keywords: ["meta", "threads", "post"],
  },
  {
    name: "YouTube Thumbnail Grabber",
    href: "/youtube-thumbnail-downloader",
    description: "Extract 4K and Full HD thumbnails from any YouTube video.",
    category: "platforms",
    icon: "▶️",
    featured: true,
    keywords: ["yt", "cover", "1080p", "4k"],
  },

  // 3. AI & Smart Creator Tools
  {
    name: "AI Reel Transcript",
    href: "/reel-transcript",
    description: "Generate accurate text transcripts and subtitles from any Reel audio.",
    category: "ai",
    icon: "📝",
    badge: "AI",
    featured: true,
    keywords: ["speech to text", "captions", "subtitles", "script"],
  },
  {
    name: "AI Caption Fixer",
    href: "/caption-fixer",
    description: "Rewrite, polish, and format captions with clean line breaks and hooks.",
    category: "ai",
    icon: "🪄",
    badge: "AI",
    featured: true,
    keywords: ["rewrite", "hooks", "copywriting"],
  },
  {
    name: "Caption Extractor",
    href: "/caption-extractor",
    description: "Copy the exact text caption and tags from any Instagram post or Reel.",
    category: "ai",
    icon: "📋",
    keywords: ["copy text", "description", "extract"],
  },
  {
    name: "Reel Repurposer",
    href: "/reel-repurposer",
    description: "Turn one Reel into Twitter threads, LinkedIn posts, and Shorts scripts.",
    category: "ai",
    icon: "♻️",
    badge: "AI",
    keywords: ["repurpose", "content", "multi-platform"],
  },
  {
    name: "Reel Remix Planner",
    href: "/reel-remix",
    description: "Brainstorm viral remix angles, reaction hooks, and duet scripts.",
    category: "ai",
    icon: "🎛️",
    badge: "AI",
    keywords: ["ideas", "hooks", "collab"],
  },
  {
    name: "AI Alt-Text Generator",
    href: "/ai-alt-text",
    description: "Create SEO-optimized accessibility alt text for Instagram photos.",
    category: "ai",
    icon: "👁️",
    badge: "AI",
    keywords: ["seo", "accessibility", "image description"],
  },
  {
    name: "AI Voice Cloner Studio",
    href: "/voice-cloner",
    description: "Generate expressive voiceovers and narration styles for your Reels.",
    category: "ai",
    icon: "🎙️",
    badge: "AI",
    keywords: ["tts", "audio", "narration", "voiceover"],
  },
  {
    name: "Virality Score Predictor",
    href: "/virality-score",
    description: "Analyze hooks, pacing, and captions to score your viral potential.",
    category: "ai",
    icon: "🚀",
    badge: "Hot",
    featured: true,
    keywords: ["algorithm", "reach", "predict"],
  },
  {
    name: "Best Time to Post",
    href: "/best-time-to-post",
    description: "Find peak engagement hours tailored to your niche and audience timezone.",
    category: "ai",
    icon: "⏰",
    keywords: ["schedule", "timing", "algorithm"],
  },
  {
    name: "Trending in India",
    href: "/trending-india",
    description: "Discover viral Indian Reels audio, hashtags, and creator formats.",
    category: "ai",
    icon: "🔥",
    badge: "Hot",
    featured: true,
    keywords: ["india", "viral", "trends", "songs"],
  },

  // 4. Analytics, Audit & Growth
  {
    name: "Account Health Check",
    href: "/account-health",
    description: "Diagnose profile reach, engagement health, and content consistency.",
    category: "analytics",
    icon: "🩺",
    badge: "Popular",
    featured: true,
    keywords: ["audit", "health", "reach"],
  },
  {
    name: "Shadowban Lab",
    href: "/shadowban-lab",
    description: "Test if your account or hashtags are restricted by the algorithm.",
    category: "analytics",
    icon: "🛡️",
    badge: "Hot",
    featured: true,
    keywords: ["ban", "visibility", "hashtag ban"],
  },
  {
    name: "Profile Audit Tool",
    href: "/profile-audit",
    description: "Get an actionable checklist to optimize your bio, highlights, and feed.",
    category: "analytics",
    icon: "📊",
    keywords: ["bio", "optimization", "review"],
  },
  {
    name: "Fake Follower Checker",
    href: "/fake-follower-checker",
    description: "Spot bot activity, ghost followers, and audience authenticity signals.",
    category: "analytics",
    icon: "🤖",
    keywords: ["bots", "audit", "authenticity"],
  },
  {
    name: "Follower Ratio Checker",
    href: "/follower-ratio-checker",
    description: "Calculate follower-to-following ratio and authority score.",
    category: "analytics",
    icon: "⚖️",
    keywords: ["ratio", "following", "metrics"],
  },
  {
    name: "Follower Tracker",
    href: "/follower-tracker",
    description: "Track follower milestones, growth velocity, and daily projections.",
    category: "analytics",
    icon: "📈",
    keywords: ["growth", "stats", "counter"],
  },
  {
    name: "Engagement Rate Calculator",
    href: "/engagement-calculator",
    description: "Calculate exact engagement rate by likes, comments, saves, and followers.",
    category: "analytics",
    icon: "💯",
    featured: true,
    keywords: ["er", "likes", "comments", "rate"],
  },
  {
    name: "EMV Calculator",
    href: "/emv-calculator",
    description: "Measure Earned Media Value (EMV) for influencer campaigns.",
    category: "analytics",
    icon: "💎",
    keywords: ["roi", "brand", "sponsorship"],
  },
  {
    name: "Instagram Money Calculator",
    href: "/money-calculator",
    description: "Estimate how much creators can charge per sponsored Reel or post.",
    category: "analytics",
    icon: "💰",
    badge: "Popular",
    keywords: ["earnings", "income", "pricing"],
  },
  {
    name: "Media Kit Generator",
    href: "/media-kit-generator",
    description: "Build a sleek, brand-ready creator media kit to pitch sponsors.",
    category: "analytics",
    icon: "💼",
    badge: "New",
    keywords: ["portfolio", "pitch", "sponsors"],
  },
  {
    name: "Username Availability Checker",
    href: "/username-checker",
    description: "Check handle availability and generate clean username ideas.",
    category: "analytics",
    icon: "🆔",
    keywords: ["handle", "name", "check"],
  },
  {
    name: "Is Instagram Down?",
    href: "/is-instagram-down",
    description: "Check live Instagram server status, outages, and API health.",
    category: "analytics",
    icon: "📡",
    keywords: ["status", "outage", "server down"],
  },

  // 5. Visual, Grid & Media Editing
  {
    name: "Grid Planner",
    href: "/grid-planner",
    description: "Preview and arrange your upcoming posts into a 3-column Instagram grid.",
    category: "visual",
    icon: "📅",
    badge: "Popular",
    featured: true,
    keywords: ["aesthetic", "layout", "preview"],
  },
  {
    name: "Grid Splitter (3x3)",
    href: "/grid-splitter",
    description: "Slice one large photo into 3, 6, or 9 seamless tiles for your profile grid.",
    category: "visual",
    icon: "✂️",
    featured: true,
    keywords: ["giant square", "tiles", "puzzle"],
  },
  {
    name: "Grid Architect",
    href: "/grid-architect",
    description: "Design checkerboard, row-by-row, and color-coordinated feed aesthetics.",
    category: "visual",
    icon: "🏛️",
    keywords: ["theme", "feed design", "planner"],
  },
  {
    name: "DP Ring Maker",
    href: "/dp-ring-maker",
    description: "Add glowing Story gradient rings and borders to your profile picture.",
    category: "visual",
    icon: "🍩",
    badge: "Popular",
    keywords: ["border", "circle", "avatar frame"],
  },
  {
    name: "Photo Resizer (No Crop)",
    href: "/photo-resizer",
    description: "Resize images to exact Instagram 1:1, 4:5, and 9:16 aspect ratios.",
    category: "visual",
    icon: "📐",
    keywords: ["aspect ratio", "square", "portrait"],
  },
  {
    name: "Photo Filters Studio",
    href: "/photo-filters",
    description: "Apply aesthetic presets, grain, and color grading before posting.",
    category: "visual",
    icon: "🎨",
    keywords: ["presets", "luts", "effects"],
  },
  {
    name: "Image Compressor",
    href: "/image-compressor",
    description: "Optimize image file size without losing sharpness before uploading.",
    category: "visual",
    icon: "🗜️",
    keywords: ["shrink", "optimize", "quality"],
  },
  {
    name: "Collage Maker",
    href: "/collage-maker",
    description: "Combine multiple photos into aesthetic Story and carousel layouts.",
    category: "visual",
    icon: "🧩",
    keywords: ["grid", "combine", "layout"],
  },
  {
    name: "Color Palette Extractor",
    href: "/color-palette",
    description: "Extract hex color codes and aesthetic palettes from any photo.",
    category: "visual",
    icon: "🌈",
    keywords: ["hex", "colors", "brand kit"],
  },
  {
    name: "Privacy Blur Tool",
    href: "/blur-tool",
    description: "Blur sensitive faces, usernames, or backgrounds in screenshots.",
    category: "visual",
    icon: "🌫️",
    keywords: ["censor", "redact", "background blur"],
  },
  {
    name: "Quote Post Maker",
    href: "/quote-maker",
    description: "Create shareable typography quote graphics for feeds and Stories.",
    category: "visual",
    icon: "💬",
    keywords: ["text post", "motivational", "graphic"],
  },
  {
    name: "Reel Frame Grabber",
    href: "/reel-frame-grabber",
    description: "Extract crystal-clear still frames from any second of a video or Reel.",
    category: "visual",
    icon: "🎞️",
    keywords: ["screenshot", "frame", "still"],
  },
  {
    name: "Video Trimmer",
    href: "/video-trimmer",
    description: "Cut and trim video clips right in your browser for Stories and Reels.",
    category: "visual",
    icon: "✂️",
    keywords: ["cut", "clip", "editor"],
  },
  {
    name: "Video to GIF Converter",
    href: "/video-to-gif",
    description: "Convert short video moments into looping GIFs for stickers and chats.",
    category: "visual",
    icon: "👾",
    keywords: ["gif", "loop", "meme"],
  },

  // 6. Text, Hashtags & Utilities
  {
    name: "Instagram Font Generator",
    href: "/font-generator",
    description: "Generate stylish Unicode fonts for your Instagram bio, name, and captions.",
    category: "utilities",
    icon: "🔤",
    badge: "Popular",
    featured: true,
    keywords: ["fancy text", "bio fonts", "cursive", "bold"],
  },
  {
    name: "Banned Hashtag Checker",
    href: "/hashtag-checker",
    description: "Scan your hashtag list to remove flagged or shadowbanned tags.",
    category: "utilities",
    icon: "#️⃣",
    badge: "Popular",
    featured: true,
    keywords: ["safe tags", "banned", "shadowban"],
  },
  {
    name: "Hashtag Counter",
    href: "/hashtag-counter",
    description: "Count hashtags in real time and stay within the 30-tag limit.",
    category: "utilities",
    icon: "🔢",
    keywords: ["limit", "30 tags", "count"],
  },
  {
    name: "Hashtag Extractor",
    href: "/hashtag-extractor",
    description: "Pull and clean all hashtags from top-performing posts.",
    category: "utilities",
    icon: "🧲",
    keywords: ["scrape tags", "copy hashtags"],
  },
  {
    name: "Character & Bio Counter",
    href: "/character-counter",
    description: "Check Instagram bio (150 chars) and caption (2,200 chars) limits.",
    category: "utilities",
    icon: "📏",
    keywords: ["word count", "bio limit", "length"],
  },
  {
    name: "Case Converter",
    href: "/case-converter",
    description: "Switch text between Title Case, UPPERCASE, and lowercase.",
    category: "utilities",
    icon: "🔡",
    keywords: ["uppercase", "lowercase", "capitalize"],
  },
  {
    name: "Invisible Character",
    href: "/invisible-character",
    description: "Copy invisible blank spaces for clean bio centering and line breaks.",
    category: "utilities",
    icon: "⬜",
    keywords: ["blank space", "empty", "line break"],
  },
  {
    name: "Bio Link Shortener",
    href: "/link-shortener",
    description: "Create clean, short links for your Instagram bio and Story stickers.",
    category: "utilities",
    icon: "🔗",
    keywords: ["url", "short link", "bio"],
  },
  {
    name: "UTM Link Builder",
    href: "/utm-builder",
    description: "Generate trackable campaign URLs for bio links and promotions.",
    category: "utilities",
    icon: "🎯",
    keywords: ["analytics", "tracking", "marketing"],
  },
  {
    name: "Instagram DM Link Generator",
    href: "/dm-link-generator",
    description: "Create a direct click-to-DM link for your Instagram profile.",
    category: "utilities",
    icon: "✉️",
    badge: "New",
    keywords: ["ig.me", "direct message", "lead gen"],
  },
  {
    name: "Comments Exporter",
    href: "/comments-exporter",
    description: "Export post comments for audience research and giveaway audits.",
    category: "utilities",
    icon: "🗂️",
    keywords: ["csv", "comments", "export"],
  },
  {
    name: "Giveaway Winner Picker",
    href: "/giveaway-picker",
    description: "Pick fair, random winners from Instagram comments with custom rules.",
    category: "utilities",
    icon: "🎁",
    badge: "Popular",
    keywords: ["contest", "raffle", "random picker"],
  },
  {
    name: "Lucky Wheel Spinner",
    href: "/wheel-spinner",
    description: "Spin an interactive prize wheel for live streams and Story giveaways.",
    category: "utilities",
    icon: "🎡",
    keywords: ["spin", "random", "giveaway"],
  },
  {
    name: "Winner Certificate Maker",
    href: "/winner-certificate",
    description: "Generate a verified Story announcement card for your giveaway winner.",
    category: "utilities",
    icon: "🏆",
    keywords: ["proof", "badge", "award"],
  },
  {
    name: "Quick Action Launcher",
    href: "/quick-action",
    hidden: true,
    description: "Jump straight to any downloader or creator utility with one shortcut.",
    category: "utilities",
    icon: "⚡",
    keywords: ["shortcuts", "fast", "command"],
  },

  // 7. Fun & Viral Interactive Tools
  {
    name: "AI Profile Roaster",
    href: "/profile-roaster",
    description: "Get a hilarious, savage AI roast of any Instagram aesthetic and bio.",
    category: "fun",
    icon: "🔥",
    badge: "Hot",
    featured: true,
    keywords: ["roast", "funny", "meme", "ai"],
  },
  {
    name: "Profile Battle (1v1)",
    href: "/profile-battle",
    description: "Pit two Instagram accounts head-to-head to see who wins.",
    category: "fun",
    icon: "⚔️",
    badge: "Popular",
    keywords: ["versus", "compare", "battle"],
  },
  {
    name: "Insta Kundli",
    href: "/insta-kundli",
    description: "Discover your creator rashi, algorithm graha dosh, and viral destiny.",
    category: "fun",
    icon: "🪐",
    badge: "Hot",
    featured: true,
    keywords: ["astrology", "zodiac", "kundali", "desi"],
  },
  {
    name: "Insta Wrapped",
    href: "/insta-wrapped",
    description: "Generate a Wrapped-style recap card for any Instagram profile.",
    category: "fun",
    icon: "🎉",
    badge: "Popular",
    featured: true,
    keywords: ["recap", "summary", "year in review"],
  },
  {
    name: "Creator Crystal Ball",
    href: "/crystal-ball",
    description: "Predict where your Instagram account will be in the next 12 months.",
    category: "fun",
    icon: "🔮",
    keywords: ["future", "prediction", "fortune"],
  },
  {
    name: "Insta Guess Game",
    href: "/insta-guess",
    description: "Play the interactive guessing game with creator stats.",
    category: "fun",
    icon: "🎮",
    keywords: ["quiz", "trivia", "game"],
  },
  {
    name: "Creator Time Capsule",
    href: "/time-capsule",
    description: "Lock in your current follower count and goals to open in the future.",
    category: "fun",
    icon: "⏳",
    badge: "New",
    keywords: ["milestone", "memory", "goals"],
  },
];


/* ── AI suite (/ai/[tool]) — pehle registry me nahi the (A10) ── */
const AI_SUITE: ToolItem[] = AI_TOOLS.map((t) => ({
  name: t.name.replace(/^AI /i, "").replace(/^./, (c) => c.toUpperCase()),
  href: `/ai/${t.slug}`,
  description: t.lead,
  category: "ai" as const,
  icon: "🪄",
  badge: "AI" as const,
  keywords: [t.slug.replace(/-/g, " "), "ai", "generator"],
}));

/* ── Instagram hub (naya) — PRD §10.6 ── */
const INSTAGRAM_HUB: ToolItem = {
  name: "Instagram Downloader",
  href: "/instagram-downloader",
  description: "One page for Reels, Stories, Photos, Carousels, Highlights and profile pictures — link auto-detected.",
  category: "downloaders",
  icon: "📸",
  badge: "Popular",
  featured: true,
  keywords: ["instagram", "reel", "story", "photo", "carousel", "highlights", "dp", "download", "auto"],
};

/** Poora registry: 84 + 13 (AI suite) + 1 (hub) = 98 entries, 4 hidden → 94 visible. */
export const REGISTRY: ToolItem[] = [INSTAGRAM_HUB, ...ALL_SUPPORTED_TOOLS, ...AI_SUITE];
export const visibleTools: ToolItem[] = REGISTRY.filter((t) => !t.hidden);
export const TOOL_COUNT = visibleTools.length;

/** Tools screen category pills (PRD §9.1 / §9.3). */
export type ToolPill = "popular" | "all" | "downloaders" | "ai" | "analytics" | "visual" | "utilities" | "fun";
export const TOOL_PILLS: { id: ToolPill; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "all", label: "All" },
  { id: "downloaders", label: "Downloaders" },
  { id: "ai", label: "AI & Creator" },
  { id: "analytics", label: "Analytics" },
  { id: "visual", label: "Visual Studio" },
  { id: "utilities", label: "Utilities" },
  { id: "fun", label: "Fun" },
];

/** Platforms ("platforms" category) apps row me alag dikhte hain — baaki category-wise. */
export function pillOf(t: ToolItem): Exclude<ToolPill, "popular" | "all"> {
  if (t.category === "platforms") return "downloaders";
  // Caption Extractor AI nahi — Downloaders me (PRD §9.3)
  if (t.href === "/caption-extractor") return "downloaders";
  return t.category;
}

export function toolsForPill(pill: ToolPill): ToolItem[] {
  if (pill === "all") return visibleTools;
  if (pill === "popular") return visibleTools.filter((t) => t.featured || t.badge === "Popular");
  return visibleTools.filter((t) => pillOf(t) === pill);
}

export function searchTools(q: string, list: ToolItem[] = visibleTools): ToolItem[] {
  const s = q.trim().toLowerCase();
  if (!s) return list;
  return list.filter((t) =>
    t.name.toLowerCase().includes(s) || t.description.toLowerCase().includes(s) || (t.keywords ?? []).some((k) => k.toLowerCase().includes(s)),
  );
}

/** Back Bar title: path → registry naam (fallback: page ka h1 / metadata). */
export function titleForPath(path: string): string | undefined {
  const p = path.replace(/\/+$/, "") || "/";
  const hit = REGISTRY.find((t) => t.href === p);
  if (hit) return hit.name;
  const plat = PLATFORMS.find((pl) => pl.route === p);
  return plat ? `${plat.name} Downloader` : undefined;
}
