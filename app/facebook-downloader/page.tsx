import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import OgDownloader from "@/components/OgDownloader";

export const metadata: Metadata = {
  title: "Facebook Video Downloader — Videos & Reels, Free | InstaGrab",
  description:
    "Download public Facebook videos and reels free: paste a facebook.com or fb.watch link and save the video. Best-effort, honest errors, no login.",
  alternates: { canonical: "/facebook-downloader" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Facebook downloader"
      h1={<>Facebook videos, <em className="gilded">saved</em>.</>}
      lead="Paste a public Facebook video, reel or fb.watch link — we pull what the page publicly exposes."
      tool={<OgDownloader platform="Facebook" hostHint={"(facebook\\.com|fb\\.watch)/"} placeholder="Paste a Facebook video link (facebook.com or fb.watch)" />}
      faq={[
        { q: "Which links work?", a: "Public video and reel URLs (facebook.com/watch, /reel/, /videos/) and fb.watch short links. Content from private profiles and groups can't be accessed — by design." },
        { q: "Why does it sometimes fail?", a: "Facebook increasingly hides video URLs behind login walls, so extraction is best-effort: public pages and widely-shared videos work most reliably. When it fails, you get an honest error, not a fake button." },
        { q: "What quality?", a: "The rendition Facebook exposes publicly — typically SD or HD depending on the video." },
      ]}
    >
      <h2>The honest Facebook downloader</h2>
      <p>Most &ldquo;Facebook downloader&rdquo; sites promise everything and deliver popups. Reality: Facebook aggressively gates video behind login, so no free tool works on all content. Ours reads what the page publicly exposes, succeeds on public pages and viral videos, and tells you plainly when Facebook blocked the view.</p>
      <h2>Meta family, one toolkit</h2>
      <p>Instagram, Threads and Facebook — the whole Meta family lives on the same paste-bar flow here. If a video exists on both Facebook and Instagram (crossposts often do), the Instagram link is the more reliable route.</p>
    </SimpleToolLanding>
  );
}
