import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import OgDownloader from "@/components/OgDownloader";

export const metadata: Metadata = {
  title: "TikTok Downloader — Save TikTok Videos Free | InstaGrab",
  description:
    "Download TikTok videos free: paste a tiktok.com or vm.tiktok.com link and save the video. Works with the share links from the app. No login.",
  alternates: { canonical: "/tiktok-downloader" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="TikTok downloader"
      h1={<>Save the TikTok before it&apos;s <em className="gilded">gone</em>.</>}
      lead="Paste any TikTok link — full URLs and the app's short vm.tiktok.com share links both work."
      tool={<OgDownloader platform="TikTok" hostHint={"tiktok\\.com/"} placeholder="Paste a TikTok link (tiktok.com or vm.tiktok.com)" />}
      faq={[
        { q: "Which links work?", a: "Full video URLs (tiktok.com/@user/video/…) and the short vm.tiktok.com / vt.tiktok.com share links from the app — short links redirect automatically." },
        { q: "Sometimes it fails — why?", a: "TikTok rotates its defenses aggressively and some videos are region-locked or served behind checks our server can't pass. When extraction fails, wait a minute and retry — it's honest best-effort, not magic." },
        { q: "Is TikTok not banned in India?", a: "The app is — but TikTok links still circulate globally and in DMs, and this site serves a global audience. Downloading remains useful for research and archiving where the platform is available." },
        { q: "Watermark?", a: "You get the file TikTok's page exposes publicly. Depending on the video that may or may not carry the watermark overlay." },
      ]}
    >
      <h2>Best-effort, honestly labelled</h2>
      <p>TikTok fights downloaders harder than any other platform, so we don&apos;t promise miracles: this tool reads what the public page exposes — OG tags plus the page&apos;s own hydration data — and succeeds on most public videos. When TikTok blocks a fetch, we say so instead of showing a fake spinner.</p>
      <h2>Same bar, another platform</h2>
      <p>One paste box, same clean result card, no popup labyrinth — the InstaGrab flow you already know, pointed at TikTok. For trend research across platforms, pair it with the reel transcript extractor on the Instagram side.</p>
    </SimpleToolLanding>
  );
}
