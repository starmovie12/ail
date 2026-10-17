import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import OgDownloader from "@/components/OgDownloader";

export const metadata: Metadata = {
  title: "Threads Downloader — Save Threads Videos & Photos Free | InstaGrab",
  description:
    "Download videos and photos from Threads posts free: paste a threads.net link and save the media in original quality. No login, no watermark.",
  alternates: { canonical: "/threads-downloader" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Threads downloader"
      h1={<>Threads media, <em className="gilded">saved</em>.</>}
      lead="Paste any public Threads post link — we pull the video or photo in original quality."
      tool={<OgDownloader platform="Threads" hostHint={"threads\\.(net|com)/"} placeholder="Paste a Threads post link (threads.net/…)" />}
      faq={[
        { q: "Which posts work?", a: "Public Threads posts with a photo or video. Text-only threads have nothing to download, and private profiles stay private." },
        { q: "Why a Threads downloader?", a: "Threads is Meta's fastest-growing platform and has no save button at all. Same InstaGrab engine, new platform — most downloader sites haven't caught up yet." },
        { q: "What about carousels?", a: "The post's primary media downloads. Multi-photo support depends on what Threads exposes publicly — it's improving as the platform does." },
      ]}
    >
      <h2>The platform without a save button</h2>
      <p>Threads launched without downloads and still barely has them. When a thread has the clip or image you need, paste the link here — same one-box flow as our Instagram tools, because it&apos;s the same family of platforms underneath.</p>
      <h2>Early platform, early advantage</h2>
      <p>Threads content is fresh territory: fewer reposts, faster trends, and barely any tooling. Creators mining Threads for content ideas get there before the Instagram crowd does.</p>
    </SimpleToolLanding>
  );
}
