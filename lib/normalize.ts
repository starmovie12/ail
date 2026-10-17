/**
 * Extract-response normalizer — GoldenBar.tsx se nikala gaya (PRD §10.7 / §16.1).
 * GoldenBar, PlatformDownloader aur ResultPanel teeno yahi use karte hain. Client + server safe.
 */

export interface MediaItem {
  url: string;
  type: "video" | "image" | "audio";
  thumbnail?: string;
  quality?: string;
  width?: number;
  height?: number;
  filename?: string;
  audioUrl?: string;
}

export interface ExtractedResult {
  success?: boolean;
  platform?: string;
  type?: string;
  title?: string;
  caption?: string;
  author?: {
    username?: string;
    fullName?: string;
    avatar?: string;
    verified?: boolean;
    followers?: number;
    following?: number;
    postsCount?: number;
    bio?: string;
  };
  thumbnail?: string;
  url?: string;
  videoUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  media?: MediaItem[];
  items?: MediaItem[];
  shortcode?: string;
  timestamp?: number;
  likes?: number;
  comments?: number;
  views?: number;
}


export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

export function getStr(val: unknown): string | undefined {
  return typeof val === "string" && val.trim().length > 0 ? val.trim() : undefined;
}

export function getNum(val: unknown): number | undefined {
  return typeof val === "number" && !Number.isNaN(val) ? val : undefined;
}

export function getBool(val: unknown): boolean {
  return Boolean(val);
}

export function buildDownloadProxyUrl(mediaUrl: string, filename = "instagram-media"): string {
  if (!mediaUrl) return "#";
  return `/api/download?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(filename)}`;
}

export function normalizeApiResponse(rawPayload: unknown, inputVal: string): ExtractedResult {
  const root = isRecord(rawPayload) ? rawPayload : {};
  const data = isRecord(root.data)
    ? root.data
    : isRecord(root.result)
    ? root.result
    : root;

  const mediaList: MediaItem[] = [];

  if (Array.isArray(data.media)) {
    for (const item of data.media) {
      if (typeof item === "string") {
        mediaList.push({
          url: item,
          type: item.includes(".mp4") ? "video" : "image",
        });
      } else if (isRecord(item)) {
        const itemUrl =
          getStr(item.url) ||
          getStr(item.videoUrl) ||
          getStr(item.imageUrl) ||
          getStr(item.src);
        if (itemUrl) {
          const isVid =
            item.type === "video" ||
            getBool(item.isVideo) ||
            Boolean(getStr(item.videoUrl));
          mediaList.push({
            url: itemUrl,
            type: isVid ? "video" : item.type === "audio" ? "audio" : "image",
            thumbnail:
              getStr(item.thumbnail) ||
              getStr(item.poster) ||
              getStr(item.preview),
            quality: getStr(item.quality) || "HD",
            audioUrl: getStr(item.audioUrl),
          });
        }
      }
    }
  } else if (Array.isArray(data.items)) {
    for (const item of data.items) {
      if (isRecord(item)) {
        const u =
          getStr(item.url) ||
          getStr(item.video_url) ||
          getStr(item.display_url) ||
          getStr(item.src);
        if (u) {
          const isVid =
            item.type === "video" ||
            getBool(item.is_video) ||
            Boolean(getStr(item.video_url));
          mediaList.push({
            url: u,
            type: isVid ? "video" : "image",
            thumbnail: getStr(item.thumbnail) || getStr(item.display_url),
            quality: getStr(item.quality) || "HD",
          });
        }
      }
    }
  }

  const singleVideo =
    getStr(data.videoUrl) ||
    getStr(data.video_url) ||
    getStr(data.video) ||
    (data.type === "video" ? getStr(data.url) : undefined);

  const singleImage =
    getStr(data.imageUrl) ||
    getStr(data.image) ||
    getStr(data.display_url) ||
    getStr(data.profilePicHd) ||
    getStr(data.profile_pic_url_hd) ||
    getStr(data.avatar) ||
    getStr(data.thumbnail) ||
    (data.type === "image" ? getStr(data.url) : undefined);

  const singleAudio =
    getStr(data.audioUrl) || getStr(data.audio_url) || getStr(data.musicUrl) || mediaList.find((m) => m.audioUrl)?.audioUrl;

  if (mediaList.length === 0) {
    if (singleVideo) {
      mediaList.push({
        url: singleVideo,
        type: "video",
        thumbnail: singleImage || getStr(data.thumbnail),
        quality: "Full HD",
      });
    } else if (singleImage) {
      mediaList.push({
        url: singleImage,
        type: "image",
        thumbnail: singleImage,
        quality: "Original HD",
      });
    } else {
      const directUrl = getStr(data.url);
      if (directUrl) {
        mediaList.push({
          url: directUrl,
          type: directUrl.includes(".mp4") ? "video" : "image",
          thumbnail: getStr(data.thumbnail),
          quality: "HD",
        });
      }
    }
  }

  if (Array.isArray(data.posts) && mediaList.length <= 1) {
    for (const post of data.posts) {
      if (isRecord(post)) {
        const postUrl =
          getStr(post.videoUrl) ||
          getStr(post.video_url) ||
          getStr(post.displayUrl) ||
          getStr(post.display_url) ||
          getStr(post.url);
        if (postUrl) {
          const isVid =
            getBool(post.isVideo) ||
            getBool(post.is_video) ||
            Boolean(getStr(post.videoUrl));
          mediaList.push({
            url: postUrl,
            type: isVid ? "video" : "image",
            thumbnail:
              getStr(post.thumbnail) ||
              getStr(post.displayUrl) ||
              getStr(post.display_url),
            quality: "Feed Post",
          });
        }
      }
    }
  }

  const authorRec = isRecord(data.author) ? data.author : {};
  const ownerRec = isRecord(data.owner) ? data.owner : {};
  const followedByRec = isRecord(data.edge_followed_by) ? data.edge_followed_by : {};
  const followRec = isRecord(data.edge_follow) ? data.edge_follow : {};
  const timelineRec = isRecord(data.edge_owner_to_timeline_media)
    ? data.edge_owner_to_timeline_media
    : {};

  const username =
    getStr(authorRec.username) ||
    getStr(data.username) ||
    getStr(ownerRec.username) ||
    (inputVal.startsWith("@") ? inputVal.slice(1) : undefined);

  const captionText =
    getStr(data.caption) || getStr(data.description) || getStr(data.text) || getStr(data.bio) || "";

  const authorAvatar =
    getStr(authorRec.avatar) ||
    getStr(data.profilePicHd) ||
    getStr(data.profile_pic_url_hd) ||
    getStr(data.profilePic) ||
    getStr(data.avatar);

  return {
    success: true,
    platform: getStr(data.platform) || "instagram",
    type: getStr(data.type) || (mediaList[0]?.type ?? "media"),
    title:
      getStr(data.title) ||
      (captionText ? captionText.slice(0, 90) : undefined) ||
      (username ? `@${username}` : "Instagram Media"),
    caption: captionText,
    author: {
      username,
      fullName:
        getStr(authorRec.fullName) ||
        getStr(data.fullName) ||
        getStr(data.full_name) ||
        getStr(ownerRec.full_name),
      avatar: authorAvatar,
      verified:
        getBool(authorRec.verified) ||
        getBool(data.isVerified) ||
        getBool(data.is_verified),
      followers: getNum(data.followers) ?? getNum(followedByRec.count),
      following: getNum(data.following) ?? getNum(followRec.count),
      postsCount: getNum(data.postsCount) ?? getNum(timelineRec.count),
      bio: getStr(data.bio) || getStr(data.biography),
    },
    thumbnail:
      getStr(data.thumbnail) ||
      mediaList[0]?.thumbnail ||
      singleImage ||
      authorAvatar,
    url: mediaList[0]?.url || singleVideo || singleImage,
    videoUrl: singleVideo || mediaList.find((m) => m.type === "video")?.url,
    imageUrl: singleImage || mediaList.find((m) => m.type === "image")?.url,
    audioUrl: singleAudio,
    media: mediaList,
    likes: getNum(data.likes) ?? getNum(data.like_count),
    comments: getNum(data.comments) ?? getNum(data.comment_count),
    views: getNum(data.views) ?? getNum(data.view_count),
  };
}
