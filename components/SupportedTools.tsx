"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

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
}

export interface SupportedToolsProps {
  currentTool?: string;
  initialCategory?: ToolCategory;
  category?: string;
  showSearch?: boolean;
  compact?: boolean;
  initialLimit?: number;
  limit?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  [key: string]: unknown;
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
    description: "Instagram Reels video seedhe Hindi interface mein HD mein download karein.",
    category: "downloaders",
    icon: "🇮🇳",
    badge: "Hindi",
    keywords: ["hindi", "reels", "bharat"],
  },
  {
    name: "Story Downloader (Hindi)",
    href: "/story-downloader-hindi",
    description: "Instagram Story bina login kiye Hindi mein aasani se save karein.",
    category: "downloaders",
    icon: "🇮🇳",
    badge: "Hindi",
    keywords: ["hindi", "story", "status"],
  },
  {
    name: "Photo Downloader (Hindi)",
    href: "/photo-downloader-hindi",
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

export const SUPPORTED_TOOLS = ALL_SUPPORTED_TOOLS;
export const TOOLS = ALL_SUPPORTED_TOOLS;

const CATEGORIES: { id: ToolCategory; label: string; icon: string }[] = [
  { id: "all", label: "All Tools", icon: "✨" },
  { id: "downloaders", label: "IG Downloaders", icon: "⬇️" },
  { id: "platforms", label: "Multi-Platform", icon: "🌐" },
  { id: "ai", label: "AI & Creator", icon: "🪄" },
  { id: "analytics", label: "Audit & Stats", icon: "📊" },
  { id: "visual", label: "Grid & Visuals", icon: "🎨" },
  { id: "utilities", label: "Text & Utilities", icon: "🛠️" },
  { id: "fun", label: "Fun & Viral", icon: "🔥" },
];

const BADGE_STYLES: Record<ToolBadge, { bg: string; color: string; border: string }> = {
  Popular: {
    bg: "rgb(var(--c-violet-2-rgb) / 0.14)",
    color: "var(--gold-ink)",
    border: "rgb(var(--c-violet-2-rgb) / 0.35)",
  },
  AI: {
    bg: "rgb(var(--c-violet-2-rgb) / 0.16)",
    color: "#a78bfa",
    border: "rgb(var(--c-violet-2-rgb) / 0.38)",
  },
  Hot: {
    bg: "rgb(var(--c-magenta-rgb) / 0.16)",
    color: "var(--gold-ink)",
    border: "rgb(var(--c-magenta-rgb) / 0.40)",
  },
  New: {
    bg: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    border: "rgba(16, 185, 129, 0.35)",
  },
  Hindi: {
    bg: "rgb(var(--c-sky-rgb) / 0.15)",
    color: "#60a5fa",
    border: "rgb(var(--c-sky-rgb) / 0.35)",
  },
};

const COMPONENT_STYLES = `
  .st-root {
    width: 100%;
    padding: 3.5rem 1rem;
  }
  .st-compact {
    padding: 2rem 0.75rem;
  }
  .st-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  .st-header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 2rem;
  }
  .st-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: rgb(var(--c-violet-2-rgb) / 0.1);
    border: 1px solid rgb(var(--c-violet-2-rgb) / 0.25);
    color: var(--c-violet-2);
    margin-bottom: 0.85rem;
  }
  .st-pill-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--c-violet-2);
    box-shadow: 0 0 8px var(--c-violet-2);
  }
  .st-title {
    font-size: clamp(1.65rem, 3.2vw, 2.35rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.2;
    margin: 0 0 0.65rem;
    color: inherit;
  }
  .st-subtitle {
    font-size: 0.98rem;
    line-height: 1.6;
    opacity: 0.76;
    margin: 0;
  }
  .st-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .st-search-wrap {
    position: relative;
    max-width: 560px;
    width: 100%;
    margin: 0 auto;
  }
  .st-search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.95rem;
    pointer-events: none;
    opacity: 0.7;
  }
  .st-search-input {
    width: 100%;
    padding: 0.82rem 2.6rem 0.82rem 2.75rem;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.04);
    color: inherit;
    font-size: 0.94rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .st-search-input:focus {
    border-color: var(--c-violet-2);
    box-shadow: 0 0 0 3px rgb(var(--c-violet-2-rgb) / 0.15);
  }
  .st-clear-btn {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: rgba(148, 163, 184, 0.2);
    color: inherit;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .st-tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  .st-tab {
    display: inline-flex;
    align-items: center;
    gap: 0.42rem;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(148, 163, 184, 0.06);
    color: inherit;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .st-tab:hover {
    border-color: rgb(var(--c-violet-2-rgb) / 0.45);
    transform: translateY(-1px);
  }
  .st-tab-active {
    background: linear-gradient(135deg, var(--c-violet-2), var(--c-violet-2));
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 6px 18px rgb(var(--c-violet-2-rgb) / 0.28);
  }
  .st-tab-count {
    font-size: 0.72rem;
    padding: 0.1rem 0.42rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.14);
    opacity: 0.9;
  }
  .st-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
    gap: 1rem;
  }
  .st-card {
    display: flex;
    flex-direction: column;
    padding: 1.15rem 1.2rem;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(148, 163, 184, 0.04);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .st-card:hover {
    transform: translateY(-3px);
    border-color: rgb(var(--c-violet-2-rgb) / 0.45);
    background: rgb(var(--c-violet-2-rgb) / 0.04);
    box-shadow: 0 12px 28px -10px rgb(var(--c-violet-2-rgb) / 0.22);
  }
  .st-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }
  .st-icon-box {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: rgb(var(--c-violet-2-rgb) / 0.1);
    border: 1px solid rgb(var(--c-violet-2-rgb) / 0.2);
  }
  .st-card-meta {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }
  .st-badge {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.18rem 0.52rem;
    border-radius: 999px;
    border: 1px solid;
  }
  .st-arrow {
    font-size: 0.95rem;
    opacity: 0.45;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .st-card:hover .st-arrow {
    transform: translate(2px, -2px);
    opacity: 0.95;
    color: var(--c-violet-2);
  }
  .st-card-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.38rem;
    line-height: 1.35;
  }
  .st-card-desc {
    font-size: 0.84rem;
    line-height: 1.5;
    opacity: 0.74;
    margin: 0;
  }
  .st-empty {
    text-align: center;
    padding: 3rem 1rem;
    border-radius: 16px;
    border: 1px dashed rgba(148, 163, 184, 0.3);
  }
  .st-empty-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.35rem;
  }
  .st-empty-sub {
    font-size: 0.88rem;
    opacity: 0.7;
    margin: 0 0 1rem;
  }
  .st-reset-btn,
  .st-expand-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.35rem;
    border-radius: 999px;
    border: 1px solid rgb(var(--c-violet-2-rgb) / 0.4);
    background: rgb(var(--c-violet-2-rgb) / 0.1);
    color: inherit;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .st-reset-btn:hover,
  .st-expand-btn:hover {
    background: linear-gradient(135deg, var(--c-violet-2), var(--c-violet-2));
    color: #ffffff;
    border-color: transparent;
    transform: translateY(-1px);
  }
  .st-footer {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
  @media (max-width: 640px) {
    .st-root {
      padding: 2.25rem 0.85rem;
    }
    .st-grid {
      grid-template-columns: 1fr;
    }
    .st-tabs {
      justify-content: flex-start;
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 0.35rem;
    }
    .st-tab {
      white-space: nowrap;
    }
  }
`;

export function SupportedTools({
  currentTool,
  initialCategory = "all",
  category,
  showSearch = true,
  compact = false,
  initialLimit = 18,
  limit,
  title = "Complete Instagram & Creator Toolkit",
  subtitle = "Explore 70+ free downloaders, AI generators, profile audits, and visual grid utilities — no login required.",
  className = "",
}: SupportedToolsProps) {
  const resolvedInitialCategory = (
    category && CATEGORIES.some((c) => c.id === category)
      ? category
      : initialCategory
  ) as ToolCategory;

  const resolvedLimit = typeof limit === "number" ? limit : initialLimit;

  const [activeCategory, setActiveCategory] = useState<ToolCategory>(
    resolvedInitialCategory
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredTools = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return ALL_SUPPORTED_TOOLS.filter((tool) => {
      if (currentTool && tool.href === currentTool) {
        return false;
      }

      const matchesCategory =
        activeCategory === "all" || tool.category === activeCategory;

      if (!matchesCategory) return false;

      if (!normalizedQuery) return true;

      const inName = tool.name.toLowerCase().includes(normalizedQuery);
      const inDesc = tool.description.toLowerCase().includes(normalizedQuery);
      const inKeywords = tool.keywords?.some((k) =>
        k.toLowerCase().includes(normalizedQuery)
      );

      return inName || inDesc || Boolean(inKeywords);
    });
  }, [activeCategory, searchQuery, currentTool]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ToolCategory, number> = {
      all: 0,
      downloaders: 0,
      platforms: 0,
      ai: 0,
      analytics: 0,
      visual: 0,
      utilities: 0,
      fun: 0,
    };

    for (const tool of ALL_SUPPORTED_TOOLS) {
      if (currentTool && tool.href === currentTool) continue;
      counts.all += 1;
      counts[tool.category] += 1;
    }

    return counts;
  }, [currentTool]);

  const shouldTruncate =
    !isExpanded &&
    !searchQuery.trim() &&
    activeCategory === "all" &&
    filteredTools.length > resolvedLimit;

  const visibleTools = useMemo(() => {
    if (!shouldTruncate) return filteredTools;
    const featuredFirst = [
      ...filteredTools.filter((t) => t.featured),
      ...filteredTools.filter((t) => !t.featured),
    ];
    return featuredFirst.slice(0, resolvedLimit);
  }, [filteredTools, shouldTruncate, resolvedLimit]);

  return (
    <section
      className={`st-root ${compact ? "st-compact" : ""} ${className}`}
      aria-label="Supported Instagram Tools"
    >
      <style dangerouslySetInnerHTML={{ __html: COMPONENT_STYLES }} />

      <div className="st-container">
        <div className="st-header">
          <div className="st-pill">
            <span className="st-pill-dot" />
            <span>{ALL_SUPPORTED_TOOLS.length}+ Free Creator Tools</span>
          </div>
          <h2 className="st-title">{title}</h2>
          {!compact && <p className="st-subtitle">{subtitle}</p>}
        </div>

        <div className="st-controls">
          {showSearch && (
            <div className="st-search-wrap">
              <span className="st-search-icon" aria-hidden="true">
                🔎
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isExpanded) setIsExpanded(true);
                }}
                placeholder="Search any tool (e.g., Reels, Shadowban, Kundli, DP, MP3)..."
                className="st-search-input"
                aria-label="Search tools"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="st-clear-btn"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="st-tabs" role="tablist" aria-label="Tool categories">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id !== "all") setIsExpanded(true);
                  }}
                  className={`st-tab ${isActive ? "st-tab-active" : ""}`}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="st-tab-count">{categoryCounts[cat.id]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {visibleTools.length > 0 ? (
          <div className="st-grid">
            {visibleTools.map((tool) => {
              const badgeStyle = tool.badge ? BADGE_STYLES[tool.badge] : null;

              return (
                <Link key={tool.href} href={tool.href} className="st-card">
                  <div className="st-card-top">
                    <div className="st-icon-box" aria-hidden="true">
                      {tool.icon}
                    </div>
                    <div className="st-card-meta">
                      {tool.badge && badgeStyle && (
                        <span
                          className="st-badge"
                          style={{
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.color,
                            borderColor: badgeStyle.border,
                          }}
                        >
                          {tool.badge}
                        </span>
                      )}
                      <span className="st-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </div>
                  </div>

                  <h3 className="st-card-title">{tool.name}</h3>
                  <p className="st-card-desc">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="st-empty">
            <p className="st-empty-title">
              No tool found for &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="st-empty-sub">
              Try searching with another keyword or reset the category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="st-reset-btn"
            >
              Show All Tools
            </button>
          </div>
        )}

        {filteredTools.length > resolvedLimit &&
          !searchQuery.trim() &&
          activeCategory === "all" && (
            <div className="st-footer">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="st-expand-btn"
              >
                {isExpanded ? (
                  <>
                    <span>Show Featured Tools Only</span>
                    <span aria-hidden="true">↑</span>
                  </>
                ) : (
                  <>
                    <span>
                      Explore All {filteredTools.length} Tools (+
                      {filteredTools.length - visibleTools.length} More)
                    </span>
                    <span aria-hidden="true">↓</span>
                  </>
                )}
              </button>
            </div>
          )}
      </div>
    </section>
  );
}

export default SupportedTools;
