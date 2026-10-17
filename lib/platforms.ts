/**
 * PLATFORMS — capability map (PRD §10.6). Home grid, Tools "Apps" row, app-page pills,
 * How-to table aur Smart Link Router (lib/router.ts) — sab isi se.
 * Client-safe (koi heavy import nahi) taaki Home bundle halka rahe.
 */
import type { PlatformKey } from "@/components/PlatformIcons";

export type PlatformId = "instagram" | "facebook" | "tiktok" | "youtube" | "pinterest" | "x" | "threads";
export type SoonId = "snapchat" | "reddit" | "linkedin" | "telegram" | "twitch" | "vimeo";

export type Pill = { id: string; label: string };

export type PlatformDef = {
  id: PlatformId;
  name: string;
  /** Detail page route (app page) */
  route: string;
  iconKey: PlatformKey;
  /** Home grid ka chhota sub-label */
  tagline: string;
  /** App page ke hero chips (sirf sach wale) */
  chips: string[];
  pills: Pill[];
  hostSuffixes: string[];
  /** Extra hostname regex (jaise pinterest.<tld>) — anchored hona chahiye */
  hostPattern?: RegExp;
  backend: string;
  status: "live";
  placeholder: string;
  /** Short description for hero card */
  desc: string;
};

export type SoonDef = {
  id: SoonId;
  name: string;
  iconKey: PlatformKey;
  hostSuffixes: string[];
  status: "soon";
};

const AUTO: Pill = { id: "auto", label: "Auto" };

export const PLATFORMS: PlatformDef[] = [
  {
    id: "instagram", name: "Instagram", route: "/instagram-downloader", iconKey: "instagram",
    tagline: "Reels · Stories · Photos",
    chips: ["HD Quality", "No Login", "Fast & Free"],
    pills: [AUTO, { id: "reel", label: "Reel" }, { id: "story", label: "Story" }, { id: "photo", label: "Photo / Carousel" },
      { id: "video", label: "Video" }, { id: "highlights", label: "Highlights" }, { id: "profile", label: "Profile / DP" }, { id: "audio", label: "Audio (MP3)" }],
    hostSuffixes: ["instagram.com", "instagr.am"],
    backend: "/api/extract, /api/profile",
    status: "live",
    placeholder: "Paste Instagram Reel, Story, Post link or @username…",
    desc: "Download Instagram Reels, Stories, Photos, Carousels, Highlights and profile pictures in HD.",
  },
  {
    id: "facebook", name: "Facebook", route: "/facebook-downloader", iconKey: "facebook",
    tagline: "Videos · Reels",
    chips: ["HD when available", "No Login", "Public videos only"],
    pills: [AUTO, { id: "video", label: "Video" }, { id: "reel", label: "Reel" }, { id: "photo", label: "Photo" }],
    hostSuffixes: ["facebook.com", "fb.watch", "fb.me"],
    backend: "/api/extract (best-effort)",
    status: "live",
    placeholder: "Paste Facebook video or post link…",
    desc: "Save public Facebook videos, reels and photos. Best-effort — honest errors when Facebook blocks a fetch.",
  },
  {
    id: "youtube", name: "YouTube", route: "/youtube-thumbnail-downloader", iconKey: "youtube",
    tagline: "Thumbnails",
    chips: ["Full HD cover", "No Login", "Fast & Free"],
    pills: [AUTO, { id: "thumbnail", label: "Thumbnail" }],
    hostSuffixes: ["youtube.com", "youtu.be"],
    backend: "client (i.ytimg.com)",
    status: "live",
    placeholder: "Paste a YouTube or Shorts link…",
    desc: "Grab the HD thumbnail of any YouTube video or Short. (Video download is not supported.)",
  },
  {
    id: "tiktok", name: "TikTok", route: "/tiktok-downloader", iconKey: "tiktok",
    tagline: "Videos",
    chips: ["Share links work", "No Login", "Best-effort"],
    pills: [AUTO, { id: "video", label: "Video" }],
    hostSuffixes: ["tiktok.com"],
    backend: "/api/extract (best-effort)",
    status: "live",
    placeholder: "Paste a TikTok link (tiktok.com or vm.tiktok.com)…",
    desc: "Save public TikTok videos — full links and app share links both work.",
  },
  {
    id: "pinterest", name: "Pinterest", route: "/pinterest-downloader", iconKey: "pinterest",
    tagline: "Images · Videos",
    chips: ["Original quality", "No Login", "Fast & Free"],
    pills: [AUTO, { id: "image", label: "Image" }, { id: "video", label: "Video" }],
    hostSuffixes: ["pinterest.com", "pin.it"],
    hostPattern: /(^|\.)pinterest\.(com|co\.uk|com\.au|ca|de|fr|es|it|jp|in|ph|pt|nz|se|ch|at|dk|ie|mx|cl|co|ru)$/i,
    backend: "/api/extract",
    status: "live",
    placeholder: "Paste a Pinterest pin link…",
    desc: "Download Pinterest images and videos in original quality.",
  },
  {
    id: "x", name: "X", route: "/twitter-downloader", iconKey: "x",
    tagline: "Videos · Photos",
    chips: ["HD MP4", "No Login", "Fast & Free"],
    pills: [AUTO, { id: "video", label: "Video" }, { id: "photo", label: "Photo / GIF" }],
    hostSuffixes: ["x.com", "twitter.com"],
    backend: "/api/extract, /api/twitter",
    status: "live",
    placeholder: "Paste a post link (x.com or twitter.com)…",
    desc: "Save videos, GIFs and photos from public X (Twitter) posts.",
  },
  {
    id: "threads", name: "Threads", route: "/threads-downloader", iconKey: "threads",
    tagline: "Posts · Media",
    chips: ["Original quality", "No Login", "Best-effort"],
    pills: [AUTO, { id: "video", label: "Video" }, { id: "photo", label: "Photo" }],
    hostSuffixes: ["threads.net", "threads.com"],
    backend: "/api/extract",
    status: "live",
    placeholder: "Paste a Threads post link…",
    desc: "Download media from public Threads posts.",
  },
];

/** Backend nahi — router in links ko /coming-soon/{id} par bhejta hai (PRD §7.6.9). */
export const SOON_PLATFORMS: SoonDef[] = [
  { id: "snapchat", name: "Snapchat", iconKey: "snapchat", hostSuffixes: ["snapchat.com"], status: "soon" },
  { id: "reddit", name: "Reddit", iconKey: "reddit", hostSuffixes: ["reddit.com", "redd.it"], status: "soon" },
  { id: "linkedin", name: "LinkedIn", iconKey: "linkedin", hostSuffixes: ["linkedin.com", "lnkd.in"], status: "soon" },
  { id: "telegram", name: "Telegram", iconKey: "telegram", hostSuffixes: ["t.me", "telegram.me", "telegram.org"], status: "soon" },
  { id: "twitch", name: "Twitch", iconKey: "twitch", hostSuffixes: ["twitch.tv"], status: "soon" },
  { id: "vimeo", name: "Vimeo", iconKey: "vimeo", hostSuffixes: ["vimeo.com"], status: "soon" },
];

export function platformById(id: string): PlatformDef | undefined {
  return PLATFORMS.find((p) => p.id === id);
}
export function soonById(id: string): SoonDef | undefined {
  return SOON_PLATFORMS.find((p) => p.id === id);
}
export function platformByRoute(path: string): PlatformDef | undefined {
  return PLATFORMS.find((p) => p.route === path);
}

/** Hostname match: `host === d || host.endsWith("." + d)` — includes() kabhi nahi (PRD §7.6.3 #4). */
export function hostMatches(host: string, suffixes: string[]): boolean {
  const h = host.toLowerCase();
  return suffixes.some((d) => h === d || h.endsWith("." + d));
}

export function platformOfHost(host: string): PlatformDef | undefined {
  const h = host.toLowerCase();
  return PLATFORMS.find((p) => hostMatches(h, p.hostSuffixes) || (p.hostPattern ? p.hostPattern.test(h) : false));
}
export function soonOfHost(host: string): SoonDef | undefined {
  return SOON_PLATFORMS.find((p) => hostMatches(host, p.hostSuffixes));
}
