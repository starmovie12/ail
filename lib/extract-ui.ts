/**
 * UI-facing result shapes for the golden-bar flow, plus mappers from the
 * extraction layer's richer internal types. The UI contract is intentionally
 * small (kind / slides / versions) so the extractor can evolve freely.
 */
import type {
  ExtractResult as CoreResult,
  MediaItem,
  StoryItem,
  PostComment,
} from "./instagram-extractor";

export type { PostComment };

export type MediaVersion = { label: string; url: string; width?: number; height?: number };

export type Slide = {
  type: "video" | "image";
  url: string; // best media url
  thumbnail: string;
  versions: MediaVersion[];
  /** Audio-only track (M4A) when Instagram exposes one for the video */
  audioUrl?: string;
};

export type ExtractResult = {
  kind: "reel" | "post" | "carousel" | "story";
  shortcode: string;
  username: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  thumbnail: string;
  durationSeconds?: number;
  slides: Slide[]; // 1 slide for single post/reel; n for carousel/story tray
  /** Post metadata (A3) — shown when the extractor could read it. */
  likes?: number;
  commentCount?: number;
  views?: number;
  takenAt?: number;
  /** Recent public comments (up to ~40-50) — powers the comments exporter + giveaway picker. */
  comments?: PostComment[];
};

export type UiErrorCode =
  | "PRIVATE"
  | "INVALID_URL"
  | "EXTRACTOR_DOWN"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "STORY_EXPIRED";

function mediaToSlide(m: MediaItem): Slide {
  const versions: MediaVersion[] =
    m.qualities && m.qualities.length
      ? m.qualities
      : [{ label: m.type === "video" ? "HD" : "Original", url: m.url, width: m.width, height: m.height }];
  return { type: m.type, url: m.url, thumbnail: m.thumbnail, versions, audioUrl: m.audioUrl };
}

function storyToSlide(s: StoryItem): Slide {
  const versions: MediaVersion[] =
    s.qualities && s.qualities.length
      ? s.qualities
      : [{ label: s.type === "video" ? "HD" : "Original", url: s.url }];
  return { type: s.type, url: s.url, thumbnail: s.thumbnail, versions, audioUrl: s.audioUrl };
}

export function coreToUi(r: CoreResult): ExtractResult {
  const kind = r.type === "carousel" ? "carousel" : r.type === "video" ? "reel" : "post";
  return {
    kind,
    shortcode: r.shortcode,
    username: r.username,
    caption: r.caption,
    hashtags: r.hashtags,
    mentions: r.mentions,
    thumbnail: r.thumbnail,
    slides: r.media.map(mediaToSlide),
    likes: r.likes,
    commentCount: r.commentCount,
    views: r.views,
    takenAt: r.takenAt,
    comments: r.comments,
  };
}

export function storyItemsToUi(
  items: StoryItem[],
  username: string,
  shortcode: string
): ExtractResult {
  return {
    kind: "story",
    shortcode,
    username,
    caption: "",
    hashtags: [],
    mentions: [],
    thumbnail: items[0]?.thumbnail ?? "",
    slides: items.map(storyToSlide),
  };
}

/** Map the extraction layer's error codes onto the small set the UI knows. */
export function toUiErrorCode(code: string): UiErrorCode {
  switch (code) {
    case "INVALID_URL":
    case "INVALID_USERNAME":
      return "INVALID_URL";
    case "PRIVATE":
      return "PRIVATE";
    case "NOT_FOUND":
    case "NO_HIGHLIGHTS":
      return "NOT_FOUND";
    case "NO_STORIES":
    case "STORY_UNSUPPORTED":
      return "STORY_EXPIRED";
    default:
      return "EXTRACTOR_DOWN";
  }
}

export function statusForUiError(code: UiErrorCode): number {
  switch (code) {
    case "INVALID_URL":
      return 400;
    case "PRIVATE":
      return 403;
    case "NOT_FOUND":
    case "STORY_EXPIRED":
      return 404;
    case "RATE_LIMITED":
      return 429;
    default:
      return 503;
  }
}
