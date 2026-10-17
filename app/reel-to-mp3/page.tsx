import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ReelToMp3 from "@/components/ReelToMp3";

export const metadata: Metadata = {
  title: "Instagram Reel to MP3 Converter — True MP3, Free | InstaGrab",
  description:
    "Convert any Instagram reel's audio to a true MP3 (192 kbps) free — decoded and re-encoded in your browser, not a renamed M4A. Works in every player and editor.",
  alternates: { canonical: "/reel-to-mp3" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Reel to MP3"
      h1={<>Reel audio, as a <em className="gilded">true MP3</em>.</>}
      lead="Paste a reel — we extract the audio and re-encode it to real 192 kbps MP3 in your browser. Not a renamed M4A."
      tool={<ReelToMp3 />}
      faq={[
        { q: "How is this different from the audio downloader?", a: "The audio downloader gives you Instagram's native M4A instantly — perfect for most uses. This tool goes further: it decodes that audio and re-encodes a genuine MP3, for the players, car stereos and editors that insist on .mp3." },
        { q: "Is the conversion really in my browser?", a: "Yes — WebAudio decodes the track and a WebAssembly-speed encoder produces the MP3 on your device. No file ever touches our servers, which is also why it's free without limits." },
        { q: "What quality do I get?", a: "192 kbps — transparent quality for social audio, in a file small enough to share anywhere." },
        { q: "Can I use trending audio in my own reels?", a: "Inside Instagram, use the official 'Use audio' button — that's what keeps you in the trend. Downloads are for editing workflows, DJ sets and offline listening of audio you have rights to." },
      ]}
    >
      <h2>When M4A isn&apos;t enough</h2>
      <p>Instagram serves audio as M4A, and most modern apps play it fine. But car stereos, older editors, WhatsApp-status makers and sample libraries often want a real <strong>.mp3</strong> — so this tool actually re-encodes, instead of renaming the file and hoping.</p>
      <h2>FastDL&apos;s audio USP, done better</h2>
      <p>Competitors advertise &ldquo;MP3 download&rdquo; and hand you an M4A with a changed extension. Ours is the genuine article: decoded, re-encoded at 192 kbps, with a live progress bar — all client-side, all free.</p>
    </SimpleToolLanding>
  );
}
