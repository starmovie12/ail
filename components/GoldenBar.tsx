"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardPaste, Download, Link2, ShieldCheck, Sparkles, X, Zap } from "lucide-react";

export type GoldenBarMode =
  | "auto"
  | "reel"
  | "story"
  | "photo"
  | "video"
  | "carousel"
  | "dp"
  | "profile"
  | "audio"
  | "highlights"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "pinterest"
  | "threads"
  | "youtube";

export interface MediaItem {
  url: string;
  type: "video" | "image" | "audio";
  thumbnail?: string;
  quality?: string;
  width?: number;
  height?: number;
  filename?: string;
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

export interface HistoryEntry {
  id: string;
  input: string;
  platform: string;
  title: string;
  thumbnail?: string;
  timestamp: number;
}

export interface GoldenBarProps {
  placeholder?: string;
  mode?: GoldenBarMode | string;
  toolType?: string;
  platform?: string;
  initialValue?: string;
  defaultUrl?: string;
  buttonText?: string;
  compact?: boolean;
  autoFocus?: boolean;
  /** "neon" = naya glass card (input → Paste Link + Grab Media). Na do to purana look. */
  variant?: "default" | "neon";
  /** Neon card ke andar form ke neeche ka slot (jaise <ToolsAutoSupported />). */
  footer?: React.ReactNode;
  showQuickModes?: boolean;
  showHistory?: boolean;
  showTrustBadges?: boolean;
  onResult?: (data: ExtractedResult) => void;
  onExtract?: (data: ExtractedResult) => void;
  onError?: (message: string) => void;
  className?: string;
  [key: string]: unknown;
}

interface DetectedPlatform {
  id: string;
  label: string;
  icon: string;
  color: string;
  isUsername?: boolean;
}

const QUICK_MODES: { id: GoldenBarMode; label: string; icon: string; hint: string }[] = [
  { id: "auto", label: "Auto Detect", icon: "✨", hint: "Paste any link or @username..." },
  { id: "reel", label: "Reels HD", icon: "🎬", hint: "Paste Instagram Reel link..." },
  { id: "story", label: "Stories", icon: "⭕", hint: "Paste Story link or @username..." },
  { id: "photo", label: "Photo / Carousel", icon: "🖼️", hint: "Paste Instagram Post or Carousel URL..." },
  { id: "dp", label: "HD DP / Profile", icon: "👤", hint: "Enter Instagram @username or profile URL..." },
  { id: "audio", label: "Reel to MP3", icon: "🎵", hint: "Paste Reel link to extract MP3 audio..." },
];

const HISTORY_STORAGE_KEY = "ig_goldenbar_recent_v1";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function getStr(val: unknown): string | undefined {
  return typeof val === "string" && val.trim().length > 0 ? val.trim() : undefined;
}

function getNum(val: unknown): number | undefined {
  return typeof val === "number" && !Number.isNaN(val) ? val : undefined;
}

function getBool(val: unknown): boolean {
  return Boolean(val);
}

function detectInputType(raw: string, fallbackMode: string): DetectedPlatform {
  const val = raw.trim();
  if (!val) {
    return { id: "instagram", label: "Instagram", icon: "📸", color: "#ec4899" };
  }

  const lower = val.toLowerCase();

  if (lower.includes("instagram.com") || lower.includes("instagr.am")) {
    if (lower.includes("/reel/") || lower.includes("/reels/")) {
      return { id: "ig-reel", label: "IG Reel", icon: "🎬", color: "#ec4899" };
    }
    if (lower.includes("/stories/")) {
      return { id: "ig-story", label: "IG Story", icon: "⭕", color: "#22E4FF" };
    }
    if (lower.includes("/p/") || lower.includes("/tv/")) {
      return { id: "ig-post", label: "IG Post", icon: "🖼️", color: "#7C3AED" };
    }
    return { id: "instagram", label: "Instagram", icon: "📸", color: "#ec4899" };
  }

  if (lower.includes("tiktok.com")) {
    return { id: "tiktok", label: "TikTok", icon: "🎵", color: "#22E4FF" };
  }
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return { id: "twitter", label: "X / Twitter", icon: "🐦", color: "#38BDF8" };
  }
  if (lower.includes("facebook.com") || lower.includes("fb.watch")) {
    return { id: "facebook", label: "Facebook", icon: "📘", color: "#2563eb" };
  }
  if (lower.includes("pinterest.") || lower.includes("pin.it")) {
    return { id: "pinterest", label: "Pinterest", icon: "📌", color: "#ef4444" };
  }
  if (lower.includes("threads.net") || lower.includes("threads.com")) {
    return { id: "threads", label: "Threads", icon: "🧵", color: "#D946EF" };
  }
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return { id: "youtube", label: "YouTube", icon: "▶️", color: "#ef4444" };
  }

  const cleanHandle = val.replace(/^@/, "");
  const isHandlePattern = /^[a-zA-Z0-9._]{1,30}$/.test(cleanHandle);
  if (
    val.startsWith("@") ||
    (isHandlePattern && !val.includes("/") && !val.includes(":")) ||
    fallbackMode === "dp" ||
    fallbackMode === "profile"
  ) {
    return {
      id: "username",
      label: `@${cleanHandle || "username"}`,
      icon: "👤",
      color: "#22E4FF",
      isUsername: true,
    };
  }

  return { id: "url", label: "Web Link", icon: "🔗", color: "#7C3AED" };
}

function buildDownloadProxyUrl(mediaUrl: string, filename = "instagram-media"): string {
  if (!mediaUrl) return "#";
  return `/api/download?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(filename)}`;
}

function normalizeApiResponse(rawPayload: unknown, inputVal: string): ExtractedResult {
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
    getStr(data.display_url) ||
    getStr(data.profilePicHd) ||
    getStr(data.profile_pic_url_hd) ||
    getStr(data.avatar) ||
    getStr(data.thumbnail) ||
    (data.type === "image" ? getStr(data.url) : undefined);

  const singleAudio =
    getStr(data.audioUrl) || getStr(data.audio_url) || getStr(data.musicUrl);

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
    getStr(data.caption) || getStr(data.description) || getStr(data.bio) || "";

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

const GOLDEN_BAR_STYLES = `
  .gb-wrapper {
    width: 100%;
    max-width: 820px;
    margin: 0 auto;
  }
  .gb-compact {
    max-width: 680px;
  }
  .gb-modes {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.45rem;
    margin-bottom: 0.9rem;
  }
  .gb-mode-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.38rem;
    padding: 0.42rem 0.85rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid rgb(var(--c-cyan-rgb) / 0.30);
    background: rgba(15, 23, 42, 0.04);
    color: inherit;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .gb-mode-pill:hover {
    border-color: rgb(var(--c-cyan-rgb) / 0.65);
    transform: translateY(-1px);
  }
  .gb-mode-active {
    background: var(--gradient-button);
    color: var(--on-accent);
    border-color: transparent;
    box-shadow: 0 4px 14px rgb(var(--c-violet-2-rgb) / 0.32);
  }
  .gb-form {
    width: 100%;
  }
  .gb-bar-outer {
    padding: 3px;
    border-radius: 20px;
    background: var(--gradient-brand);
    box-shadow: 0 14px 35px -10px rgb(var(--c-violet-2-rgb) / 0.34), 0 0 0 1px rgb(var(--c-cyan-rgb) / 0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .gb-bar-outer:focus-within {
    transform: translateY(-1px);
    box-shadow: 0 18px 42px -10px rgb(var(--c-violet-2-rgb) / 0.48), 0 0 0 3px rgb(var(--c-cyan-rgb) / 0.35);
  }
  .gb-bar-inner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.5rem 0.45rem 0.75rem;
    border-radius: 17px;
    background: var(--surface);
    color: var(--ink);
  }
  .gb-platform-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.38rem 0.7rem;
    border-radius: 12px;
    border: 1px solid;
    font-size: 0.76rem;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .gb-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 0.98rem;
    padding: 0.65rem 0.4rem;
    outline: none;
  }
  .gb-input::placeholder {
    opacity: 0.55;
  }
  .gb-actions {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-shrink: 0;
  }
  .gb-paste-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.55rem 0.85rem;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(148, 163, 184, 0.1);
    color: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .gb-paste-btn:hover {
    background: rgba(148, 163, 184, 0.2);
  }
  .gb-clear-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: rgba(148, 163, 184, 0.18);
    color: inherit;
    cursor: pointer;
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .gb-submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.78rem 1.35rem;
    border-radius: 13px;
    border: none;
    background: var(--gradient-button);
    color: var(--on-accent);
    font-size: 0.92rem;
    font-weight: 800;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 6px 18px rgb(var(--c-violet-2-rgb) / 0.40);
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .gb-submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  .gb-submit-btn:disabled {
    opacity: 0.75;
    cursor: wait;
  }
  .gb-spinner-wrap {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .gb-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgb(5 11 36 / 0.30);
    border-top-color: var(--on-accent);
    border-radius: 50%;
    animation: gbSpin 0.7s linear infinite;
  }
  @keyframes gbSpin {
    to {
      transform: rotate(360deg);
    }
  }
  .gb-trust-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.55rem;
    margin-top: 0.75rem;
    font-size: 0.78rem;
    opacity: 0.75;
  }
  .gb-trust-sep {
    opacity: 0.4;
  }
  .gb-history-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.85rem;
    padding: 0.55rem 0.85rem;
    border-radius: 12px;
    background: rgba(148, 163, 184, 0.06);
    border: 1px solid rgba(148, 163, 184, 0.16);
    font-size: 0.78rem;
  }
  .gb-history-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .gb-history-label {
    font-weight: 700;
    opacity: 0.75;
  }
  .gb-history-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .gb-history-chip {
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: transparent;
    color: inherit;
    font-size: 0.74rem;
    cursor: pointer;
  }
  .gb-history-chip:hover {
    border-color: var(--gold-ink);
    color: var(--gold-ink);
  }
  .gb-history-right {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }
  .gb-history-link {
    color: var(--gold-ink);
    text-decoration: none;
    font-weight: 600;
  }
  .gb-history-clear {
    border: none;
    background: transparent;
    color: inherit;
    opacity: 0.65;
    cursor: pointer;
    font-size: 0.74rem;
  }
  .gb-error-card {
    margin-top: 1.1rem;
    padding: 1rem 1.15rem;
    border-radius: 16px;
    border: 1px solid rgba(239, 68, 68, 0.35);
    background: rgba(239, 68, 68, 0.08);
    text-align: left;
  }
  .gb-error-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .gb-error-icon {
    font-size: 1.25rem;
  }
  .gb-error-title {
    margin: 0 0 0.2rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: #f87171;
  }
  .gb-error-desc {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.88;
  }
  .gb-error-tips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.65rem;
    padding-top: 0.6rem;
    border-top: 1px dashed rgba(239, 68, 68, 0.25);
    font-size: 0.78rem;
    opacity: 0.85;
  }
  .gb-error-link {
    color: var(--gold-ink);
    font-weight: 700;
    text-decoration: underline;
  }
  .gb-result-card {
    margin-top: 1.4rem;
    padding: 1.25rem;
    border-radius: 20px;
    border: 1px solid rgb(var(--c-violet-2-rgb) / 0.30);
    background: rgba(15, 23, 42, 0.04);
    text-align: left;
  }
  .gb-result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.85rem;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }
  .gb-author-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .gb-author-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--c-violet-2);
  }
  .gb-author-name-row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  .gb-author-name {
    font-weight: 800;
    font-size: 1rem;
  }
  .gb-verified {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--c-violet-2);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 800;
  }
  .gb-author-handle {
    font-size: 0.82rem;
    opacity: 0.7;
  }
  .gb-profile-stats {
    display: flex;
    gap: 1rem;
  }
  .gb-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.78rem;
  }
  .gb-dp-btn {
    padding: 0.5rem 0.9rem;
    border-radius: 10px;
    background: rgb(var(--c-cyan-rgb) / 0.14);
    border: 1px solid rgb(var(--c-cyan-rgb) / 0.40);
    color: var(--gold-ink);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 700;
  }
  .gb-media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  .gb-media-item {
    display: flex;
    flex-direction: column;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(0, 0, 0, 0.15);
  }
  .gb-media-preview {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 5;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .gb-video,
  .gb-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .gb-quality-tag {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.72);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
  }
  .gb-media-footer {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding: 0.75rem;
  }
  .gb-download-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.7rem 1rem;
    border-radius: 10px;
    background: var(--gradient-brand);
    color: var(--on-accent);
    text-decoration: none;
    font-weight: 700;
    font-size: 0.86rem;
    text-align: center;
  }
  .gb-download-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.85rem;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    color: inherit;
    text-decoration: none;
    font-size: 0.78rem;
    font-weight: 600;
  }
  .gb-caption-box {
    margin-top: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: rgba(148, 163, 184, 0.06);
    border: 1px solid rgba(148, 163, 184, 0.18);
  }
  .gb-caption-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.45rem;
  }
  .gb-caption-label {
    font-size: 0.78rem;
    font-weight: 700;
    opacity: 0.75;
  }
  .gb-copy-btn {
    padding: 0.28rem 0.65rem;
    border-radius: 8px;
    border: 1px solid rgb(var(--c-violet-2-rgb) / 0.40);
    background: rgb(var(--c-violet-2-rgb) / 0.10);
    color: var(--gold-ink);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }
  .gb-caption-text {
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.5;
    white-space: pre-wrap;
    max-height: 110px;
    overflow-y: auto;
    opacity: 0.85;
  }
  @media (max-width: 640px) {
    .gb-bar-inner {
      flex-wrap: wrap;
      padding: 0.55rem;
    }
    .gb-platform-text {
      display: none;
    }
    .gb-actions {
      width: 100%;
      justify-content: space-between;
      margin-top: 0.35rem;
    }
    .gb-submit-btn {
      flex: 1;
    }
  }

  /* ── NEON: photo jaisa look (globals.css ke BAAD inject hota hai, isliye yahan override chalta hai) ── */

  /* Link icon: gol badge (✕ button ke saath mirror) — fluid 32 → 40px */
  .gb-neon .gbn-field__icon {
    align-items: center;
    justify-content: center;
    width: clamp(32px, 26px + 1.6vw, 40px);
    height: clamp(32px, 26px + 1.6vw, 40px);
    border-radius: 50%;
    border: 1px solid var(--gbn-edge);
    background: var(--surface-3);
  }
  .gb-neon .gbn-field__icon > svg {
    width: clamp(16px, 13px + .8vw, 20px);
    height: clamp(16px, 13px + .8vw, 20px);
  }

  /* Paste Link + Grab Media: poori pill shape */
  .gb-neon .gbn-btn { border-radius: 999px; }

  /* Trust row: card ke ANDAR, buttons aur Tools sub-card ke beech.
     Phones: ONE compact row, 3 equal columns (icon above a ≤2-line label) with the
     vertical dividers kept. ≥561px: icon beside text. ≥768px: single-line items. */
  .gb-neon .gbn-trust {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    margin: var(--gbn-gap) 0 0;
    padding: 4px;
    list-style: none;
    border-radius: clamp(16px, 12px + 1vw, 20px);
    border: 1px solid var(--gbn-edge);
    background: var(--gbn-sub);
  }
  .gb-neon .gbn-trust__item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-height: 52px;
    padding: 3px 4px;
    color: var(--ink);
    font-size: clamp(0.6875rem, 0.62rem + 0.3vw, 0.88rem);
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    text-wrap: balance;
    overflow-wrap: anywhere;
  }
  .gb-neon .gbn-trust__item > span:last-child { min-width: 0; }
  .gb-neon .gbn-trust__item + .gbn-trust__item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    height: 60%;
    max-height: 28px;
    transform: translateY(-50%);
    border-left: 1px solid var(--gbn-edge);
  }
  .gb-neon .gbn-trust__icon {
    flex: 0 0 auto;
    display: inline-flex;
    color: var(--gold-ink);
  }
  .gb-neon .gbn-trust__icon > svg {
    width: clamp(15px, 13px + .5vw, 20px);
    height: clamp(15px, 13px + .5vw, 20px);
  }
  @media (min-width: 561px) {
    .gb-neon .gbn-trust__item {
      flex-direction: row;
      gap: 8px;
      min-height: 52px;
      padding: 0 8px;
    }
  }
  @media (min-width: 768px) {
    .gb-neon .gbn-trust { padding: 0 8px; }
    .gb-neon .gbn-trust__item {
      min-height: 52px;
      white-space: nowrap;
    }
  }
`;

export function GoldenBar({
  placeholder,
  mode = "auto",
  toolType,
  initialValue = "",
  defaultUrl = "",
  buttonText,
  compact = false,
  autoFocus = false,
  variant = "default",
  footer,
  showQuickModes = true,
  showHistory = true,
  showTrustBadges = true,
  onResult,
  onExtract,
  onError,
  className = "",
}: GoldenBarProps) {
  const effectiveInitialMode = (toolType || mode || "auto") as GoldenBarMode;
  const [selectedMode, setSelectedMode] = useState<GoldenBarMode>(effectiveInitialMode);
  const [input, setInput] = useState<string>(initialValue || defaultUrl || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Connecting...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractedResult | null>(null);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [recentHistory, setRecentHistory] = useState<HistoryEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const isNeon = variant === "neon";
  // Neon mein default "Grab Media"; purane look mein pehle jaisa "Download HD"
  const submitLabel = buttonText ?? (isNeon ? "Grab Media" : "Download HD");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentHistory(parsed.slice(0, 6) as HistoryEntry[]);
        }
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const detected = useMemo(
    () => detectInputType(input, selectedMode),
    [input, selectedMode]
  );

  const activePlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    if (isNeon && selectedMode === "auto") return "Paste Instagram, Facebook, or any link...";
    const found = QUICK_MODES.find((m) => m.id === selectedMode);
    return found ? found.hint : "Paste Instagram Reel, Story, Photo link or @username...";
  }, [placeholder, selectedMode, isNeon]);

  const saveToHistory = useCallback((entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    try {
      const newItem: HistoryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
      };
      setRecentHistory((prev) => {
        const filtered = prev.filter((item) => item.input !== entry.input);
        const updated = [newItem, ...filtered].slice(0, 6);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore storage write error
    }
  }, []);

  const clearHistory = () => {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      setRecentHistory([]);
    } catch {
      // Ignore
    }
  };

  // ✕ — input, result aur error teeno saaf (purane clear button jaisa hi)
  const handleClearInput = () => {
    setInput("");
    setErrorMsg(null);
    setResult(null);
    inputRef.current?.focus();
  };

  const handlePasteClipboard = async () => {
    setErrorMsg(null);
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.readText === "function"
      ) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          setInput(clipText.trim());
          inputRef.current?.focus();
          return;
        }
      }
      inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleExtract = async (overrideInput?: string) => {
    const targetInput = (overrideInput ?? input).trim();
    if (!targetInput) {
      setErrorMsg("Please paste an Instagram link or enter an @username first.");
      inputRef.current?.focus();
      return;
    }

    setErrorMsg(null);
    setResult(null);
    setIsLoading(true);
    setLoadingStep("Analyzing link...");

    const inputInfo = detectInputType(targetInput, selectedMode);

    try {
      let response: Response | null = null;
      let payload: unknown = null;

      // 1. Handle @username / Profile requests
      if (inputInfo.isUsername) {
        const cleanUsername = targetInput
          .replace(/^@/, "")
          .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
          .split("/")[0]
          .split("?")[0]
          .trim();

        setLoadingStep(`Fetching @${cleanUsername} profile...`);
        response = await fetch(
          `/api/profile?username=${encodeURIComponent(cleanUsername)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          response = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: cleanUsername }),
          });
        }

        if (response.ok) {
          payload = await response.json();
        }
      }

      // 2. Handle Twitter / X URLs
      if (!payload && inputInfo.id === "twitter") {
        setLoadingStep("Extracting X / Twitter video...");
        response = await fetch("/api/twitter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetInput }),
        });
        if (response.ok) {
          payload = await response.json();
        }
      }

      // 3. Handle Multi-Platform URLs
      if (
        !payload &&
        ["tiktok", "facebook", "pinterest", "threads", "youtube"].includes(
          inputInfo.id
        )
      ) {
        setLoadingStep(`Extracting ${inputInfo.label} media...`);
        response = await fetch("/api/og-extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetInput }),
        });
        if (response.ok) {
          payload = await response.json();
        }
      }

      // 4. Primary Instagram Extractor (/api/extract)
      if (!payload) {
        setLoadingStep("Extracting HD media from Instagram...");
        response = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: targetInput,
            mode: selectedMode,
          }),
        });

        if (!response.ok) {
          const fallbackRes = await fetch("/api/og-extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: targetInput }),
          });
          if (fallbackRes.ok) {
            payload = await fallbackRes.json();
          } else {
            const errJson: unknown = await response.json().catch(() => ({}));
            const errRec = isRecord(errJson) ? errJson : {};
            throw new Error(
              getStr(errRec.error) ||
                getStr(errRec.message) ||
                "Could not extract media. Make sure the post or profile is public."
            );
          }
        } else {
          payload = await response.json();
        }
      }

      const payloadRec = isRecord(payload) ? payload : {};
      if (!payload || payloadRec.error) {
        throw new Error(
          getStr(payloadRec.error) ||
            getStr(payloadRec.message) ||
            "Unable to fetch media right now. Please check the link and try again."
        );
      }

      const normalized = normalizeApiResponse(payload, targetInput);

      if (
        (!normalized.media || normalized.media.length === 0) &&
        !normalized.author?.avatar &&
        !normalized.url
      ) {
        throw new Error(
          "No downloadable media found for this link. Ensure the account is public."
        );
      }

      setResult(normalized);
      onResult?.(normalized);
      onExtract?.(normalized);

      saveToHistory({
        input: targetInput,
        platform: inputInfo.label,
        title: normalized.title || targetInput,
        thumbnail: normalized.thumbnail,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching media. Please verify the link.";
      setErrorMsg(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleExtract();
  };

  const handleCopyCaption = async () => {
    if (!result?.caption) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(result.caption);
        setCopiedCaption(true);
        setTimeout(() => setCopiedCaption(false), 2000);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className={`gb-wrapper ${isNeon ? "gb-neon" : ""} ${compact ? "gb-compact" : ""} ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: GOLDEN_BAR_STYLES }} />

      {showQuickModes && !compact && !isNeon && (
        <div className="gb-modes" role="tablist" aria-label="Download mode">
          {QUICK_MODES.map((m) => {
            const active = selectedMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setSelectedMode(m.id);
                  setErrorMsg(null);
                }}
                className={`gb-mode-pill ${active ? "gb-mode-active" : ""}`}
              >
                <span aria-hidden="true">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {isNeon ? (
        <div className="gbn-card" data-loading={isLoading ? "true" : "false"}>
          <form onSubmit={handleFormSubmit} className="gbn-form" noValidate>
            {/* A) Input pill: link icon → input → ✕ (sirf text hone par) */}
            <div className="gbn-field">
              <span className="gbn-field__icon" aria-hidden="true">
                <Link2 size={22} strokeWidth={2} />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={activePlaceholder}
                autoFocus={autoFocus}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={isLoading}
                className="gbn-input"
                aria-label="Instagram URL or username"
              />
              {input && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="gbn-clear"
                  aria-label="Clear input"
                  title="Clear"
                >
                  <X size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* B) Paste Link (secondary) + Grab Media (primary, molten) */}
            <div className="gbn-actions">
              <button
                type="button"
                onClick={() => {
                  void handlePasteClipboard();
                }}
                disabled={isLoading}
                className="gbn-btn gbn-btn--paste"
                title="Paste from clipboard"
              >
                <span className="gbn-btn__icon" aria-hidden="true">
                  <ClipboardPaste size={22} strokeWidth={2} />
                </span>
                <span className="gbn-btn__label">Paste Link</span>
                <span className="gbn-btn__tail" aria-hidden="true">
                  <ArrowRight size={20} strokeWidth={2.2} />
                </span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="gbn-btn gbn-btn--grab"
              >
                {isLoading ? (
                  <>
                    <span className="gbn-spinner" aria-hidden="true" />
                    <span className="gbn-btn__label" role="status">{loadingStep}</span>
                  </>
                ) : (
                  <>
                    <span className="gbn-btn__icon" aria-hidden="true">
                      <Download size={22} strokeWidth={2.2} />
                    </span>
                    <span className="gbn-btn__label">{submitLabel}</span>
                    <span className="gbn-btn__tail" aria-hidden="true">
                      <Sparkles size={20} strokeWidth={2} />
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* B2) Trust row — photo jaisa: 3 items, vertical dividers, card ke andar */}
          {showTrustBadges && !compact && (
            <ul className="gbn-trust" aria-label="Why people trust InstaGrab">
              <li className="gbn-trust__item">
                <span className="gbn-trust__icon" aria-hidden="true">
                  <ShieldCheck size={20} strokeWidth={2} />
                </span>
                <span>100% Anonymous &amp; Safe</span>
              </li>
              <li className="gbn-trust__item">
                <span className="gbn-trust__icon" aria-hidden="true">
                  <Sparkles size={20} strokeWidth={2} />
                </span>
                <span>Full HD / 4K Original Quality</span>
              </li>
              <li className="gbn-trust__item">
                <span className="gbn-trust__icon" aria-hidden="true">
                  <Zap size={20} strokeWidth={2} fill="currentColor" />
                </span>
                <span>No Login or Watermark</span>
              </li>
            </ul>
          )}

          {/* C) Sub-card slot (page.tsx se <ToolsAutoSupported /> aata hai) */}
          {footer}
        </div>
      ) : (
      <form onSubmit={handleFormSubmit} className="gb-form" noValidate>
        <div className={`gb-bar-outer ${isLoading ? "gb-bar-loading" : ""}`}>
          <div className="gb-bar-inner">
            <div
              className="gb-platform-chip"
              style={{
                borderColor: `${detected.color}40`,
                backgroundColor: `${detected.color}18`,
                color: detected.color,
              }}
              title={`Detected: ${detected.label}`}
            >
              <span aria-hidden="true">{detected.icon}</span>
              <span className="gb-platform-text">{detected.label}</span>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={activePlaceholder}
              autoFocus={autoFocus}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={isLoading}
              className="gb-input"
              aria-label="Instagram URL or username"
            />

            <div className="gb-actions">
              {input ? (
                <button
                  type="button"
                  onClick={() => {
                    setInput("");
                    setErrorMsg(null);
                    setResult(null);
                    inputRef.current?.focus();
                  }}
                  className="gb-clear-btn"
                  aria-label="Clear input"
                  title="Clear"
                >
                  ✕
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void handlePasteClipboard();
                  }}
                  className="gb-paste-btn"
                  title="Paste from clipboard"
                >
                  <span aria-hidden="true">📋</span>
                  <span>Paste</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="gb-submit-btn"
              >
                {isLoading ? (
                  <span className="gb-spinner-wrap">
                    <span className="gb-spinner" aria-hidden="true" />
                    <span>{loadingStep}</span>
                  </span>
                ) : (
                  <>
                    <span>{submitLabel}</span>
                    <span aria-hidden="true">⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      )}

      {showTrustBadges && !compact && !isNeon && (
        <div className="gb-trust-row">
          <span className="gb-trust-item">🔒 100% Anonymous &amp; Safe</span>
          <span className="gb-trust-sep">•</span>
          <span className="gb-trust-item">✨ Full HD / 4K Original Quality</span>
          <span className="gb-trust-sep">•</span>
          <span className="gb-trust-item">⚡ No Login or Watermark</span>
        </div>
      )}

      {showHistory && recentHistory.length > 0 && !result && !isLoading && (
        <div className="gb-history-bar">
          <div className="gb-history-left">
            <span className="gb-history-label">🕒 Recent:</span>
            <div className="gb-history-chips">
              {recentHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setInput(item.input);
                    void handleExtract(item.input);
                  }}
                  className="gb-history-chip"
                  title={item.input}
                >
                  <span>
                    {item.input.length > 28
                      ? `${item.input.slice(0, 28)}...`
                      : item.input}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="gb-history-right">
            <Link href="/history" className="gb-history-link">
              Full History
            </Link>
            <button
              type="button"
              onClick={clearHistory}
              className="gb-history-clear"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="gb-error-card" role="alert">
          <div className="gb-error-header">
            <span className="gb-error-icon" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <h4 className="gb-error-title">Could not fetch media</h4>
              <p className="gb-error-desc">{errorMsg}</p>
            </div>
          </div>
          <div className="gb-error-tips">
            <span>Tip: Make sure the account is public, or try our</span>
            <Link href="/story-viewer" className="gb-error-link">
              Story Viewer
            </Link>
            <span>or</span>
            <Link href="/profile-viewer" className="gb-error-link">
              Profile Viewer
            </Link>
          </div>
        </div>
      )}

      {result && (
        <div className="gb-result-card">
          {(result.author?.username || result.author?.avatar || result.title) && (
            <div className="gb-result-header">
              <div className="gb-author-box">
                {result.author?.avatar && (
                  <img
                    src={buildDownloadProxyUrl(result.author.avatar, "avatar")}
                    alt={result.author.username || "Creator"}
                    className="gb-author-avatar"
                  />
                )}
                <div>
                  <div className="gb-author-name-row">
                    <span className="gb-author-name">
                      {result.author?.fullName ||
                        (result.author?.username
                          ? `@${result.author.username}`
                          : result.title)}
                    </span>
                    {result.author?.verified && (
                      <span className="gb-verified" title="Verified">
                        ✓
                      </span>
                    )}
                  </div>
                  {result.author?.username && (
                    <span className="gb-author-handle">
                      @{result.author.username}
                    </span>
                  )}
                </div>
              </div>

              {typeof result.author?.followers === "number" && (
                <div className="gb-profile-stats">
                  <div className="gb-stat">
                    <strong>{result.author.followers.toLocaleString()}</strong>
                    <span>Followers</span>
                  </div>
                  {typeof result.author.following === "number" && (
                    <div className="gb-stat">
                      <strong>{result.author.following.toLocaleString()}</strong>
                      <span>Following</span>
                    </div>
                  )}
                  {typeof result.author.postsCount === "number" && (
                    <div className="gb-stat">
                      <strong>{result.author.postsCount.toLocaleString()}</strong>
                      <span>Posts</span>
                    </div>
                  )}
                </div>
              )}

              {result.author?.avatar && (
                <a
                  href={buildDownloadProxyUrl(
                    result.author.avatar,
                    `${result.author.username || "profile"}-dp.jpg`
                  )}
                  download
                  className="gb-dp-btn"
                >
                  ⬇️ Download HD DP
                </a>
              )}
            </div>
          )}

          {result.media && result.media.length > 0 && (
            <div className="gb-media-grid">
              {result.media.map((item, idx) => {
                const ext = item.type === "video" ? "mp4" : "jpg";
                const fname = `${
                  result.author?.username || "instagram"
                }-${idx + 1}.${ext}`;
                const downloadHref = buildDownloadProxyUrl(item.url, fname);

                return (
                  <div key={`${item.url}-${idx}`} className="gb-media-item">
                    <div className="gb-media-preview">
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          poster={item.thumbnail || result.thumbnail}
                          controls
                          playsInline
                          preload="metadata"
                          className="gb-video"
                        />
                      ) : (
                        <img
                          src={buildDownloadProxyUrl(item.url, fname)}
                          alt={`Slide ${idx + 1}`}
                          loading="lazy"
                          className="gb-image"
                        />
                      )}
                      <span className="gb-quality-tag">
                        {item.quality || (item.type === "video" ? "HD MP4" : "HD JPG")}
                      </span>
                    </div>

                    <div className="gb-media-footer">
                      <a
                        href={downloadHref}
                        download={fname}
                        className="gb-download-primary"
                      >
                        <span>
                          ⬇️ Download {item.type === "video" ? "Video (MP4)" : "Photo (HD)"}
                        </span>
                      </a>

                      {item.thumbnail && item.type === "video" && (
                        <a
                          href={buildDownloadProxyUrl(
                            item.thumbnail,
                            `${result.author?.username || "reel"}-thumb.jpg`
                          )}
                          download
                          className="gb-download-secondary"
                        >
                          🖼️ Cover Thumbnail
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {result.caption && (
            <div className="gb-caption-box">
              <div className="gb-caption-top">
                <span className="gb-caption-label">📝 Post Caption &amp; Hashtags</span>
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyCaption();
                  }}
                  className="gb-copy-btn"
                >
                  {copiedCaption ? "✓ Copied!" : "📋 Copy Caption"}
                </button>
              </div>
              <p className="gb-caption-text">{result.caption}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GoldenBar;
