import type { Metadata } from "next";
import PlatformPage from "@/components/PlatformPage";

export const metadata: Metadata = {
  title: "Instagram Downloader — Reels, Stories, Photos, Highlights & DP in HD | InstaGrab",
  description: "One page for every Instagram download: Reels, Stories, Photos, Carousels, Highlights and profile pictures in HD. Link auto-detected, no login, nothing stored.",
  alternates: { canonical: "/instagram-downloader" },
};

export default function Page() {
  return (
    <PlatformPage
      platform="instagram" self="/instagram-downloader"
      h1={<>Instagram downloader — <em className="gilded">everything</em>, one box.</>}
      lead="Paste a Reel, Story, Post, Highlight link or @username — the type is detected automatically and the download starts."
      faq={[
        { q: "What can I download?", a: "Public Reels, Stories, Photos, Carousels, IGTV videos, Highlights and profile pictures — in the original quality Instagram serves." },
        { q: "Do I have to pick Reel or Story first?", a: "No. Auto mode recognises the link type for you. You can still choose a type manually if you prefer." },
        { q: "Does it work for private accounts?", a: "No. Only public content downloads. For accounts you follow, you can optionally add a Session ID in Settings → Advanced." },
        { q: "Is my link stored?", a: "No. Links are processed in memory and never written to a database. Your history lives only in your browser." },
      ]}
    >
      <h2>Every Instagram download in one place</h2>
      <p>Copy the link from Instagram (<strong>Share → Copy link</strong>), paste it above and the page works out whether it is a Reel, Story, Highlight, Photo or Carousel. Single files can start downloading by themselves; carousels show every slide with its own download and a ZIP for all.</p>
      <h2>Caption and hashtags included</h2>
      <p>Alongside the media you get the full caption, every hashtag as a tappable chip, and any mentions — ready to copy for research or credited reposts.</p>
      <h2>Prefer a dedicated page?</h2>
      <p>The Reels, Story, Photo, Carousel, Highlights and Profile Picture downloaders still have their own pages — same engine, preselected type.</p>
    </PlatformPage>
  );
}
