import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import GoldenBar from "@/components/GoldenBar";

export const metadata: Metadata = {
  title: "FastDL Alternative — InstaGrab (HD + Captions + AI Tools) | InstaGrab",
  description:
    "Looking for a FastDL / iGram alternative? InstaGrab downloads Instagram media in HD with captions and hashtags included — plus true MP3, transcripts and 80+ free tools.",
  alternates: { canonical: "/fastdl-alternative" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="FastDL / iGram alternative"
      h1={<>FastDL&apos;s downloads, plus the <em className="gilded">creator toolkit</em>.</>}
      lead="HD media with metadata, true MP3 audio (not renamed M4A), reel transcripts and 80+ tools — one paste bar. Try it:"
      tool={<GoldenBar />}
      faq={[
        { q: "Does InstaGrab show post metadata like FastDL?", a: "Yes — likes, comments, views and post date appear right on the result card when available, along with the full caption and hashtags FastDL doesn't give you." },
        { q: "FastDL advertises MP3 audio — what about InstaGrab?", a: "We do it more honestly and better: instant native M4A on the audio downloader, plus a true MP3 converter that actually re-encodes at 192 kbps in your browser — not a renamed file." },
        { q: "What's genuinely unique here?", a: "Reel transcript extraction (reel → spoken text), Reel Remix Studio, Hinglish AI generators, Creator Pack ZIP and a profile battle mode — features no downloader site has." },
        { q: "Is it free?", a: "Everything — no premium tier, no login, no daily caps beyond fair-use rate limits." },
      ]}
    >
      <h2>Feature for feature, then far past it</h2>
      <p>Multiple qualities, profile media, metadata on the result card, audio downloads — the FastDL/iGram checklist is fully covered. Then InstaGrab keeps going: caption and hashtag extraction on every download, one-click Creator Pack ZIP, and the AI suite FastDL will never build.</p>
      <h2>Made for the Indian creator</h2>
      <p>FastDL speaks 25 languages but thinks in English. InstaGrab&apos;s AI writes captions, bios and reel scripts in natural <strong>Hinglish</strong>, the money calculator has real Indian brand rates, and the best-time tool defaults to IST. Tools that fit how you actually work.</p>
      <h2>One paste, whole workflow</h2>
      <p>Download → transcript → remix → caption → schedule → giveaway: the entire creator loop lives on one site with one design and zero logins. Paste a link above and start.</p>
    </SimpleToolLanding>
  );
}
