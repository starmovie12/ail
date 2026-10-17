import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import BatchDownloader from "@/components/BatchDownloader";

export const metadata: Metadata = {
  title: "Instagram Batch Downloader — Paste Many Links at Once | InstaGrab",
  description:
    "Paste up to 20 Instagram reel/post links and download them all in one go. Free, no login, no watermark — built for creators and social media managers.",
  alternates: { canonical: "/batch-downloader" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Batch downloader"
      h1={<>Many links, <em className="gilded">one go</em>.</>}
      lead="Paste up to 20 reel or post links and fetch them all together — each with its own download."
      tool={<BatchDownloader />}
      wide
      faq={[
        { q: "How many links can I paste?", a: "Up to 20 at once. Paste them any way you like — the tool finds every Instagram link in the text." },
        { q: "Do they download automatically?", a: "Each link is fetched in turn and gets its own download button as soon as it's ready, so you can grab them one tap at a time." },
        { q: "What link types work?", a: "Reels, posts, videos (IGTV) and carousels. Private posts and expired stories can't be fetched." },
        { q: "Is it free?", a: "Yes — free, no login, no watermark. A gentle rate limit keeps it fast for everyone." },
      ]}
    >
      <h2>Save a whole batch at once</h2>
      <p>Downloading reels one link at a time is slow when you&apos;re researching a niche or archiving a series. Paste all your links together and InstaGrab works through them, handing you a <strong>download button per link</strong> as each one resolves.</p>
      <h2>Built for creators and managers</h2>
      <p>Content repurposers and social media managers often need ten or twenty posts at once — a competitor&apos;s recent reels, a hashtag&apos;s top posts, or a back-catalogue to study. The batch tool turns that from twenty trips into one.</p>
      <h2>Same quality, nothing stored</h2>
      <p>Every file comes straight from Instagram&apos;s CDN at full quality, with no watermark. Links are processed in memory and never saved.</p>
    </SimpleToolLanding>
  );
}
