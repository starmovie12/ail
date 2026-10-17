import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import TwitterDownloader from "@/components/TwitterDownloader";

export const metadata: Metadata = {
  title: "Twitter / X Video Downloader — HD MP4, Free | InstaGrab",
  description:
    "Download Twitter (X) videos, GIFs and photos free: paste a tweet link, get the highest-bitrate MP4 and original-resolution images — plus the tweet text. No login.",
  alternates: { canonical: "/twitter-downloader" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Twitter / X downloader"
      h1={<>Tweets you can actually <em className="gilded">keep</em>.</>}
      lead="Paste any tweet link — videos at the highest bitrate, GIFs as MP4, photos at original resolution, text included."
      tool={<TwitterDownloader />}
      faq={[
        { q: "Which links work?", a: "Any public tweet URL from twitter.com or x.com (…/status/…). Videos, GIFs and multi-photo tweets all work; text-only tweets have nothing to download." },
        { q: "What quality do I get?", a: "Videos: the highest-bitrate MP4 Twitter serves (the same file the player streams). Photos: the ?name=orig original — larger than what the timeline shows." },
        { q: "Do Twitter GIFs download as GIF files?", a: "Twitter stores 'GIFs' as looping MP4s — that's what you get, which is smaller and higher quality. Convert with our video-to-GIF tool if you need a real .gif." },
        { q: "Does this need my Twitter login?", a: "No — it uses the public embed endpoint. Private/protected accounts stay private." },
      ]}
    >
      <h2>The bird app, unlocked</h2>
      <p>X has no download button for videos and serves compressed previews of photos. This tool pulls the tweet through the public embed system — the same data that powers embedded tweets on news sites — and hands you the best files it has.</p>
      <h2>Text included, obviously</h2>
      <p>Like our Instagram tools, the download comes with the words: the full tweet text with a copy button, because the joke/take/thread-starter is usually the part you wanted to keep.</p>
    </SimpleToolLanding>
  );
}
