/** Small shared client helpers for media tools. */

/** Route a CDN url through our same-origin download proxy (loads IG images, forces a real download). */
export function dl(url: string, name: string): string {
  return `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
}

/** Compact count: 1234567 → "1.2M". */
export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export type FeedPost = {
  shortcode: string;
  type: "image" | "video" | "carousel";
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  takenAt: number;
  isPinned?: boolean;
};

export type ProfileFeed = {
  username: string;
  fullName: string;
  userId: string;
  isPrivate: boolean;
  isVerified: boolean;
  biography: string;
  followers: number;
  following: number;
  posts: number;
  profilePicHd: string;
  postsList: FeedPost[];
  hasMore: boolean;
};
