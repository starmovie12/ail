import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";

export const metadata: Metadata = {
  title: "Instagram Video Downloader — Save Videos & IGTV in HD | InstaGrab",
  description:
    "Download any Instagram video, reel or IGTV in HD MP4 for free. Fast, anonymous, no watermark, no login — plus the caption and every hashtag.",
  alternates: { canonical: "/video-downloader" },
};

export default function Page() {
  return (
    <ToolLanding
      eyebrow="Video downloader"
      h1={<>Instagram video downloader — any video, <em className="gilded">in HD</em>.</>}
      lead="Reels, IGTV and video posts in HD MP4 — with the full caption and hashtags."
      faq={[
        { q: "Does it work with IGTV and long videos?", a: "Yes — IGTV, reels and standard video posts all work through the same bar." },
        { q: "Are there any download limits?", a: "No hard limit for normal use. A gentle rate limit keeps the tool fast and abuse-free." },
        { q: "Which devices are supported?", a: "Any device with a browser — iPhone, Android, tablet or computer. No app, no account." },
        { q: "Is it anonymous?", a: "Completely. You never log in, and we don't store your links." },
      ]}
    >
      <h2>How to download an Instagram video</h2>
      <p>Open the video in Instagram, tap <strong>••• → Copy link</strong> (or Share → Copy link), paste it in the bar above and press Download. Every available quality is listed — usually 1080p and 720p MP4 — plus the thumbnail as a JPG.</p>
      <h2>Reels, IGTV and video posts — one bar</h2>
      <p>You don&apos;t need a different tool for each format. InstaGrab detects what the link points to and fetches the right media, together with the complete caption, every hashtag as a tappable chip, and any @mentions.</p>
      <h2>Quality and watermarks</h2>
      <p>Files come straight from Instagram&apos;s own CDN, so quality is exactly what was uploaded — no re-compression, no watermark added by us. Audio is included in the MP4.</p>
    </ToolLanding>
  );
}
