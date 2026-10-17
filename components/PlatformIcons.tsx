"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronRight, Zap } from "lucide-react";

/**
 * Rounded-square brand tiles used by the homepage hero illustration and the
 * "Tools Auto-Supported" strip. Pure inline SVG — no external images.
 *
 * Exports: default PlatformIcon (sirf icon), PlatformTile (48px tap area + label),
 * PlatformStrip (mobile par swipe, desktop par wrap), PlatformStyles, PLATFORM_LABEL.
 */
export type PlatformKey =
  | "instagram"
  | "facebook"
  | "pinterest"
  | "x"
  | "tiktok"
  | "youtube"
  | "reels"
  | "story"
  | "threads"
  | "download"
  | "snapchat"
  | "linkedin"
  | "whatsapp"
  | "telegram"
  | "twitter"
  | "reddit"
  | "tumblr"
  | "vimeo"
  | "twitch"
  | "dailymotion"
  | "bilibili"
  | "weibo"
  | "soundcloud"
  | "spotify"
  | "apple"
  | "imdb"
  | "netflix"
  | "disney"
  | "prime"
  | "kick"
  | "rumble"
  | "odysee"
  | "fbwatch"
  | "crunchyroll"
  | "tubi";

const X_PATH =
  "M18.2 3h3.1l-6.8 7.7L22.5 21h-6.2l-4.9-6.3L5.8 21H2.7l7.3-8.3L2.2 3h6.4l4.4 5.8L18.2 3zm-1.1 16.2h1.7L7.7 4.7H5.9l11.2 14.5z";
const FB_PATH =
  "M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7V13h2.7v8h3.1z";
const TT_PATH =
  "M16.6 3h-3.1v12.2a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.5a5.7 5.7 0 1 0 4.9 5.7V9.1a6.6 6.6 0 0 0 3.8 1.2V7.2A3.9 3.9 0 0 1 16.6 3z";
// Pinterest aur Threads ke logo paths (Simple Icons, CC0), 24x24 box mein; tile mein chhota karke lagaye hain.
const PIN_PATH =
  "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z";
const THREADS_PATH =
  "M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z";

// Naye platforms ke logo paths (Simple Icons style, 24x24 box). Baaki sab chhoti geometry se bane hain.
const TWITTER_PATH =
  "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z";
const TUMBLR_PATH =
  "M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.178l.011.002z";
const VIMEO_PATH =
  "M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z";
const APPLE_PATH =
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";

/** Inner glyph, drawn in a 24x24 box. */
function Glyph({ name }: { name: PlatformKey }) {
  switch (name) {
    case "instagram":
      return (
        <g stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="#fff" />
        </g>
      );
    case "facebook":
      return <path d={FB_PATH} fill="#fff" />;
    case "pinterest":
      // Pehle <text> "P" tha (font par nirbhar). Ab asli logo path: har device par ek jaisa.
      return <path d={PIN_PATH} fill="#fff" transform="translate(4.6 4.6) scale(.62)" />;
    case "x":
      return <path d={X_PATH} fill="#fff" />;
    case "tiktok":
      return (
        <g>
          <path d={TT_PATH} fill="#25F4EE" transform="translate(-0.9 0.5)" />
          <path d={TT_PATH} fill="#FE2C55" transform="translate(0.9 -0.4)" />
          <path d={TT_PATH} fill="#fff" />
        </g>
      );
    case "youtube":
      return (
        <g>
          <rect x="2.5" y="6" width="19" height="12.5" rx="4" fill="#fff" />
          <path d="M10.2 9.4v5.7l5-2.85-5-2.85z" fill="#FF0033" />
        </g>
      );
    case "reels":
      return (
        <g stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <path d="M3.8 8.5h16.4M9 3.6l3 4.9M14.5 3.6l3 4.9" />
          <path d="M10.2 12.6v4.2l3.6-2.1-3.6-2.1z" fill="#fff" />
        </g>
      );
    case "story":
      return (
        <g>
          <circle cx="12" cy="12" r="8.2" stroke="#fff" strokeWidth="1.8" strokeDasharray="3.2 2.6" fill="none" strokeLinecap="round" />
          <path d="M12 7.6l1.25 3.15 3.15 1.25-3.15 1.25L12 16.4l-1.25-3.15L7.6 12l3.15-1.25L12 7.6z" fill="#fff" />
        </g>
      );
    case "threads":
      // Pehle <text> "@" tha (font par nirbhar). Ab asli Threads logo path.
      return <path d={THREADS_PATH} fill="#fff" transform="translate(4.6 4.6) scale(.62)" />;
    case "download":
      return (
        <g stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4.5v10M7.8 10.8 12 15l4.2-4.2" />
          <path d="M5 19.5h14" />
        </g>
      );
    case "snapchat":
      return (
        <path
          d="M12 3.6c-2.9 0-4.6 2.1-4.6 4.9v2.1c-.5.2-1.2.4-1.2 1s.7.8 1.4 1c-.3 1.1-1.6 2.3-3 2.5.1.6 1.2.9 2.4 1.1.1.4.2.8.5 1 .5.2 1.1-.3 1.9-.3.8 0 1.5 1.2 2.6 1.2s1.8-1.2 2.6-1.2c.8 0 1.4.5 1.9.3.3-.2.4-.6.5-1 1.2-.2 2.3-.5 2.4-1.1-1.4-.2-2.7-1.4-3-2.5.7-.2 1.4-.4 1.4-1s-.7-.8-1.2-1V8.5c0-2.8-1.7-4.9-4.6-4.9z"
          fill="#fff"
          stroke="#14141a"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      );
    case "linkedin":
      return (
        <g fill="#fff">
          <circle cx="6.9" cy="6.9" r="1.9" />
          <rect x="5.2" y="9.8" width="3.4" height="9.2" rx=".4" />
          <path d="M10.6 9.8h3.2v1.3c.6-1 1.7-1.6 3.1-1.6 2.5 0 3.9 1.6 3.9 4.3V19h-3.4v-4.6c0-1.2-.5-1.9-1.5-1.9-1.1 0-1.9.8-1.9 2.1V19h-3.4V9.8z" />
        </g>
      );
    case "whatsapp":
      return (
        <g>
          <path d="M12 3.6a8.4 8.4 0 0 0-7.2 12.7L3.6 20.4l4.2-1.1A8.4 8.4 0 1 0 12 3.6z" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinejoin="round" />
          <path d="M9.3 8.3c-.4.3-.7 1-.3 2 .9 2 2.3 3.4 4.3 4.3 1 .4 1.6.1 1.9-.3l.5-.9-1.7-1-.7.7c-1-.4-2-1.4-2.4-2.4l.7-.7-1-1.7z" fill="#fff" />
        </g>
      );
    case "telegram":
      return (
        <path
          d="M4.2 11.5l14.9-5.8c.7-.3 1.3.2 1.1 1.1l-2.5 12c-.2.9-.7 1.1-1.5.7l-4-3-1.9 1.9c-.2.2-.4.4-.8.4l.3-4.2 7.6-6.9c.3-.3-.1-.4-.5-.2l-9.4 5.9-4-1.3c-.9-.3-.9-.9.2-1.3z"
          fill="#fff"
        />
      );
    case "twitter":
      return <path d={TWITTER_PATH} fill="#1DA1F2" transform="translate(4.1 4.1) scale(.66)" />;
    case "reddit":
      return (
        <g>
          <circle cx="12" cy="12" r="9.6" fill="#FF4500" />
          <ellipse cx="12" cy="13.4" rx="6.4" ry="4.4" fill="#fff" />
          <circle cx="5.6" cy="11.4" r="1.6" fill="#fff" />
          <circle cx="18.4" cy="11.4" r="1.6" fill="#fff" />
          <circle cx="9.4" cy="12.8" r="1.15" fill="#FF4500" />
          <circle cx="14.6" cy="12.8" r="1.15" fill="#FF4500" />
          <path d="M9.6 15.6c1.4 1 3.4 1 4.8 0" stroke="#FF4500" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M12 9.1l.9-3.7 3 .7" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16.8" cy="6.4" r="1.2" fill="#fff" />
        </g>
      );
    case "tumblr":
      return <path d={TUMBLR_PATH} fill="#fff" transform="translate(3.6 3.6) scale(.7)" />;
    case "vimeo":
      return <path d={VIMEO_PATH} fill="#1AB7EA" transform="translate(4 4.2) scale(.66)" />;
    case "twitch":
      return (
        <g fill="none" stroke="#9146FF" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
          <path d="M5.2 3.6h14.2v10.6l-4 4H12l-2.6 2.5v-2.5H5.2z" />
          <path d="M11.2 7.8v3.8M15.2 7.8v3.8" />
        </g>
      );
    case "dailymotion":
      return (
        <g fill="none" stroke="#fff" strokeWidth="3.2">
          <circle cx="10.2" cy="14" r="4.4" />
          <path d="M15.4 3.6v14.6" />
        </g>
      );
    case "bilibili":
      return (
        <g fill="none" stroke="#23ADE5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.8" y="7.2" width="16.4" height="11.8" rx="3.6" />
          <path d="M8 3.8l2.6 3.2M16 3.8l-2.6 3.2" />
          <path d="M9.4 11.6v1.2M14.6 11.6v1.2" strokeWidth="2.2" />
          <path d="M10.6 15.3c.9.6 1.9.6 2.8 0" />
        </g>
      );
    case "weibo":
      return (
        <g>
          <ellipse cx="10.4" cy="14.6" rx="7.1" ry="5.3" fill="#E6162D" />
          <ellipse cx="10.2" cy="14.9" rx="4.6" ry="3.3" fill="#fff" />
          <circle cx="9.8" cy="15" r="2" fill="#2a0b10" />
          <circle cx="9.2" cy="14.4" r=".6" fill="#fff" />
          <path d="M15 6.2a5.2 5.2 0 0 1 4.9 4.9" stroke="#FFC400" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d="M15.3 8.8a2.5 2.5 0 0 1 2.2 2.2" stroke="#FFC400" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "soundcloud":
      return (
        <g>
          <path d="M10.2 18.4h8.6a3.2 3.2 0 0 0 .4-6.4 5 5 0 0 0-9-1.3z" fill="#FF6A00" />
          <path d="M3.8 15.6v2M5.9 14v4M8 12.6v5.6" stroke="#FF8A1F" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
    case "spotify":
      return (
        <g>
          <circle cx="12" cy="12" r="9.4" fill="#1ED760" />
          <g fill="none" stroke="#07140b" strokeLinecap="round">
            <path d="M6.8 9.5c3.8-1.1 8.2-.7 11.4 1.2" strokeWidth="1.8" />
            <path d="M7.4 12.6c3.2-.9 6.6-.6 9.4 1" strokeWidth="1.6" />
            <path d="M8.1 15.5c2.6-.6 5.2-.3 7.4.9" strokeWidth="1.4" />
          </g>
        </g>
      );
    case "apple":
      return <path d={APPLE_PATH} fill="#fff" transform="translate(4.2 3.9) scale(.66)" />;
    case "imdb":
      return (
        <g>
          <rect x="1.8" y="6" width="20.4" height="12" rx="2.4" fill="#F5C518" />
          <g fill="#0b0b0b">
            <rect x="3.5" y="9" width="1.3" height="6" />
            <path d="M6.2 15V9h1.6l.9 3.1.9-3.1h1.6v6H9.9v-3.6L9.2 14H8.2l-.7-2.6V15z" />
            <path fillRule="evenodd" d="M12.6 9h1.7c1.7 0 2.6 1 2.6 3s-.9 3-2.6 3h-1.7zm1.3 1.1v3.8h.3c.9 0 1.3-.6 1.3-1.9s-.4-1.9-1.3-1.9z" />
            <path fillRule="evenodd" d="M17.4 8.4h1.2v2.1c.3-.3.7-.5 1.1-.5 1 0 1.6.8 1.6 2.2 0 1.6-.7 2.5-1.8 2.5-.5 0-.8-.2-1.1-.5l-.1.4h-.9zm2 3.7c-.4 0-.8.3-.8 1v.7c0 .5.3.8.7.8.5 0 .8-.5.8-1.3s-.3-1.2-.7-1.2z" />
          </g>
        </g>
      );
    case "netflix":
      return (
        <g>
          <rect x="6.2" y="3.6" width="3.2" height="16.8" fill="#C40812" />
          <rect x="14.6" y="3.6" width="3.2" height="16.8" fill="#C40812" />
          <path d="M6.2 3.6h3.3l8.3 16.8h-3.3z" fill="#E50914" />
        </g>
      );
    case "disney":
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.4 10.2c4.9-4.2 12.3-4.2 17.2 0" stroke="#58A6FF" strokeWidth="1.5" />
          <path d="M5.2 13.2v4.8h1.7c1.7 0 2.6-1 2.6-2.4s-.9-2.4-2.6-2.4zM12 15.4h4.2M14.1 13.3v4.2" stroke="#fff" strokeWidth="1.6" />
        </g>
      );
    case "prime":
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.4 6.4l9.6 5.6-9.6 5.6z" stroke="#00A8E1" strokeWidth="1.8" />
          <path d="M5.4 20c4.3 1.6 9.1 1.3 13.4-.9" stroke="#fff" strokeWidth="1.5" />
          <path d="M17.2 17.1l2 1.8-2.8.9" stroke="#fff" strokeWidth="1.5" />
        </g>
      );
    case "kick":
      return (
        <g fill="#53FC18">
          <rect x="4.8" y="4" width="4.2" height="16" />
          <path d="M10.4 12l5.6-8h4.2l-5.6 8 5.6 8H16z" />
        </g>
      );
    case "rumble":
      return (
        <g>
          <circle cx="12" cy="12" r="9.4" fill="#85C742" />
          <path d="M9.2 7.8l7.6 4.2-7.6 4.2z" fill="#07130a" />
        </g>
      );
    case "odysee":
      return (
        <g>
          <circle cx="12" cy="12" r="9.4" fill="#EF1970" />
          <g stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <path d="M8.2 9.6l3.8 3 3.8-3" />
            <path d="M12 12.6V17" />
          </g>
          <circle cx="12" cy="6.6" r="1.3" fill="#fff" />
        </g>
      );
    case "fbwatch":
      return (
        <g>
          <rect x="3.4" y="5" width="17.2" height="11.6" rx="3" fill="#0B3B8F" stroke="#2D8BFF" strokeWidth="1.6" />
          <path d="M10.2 8.6v4.4l3.8-2.2z" fill="#fff" />
          <path d="M8.6 19.8h6.8" stroke="#2D8BFF" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    case "crunchyroll":
      return (
        <g>
          <circle cx="12" cy="12" r="9.4" fill="#F47521" />
          <circle cx="10.6" cy="12" r="5" fill="#14141c" />
          <circle cx="12.8" cy="12" r="2.7" fill="#F47521" />
        </g>
      );
    case "tubi":
      return (
        <g fill="none" stroke="#7C4DFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.6 6.8v8.9c0 1 .5 1.5 1.4 1.5h.6M2.6 10.2h4" />
          <path d="M8.2 10.2v4.6c0 1.4.8 2.3 2 2.3s2-.9 2-2.3v-4.6" />
          <path d="M13.6 6.4V17" />
          <circle cx="16.4" cy="14.1" r="2.9" />
          <path d="M21.4 10.2V17" />
          <circle cx="21.4" cy="7.4" r=".9" fill="#7C4DFF" stroke="none" />
        </g>
      );
  }
}

const BG: Record<PlatformKey, { a: string; b: string }> = {
  instagram: { a: "#FEDA75", b: "#D62976" },
  facebook: { a: "#2F8BFF", b: "#1459E0" },
  pinterest: { a: "#F0213B", b: "#B80018" },
  x: { a: "#15171C", b: "#000000" },
  tiktok: { a: "#17181D", b: "#050507" },
  youtube: { a: "#FF2A3A", b: "#D90017" },
  reels: { a: "#C13BFF", b: "#6D2BFF" },
  story: { a: "#262B52", b: "#10142E" },
  threads: { a: "#20222B", b: "#08090D" },
  download: { a: "#18B4F2", b: "#2F5BFF" }, // thoda gehra: safed icon ka contrast behtar
  snapchat: { a: "#FFF45A", b: "#FFD600" },
  linkedin: { a: "#3A8DEB", b: "#0A66C2" },
  whatsapp: { a: "#3EE07E", b: "#12A150" },
  telegram: { a: "#3FB8EE", b: "#1A8CC9" },
  twitter: { a: "#13203A", b: "#070C18" },
  reddit: { a: "#1C1A22", b: "#0A0A0F" },
  tumblr: { a: "#1E2A3E", b: "#0B111C" },
  vimeo: { a: "#0F2130", b: "#070F18" },
  twitch: { a: "#1B1630", b: "#0B0818" },
  dailymotion: { a: "#1A2A5A", b: "#091030" },
  bilibili: { a: "#10243A", b: "#07121F" },
  weibo: { a: "#241012", b: "#0D0607" },
  soundcloud: { a: "#2A1608", b: "#0F0803" },
  spotify: { a: "#0F2418", b: "#06100A" },
  apple: { a: "#1B1D23", b: "#07080B" },
  imdb: { a: "#1D1A0C", b: "#0A0904" },
  netflix: { a: "#1C0B0D", b: "#070304" },
  disney: { a: "#0F2A66", b: "#07143A" },
  prime: { a: "#0C2230", b: "#051019" },
  kick: { a: "#0C1C0A", b: "#050A04" },
  rumble: { a: "#10240F", b: "#06100A" },
  odysee: { a: "#2A0B1A", b: "#10040A" },
  fbwatch: { a: "#0C1F45", b: "#06112A" },
  crunchyroll: { a: "#241206", b: "#0D0702" },
  tubi: { a: "#1F1240", b: "#0C0620" },
};

export default function PlatformIcon({
  name,
  size = 44,
  radius,
  label,
  style,
}: {
  name: PlatformKey;
  /** number (px) ya CSS string, jaise "clamp(36px, 9vw, 56px)" */
  size?: number | string;
  radius?: number | string;
  /** Sirf icon dikhe (text nahi) to label do, screen-reader padhega. Na do to decorative. */
  label?: string;
  style?: React.CSSProperties;
}) {
  // Unique id per icon. Pehle fixed id thi: mobile/desktop ke alag versions mein ek ko
  // display:none karne par dusre icon ka gradient gayab ho sakta tha.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = `pi_${name}_${uid}`;
  const c = BG[name];
  const r = radius ?? (typeof size === "number" ? Math.round(size * 0.3) : "30%");
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true, focusable: false } as const);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...a11y}
      style={{ display: "block", flexShrink: 0, borderRadius: r, ...style }}
    >
      <defs>
        <linearGradient id={id} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.b} />
          <stop offset="1" stopColor={c.a} />
        </linearGradient>
        {name === "instagram" && (
          <radialGradient id={id + "_ig"} cx="6" cy="22" r="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFC85B" />
            <stop offset="0.35" stopColor="#F5503A" />
            <stop offset="0.65" stopColor="#C8268B" />
            <stop offset="1" stopColor="#6B3FD4" />
          </radialGradient>
        )}
      </defs>
      <rect width="24" height="24" fill={name === "instagram" ? `url(#${id}_ig)` : `url(#${id})`} />
      <Glyph name={name} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile + desktop: tap area, hover/focus, aur "Tools Auto-Supported" strip */
/* ------------------------------------------------------------------ */

export const PLATFORM_LABEL: Record<PlatformKey, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  pinterest: "Pinterest",
  x: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
  reels: "Reels",
  story: "Story",
  threads: "Threads",
  download: "Download",
  snapchat: "Snapchat",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  twitter: "Twitter",
  reddit: "Reddit",
  tumblr: "Tumblr",
  vimeo: "Vimeo",
  twitch: "Twitch",
  dailymotion: "Dailymotion",
  bilibili: "Bilibili",
  weibo: "Weibo",
  soundcloud: "SoundCloud",
  spotify: "Spotify",
  apple: "Apple",
  imdb: "IMDb",
  netflix: "Netflix",
  disney: "Disney+",
  prime: "Prime Video",
  kick: "Kick",
  rumble: "Rumble",
  odysee: "Odysee",
  fbwatch: "Facebook Watch",
  crunchyroll: "Crunchyroll",
  tubi: "Tubi",
};

const CSS = `
.pf-tile{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  min-width:48px;min-height:48px;padding:2px;margin:0;border:0;background:none;color:inherit;font:inherit;
  text-decoration:none;border-radius:16px;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
  transition:transform .15s ease}
.pf-tile[data-interactive="true"]{cursor:pointer}
.pf-tile__label{font-size:.75rem;line-height:1.2;font-weight:600;opacity:.85;white-space:nowrap}
.pf-tile:focus-visible{outline:3px solid var(--pf-focus,var(--c-cyan,#22E4FF));outline-offset:3px}
.pf-tile[data-interactive="true"]:active{transform:scale(.94)}
@media (hover:hover) and (pointer:fine){
  .pf-tile[data-interactive="true"]:hover{transform:translateY(-3px)}
  .pf-tile[data-interactive="true"]:hover .pf-tile__label{opacity:1}
}
@media (prefers-reduced-motion:reduce){
  .pf-tile{transition:none}
  .pf-tile[data-interactive="true"]:hover,.pf-tile[data-interactive="true"]:active{transform:none}
}
.pf-strip{display:flex;gap:8px;list-style:none;margin:0;padding:8px 28px 8px 16px;overflow-x:auto;
  overscroll-behavior-x:contain;scroll-snap-type:x proximity;scroll-padding:0 16px;scrollbar-width:none;
  -webkit-overflow-scrolling:touch;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 16px,#000 calc(100% - 24px),transparent 100%);
  mask-image:linear-gradient(90deg,transparent 0,#000 16px,#000 calc(100% - 24px),transparent 100%)}
.pf-strip::-webkit-scrollbar{display:none}
.pf-strip>li{flex:0 0 auto;scroll-snap-align:start;display:flex}
.pf-strip .pf-tile{min-width:64px}
@media (min-width:768px){
  .pf-strip{flex-wrap:wrap;justify-content:center;gap:16px 24px;padding:8px 0;overflow:visible;
    -webkit-mask-image:none;mask-image:none}
  .pf-strip .pf-tile{min-width:72px}
}
.pf-strip:focus-visible{outline:2px solid var(--pf-focus,var(--c-cyan,#22E4FF));outline-offset:-2px;border-radius:14px}
@media (forced-colors:active){
  .pf-tile:focus-visible{outline:3px solid Highlight}
  .pf-strip:focus-visible{outline:2px solid Highlight}
}
`;

export function PlatformStyles() {
  return <style>{CSS}</style>;
}

/** Icon + label, kam se kam 48px tap area. href => <a>, onClick => <button>, warna sirf dikhne wala. */
export function PlatformTile({
  name,
  size = 44,
  showLabel = true,
  label,
  href,
  onClick,
  withStyles = true,
  style,
}: {
  name: PlatformKey;
  size?: number | string;
  showLabel?: boolean;
  label?: string;
  href?: string;
  onClick?: () => void;
  withStyles?: boolean;
  style?: React.CSSProperties;
}) {
  const text = label ?? PLATFORM_LABEL[name];
  const interactive = Boolean(href || onClick);
  const inner = (
    <>
      <PlatformIcon name={name} size={size} label={showLabel ? undefined : text} />
      {showLabel && <span className="pf-tile__label">{text}</span>}
    </>
  );
  const common = { className: "pf-tile", "data-interactive": interactive, style } as const;
  return (
    <>
      {withStyles && <PlatformStyles />}
      {href ? (
        <a {...common} href={href} aria-label={showLabel ? undefined : text} title={showLabel ? undefined : text}>{inner}</a>
      ) : onClick ? (
        <button {...common} type="button" onClick={onClick} aria-label={showLabel ? undefined : text} title={showLabel ? undefined : text}>{inner}</button>
      ) : (
        <div {...common}>{inner}</div>
      )}
    </>
  );
}

const DEFAULT_ITEMS: PlatformKey[] = [
  "instagram", "facebook", "pinterest", "x", "tiktok", "youtube", "reels", "story", "threads",
];

/** "Tools Auto-Supported" patti: phone par swipe row, desktop (768px+) par wrap + beech mein. */
export function PlatformStrip({
  items = DEFAULT_ITEMS,
  hrefs,
  onSelect,
  showLabels = true,
  iconSize = 44,
  ariaLabel = "Supported platforms",
  labels,
  listRef,
  onScroll,
  focusable = false,
  style,
}: {
  items?: PlatformKey[];
  hrefs?: Partial<Record<PlatformKey, string>>;
  onSelect?: (name: PlatformKey) => void;
  showLabels?: boolean;
  iconSize?: number | string;
  ariaLabel?: string;
  /** Chhote naam (IG, FB, P...) — na do to PLATFORM_LABEL use hota hai. */
  labels?: Partial<Record<PlatformKey, string>>;
  /** Scroll karne ke liye <ul> ka ref (ToolsAutoSupported ka › button isse chalata hai). */
  listRef?: React.Ref<HTMLUListElement>;
  onScroll?: React.UIEventHandler<HTMLUListElement>;
  /** true => keyboard se row par focus (tiles clickable nahi hon tab bhi scroll ho sake). */
  focusable?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <>
      <PlatformStyles />
      <ul
        ref={listRef}
        className="pf-strip"
        role="list"
        aria-label={ariaLabel}
        tabIndex={focusable ? 0 : undefined}
        onScroll={onScroll}
        style={style}
      >
        {items.map((name) => (
          <li key={name}>
            <PlatformTile
              name={name}
              size={iconSize}
              showLabel={showLabels}
              label={labels?.[name]}
              href={hrefs?.[name]}
              onClick={onSelect ? () => onSelect(name) : undefined}
              withStyles={false}
            />
          </li>
        ))}
      </ul>
    </>
  );
}


/* ------------------------------------------------------------------ */
/* "N Tools Auto-Supported" sub-card (GoldenBar variant="neon" ke neeche) */
/* ------------------------------------------------------------------ */

/** Screenshot jaise chhote naam. Baaki platforms ka naam PLATFORM_LABEL se aata hai. */
export const TOOLS_SHORT_LABEL: Partial<Record<PlatformKey, string>> = {
  instagram: "IG",
  facebook: "FB",
  pinterest: "P",
  youtube: "YT",
};

const TOOLS_ITEMS: PlatformKey[] = [
  "instagram", "facebook", "pinterest", "x", "tiktok", "youtube", "reels", "story", "threads",
];

/**
 * Header (⚡ + count + "View All →") + scrollable tile row + circular "›" button.
 * `count` prop hai (default 33): SupportedTools.tsx ek "use client" module hai, isliye
 * yahan se ALL_SUPPORTED_TOOLS import nahi karte — parent number pass kare.
 * Styles: app/globals.css ke `.gb-neon .gbn-tools*` (GoldenBar neon card ke andar hi dikhta hai).
 */
export function ToolsAutoSupported({
  count = 33,
  items = TOOLS_ITEMS,
  href = "#all-tools",
  style,
}: {
  count?: number;
  items?: PlatformKey[];
  href?: string;
  style?: React.CSSProperties;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  // Scroll position se fade-mask + › button ki state (start / end)
  const measure = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const start = el.scrollLeft <= 2;
    const end = max <= 2 || el.scrollLeft >= max - 2;
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && listRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(listRef.current);
    }
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [measure]);

  const scrollNext = () => {
    const el = listRef.current;
    if (!el) return;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: Math.max(el.clientWidth * 0.8, 160),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const fullNames = items.map((k) => PLATFORM_LABEL[k]).join(", ");

  return (
    <div className="gbn-tools" data-start={edge.start} data-end={edge.end} style={style}>
      <div className="gbn-tools__head">
        <p className="gbn-tools__title">
          <span className="gbn-tools__bolt" aria-hidden="true">
            <Zap size={18} strokeWidth={2} fill="currentColor" />
          </span>
          <span className="gbn-tools__count">{count}</span>
          <span className="gbn-tools__label">Tools Auto-Supported</span>
        </p>
        <a className="gbn-tools__all" href={href}>
          <span>View All</span>
          <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </a>
      </div>

      <div className="gbn-tools__row">
        <PlatformStrip
          items={items}
          iconSize={48}
          labels={TOOLS_SHORT_LABEL}
          listRef={listRef}
          onScroll={measure}
          focusable
          ariaLabel={`Supported platforms: ${fullNames}`}
        />
        <button
          type="button"
          className="gbn-tools__next"
          onClick={scrollNext}
          disabled={edge.end}
          aria-label="Scroll platforms right"
        >
          <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
