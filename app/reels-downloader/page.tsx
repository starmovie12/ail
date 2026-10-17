import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";

export const metadata: Metadata = {
  title: "Instagram Reels Downloader — HD MP4, Free, No Login | InstaGrab",
  description: "Download any public Instagram reel in HD MP4 with its caption and hashtags. Free, no watermark, no login required.",
  alternates: {
    canonical: "/reels-downloader",
  },
};

export default function Page() {
  return (
    <ToolLanding
      eyebrow="Reels downloader"
      h1={<>Instagram Reels downloader — every reel, <em className="gilded">flawlessly</em>.</>}
      lead="HD MP4, the full caption, and every hashtag — from any public reel."
    >
      <h2>How to download an Instagram reel</h2>
      <p>Open the reel in Instagram, tap <strong>Share → Copy link</strong>, paste it in the bar above and press Download. You&apos;ll get every available quality listed — usually 1080p and 720p MP4 — plus the thumbnail as a JPG.</p>
      <h2>What makes this different</h2>
      <p>Most reel downloaders hand you a file and nothing else. InstaGrab fetches the <strong>whole post</strong>: the video, the complete caption ready to copy, every hashtag as a tappable chip, and any @mentions. If you save reels for reference or repost with credit, that text matters as much as the video.</p>
      <h2>Quality and watermarks</h2>
      <p>Files come straight from Instagram&apos;s own CDN, so quality is exactly what was uploaded — no re-compression, no watermark added by us. Audio is included in the MP4.</p>
    </ToolLanding>
  );
}
