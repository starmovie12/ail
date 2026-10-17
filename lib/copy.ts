import {
  Clapperboard,
  CircleDashed,
  Image as ImageIcon,
  TextQuote,
  Hash,
  Video,
  GalleryHorizontalEnd,
  Eye,
  CircleUserRound,
  BookMarked,
  LayoutGrid,
  ImageDown,
  Download,
  ShieldCheck,
} from "lucide-react";
import type { Tool } from "@/components/ToolCard";

/** Focused core groups for Homepage and Footer SEO authority */
export const TOOL_GROUPS: { heading: string; tools: Tool[] }[] = [
  {
    heading: "Instagram Downloaders",
    tools: [
      { href: "/reels-downloader", title: "Reels downloader", desc: "Every reel in HD MP4 — with its caption and hashtags.", Icon: Clapperboard, badge: "Hot" },
      { href: "/story-downloader", title: "Story downloader", desc: "Save public stories before they vanish at 24 hours.", Icon: CircleDashed },
      { href: "/photo-downloader", title: "Photo downloader", desc: "Original quality, untouched. Carousels included.", Icon: ImageIcon },
      { href: "/carousel-downloader", title: "Carousel downloader", desc: "All ten slides, each with its own HD download.", Icon: GalleryHorizontalEnd },
      { href: "/video-downloader", title: "Video downloader", desc: "Reels, IGTV and video posts — HD MP4, no watermark.", Icon: Video },
      { href: "/highlights-downloader", title: "Highlights downloader", desc: "Covers plus the stories inside each album.", Icon: BookMarked },
      { href: "/profile-picture-downloader", title: "Profile picture downloader", desc: "The full-size HD original, not the tiny circle.", Icon: CircleUserRound },
      { href: "/thumbnail-downloader", title: "Thumbnail downloader", desc: "Any reel or video's HD cover image.", Icon: ImageDown },
    ],
  },
  {
    heading: "Creator & Research Tools",
    tools: [
      { href: "/caption-extractor", title: "Caption extractor", desc: "The full caption, one click to copy. No retyping.", Icon: TextQuote, badge: "Signature" },
      { href: "/hashtag-extractor", title: "Hashtag extractor", desc: "Every hashtag as chips — copy one or all.", Icon: Hash, badge: "Signature" },
      { href: "/profile-viewer", title: "Profile viewer", desc: "Bio, stats and a grid of every recent post — anonymously.", Icon: LayoutGrid },
      { href: "/story-viewer", title: "Anonymous story viewer", desc: "Watch public stories without leaving a trace.", Icon: Eye },
    ],
  },
];

export const TOOLS: Tool[] = TOOL_GROUPS.flatMap((g) => g.tools);

export const QUARTET = [
  { t: "Caption + hashtags included", d: "Others give you a file. We give you the whole post — text, tags and mentions, ready to copy.", icon: "TextQuote", signature: true },
  { t: "One box, everything", d: "Paste a link or a @username — the bar detects it and pulls the media or the whole profile. No page-hopping.", icon: "GalleryHorizontalEnd" },
  { t: "Built for creators", d: "Extract hooks, research niche hashtags, and save clean HD reference media in one click.", icon: "Download" },
  { t: "Nothing stored", d: "Links are processed in memory and never saved. No account, no login, no trace.", icon: "ShieldCheck" },
];
