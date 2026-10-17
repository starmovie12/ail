import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ReelTranscript from "@/components/ReelTranscript";

export const metadata: Metadata = {
  title: "Instagram Reel Transcript Extractor — Reel to Text, Free | InstaGrab",
  description:
    "Paste any Instagram reel link and get the full spoken script as text — Hindi, English and Hinglish supported, with romanized Hindi included. The only free reel-to-text tool.",
  alternates: { canonical: "/reel-transcript" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Reel transcript extractor"
      h1={<>Any reel, turned into <em className="gilded">text</em>.</>}
      lead="Paste a reel link — we pull the audio and transcribe every spoken word. Hindi, English, Hinglish — all faithful."
      tool={<ReelTranscript mode="transcript" />}
      faq={[
        { q: "How does it work?", a: "We extract the reel's audio track, then an AI model transcribes it. Hindi comes back in Devanagari with a romanized version included; English and mixed Hinglish come back as spoken." },
        { q: "Why would I need a reel transcript?", a: "To study how viral scripts are structured, to caption/subtitle your own reels, to translate content, or to quote a creator accurately. Writers and marketers use transcripts to reverse-engineer hooks." },
        { q: "Does it work on music-only reels?", a: "No — if there's no speech, we tell you honestly instead of inventing words." },
        { q: "Is this really not available anywhere else?", a: "As of our research, no other free Instagram tool converts reels to text directly — most people screen-record and use paid transcription apps. Here it's one paste." },
      ]}
    >
      <h2>The tool the internet didn&apos;t have</h2>
      <p>Downloaders are everywhere. But a reel&apos;s real asset is its <strong>script</strong> — the hook, the pacing, the words that made it travel. InstaGrab extracts that script as clean text in one paste: no screen recording, no third-party transcription subscription.</p>
      <h2>Made for the Hindi internet</h2>
      <p>Global transcription tools mangle Hindi and give up on Hinglish. Ours keeps the original language faithfully — Devanagari for Hindi (with a romanized copy so you can paste it anywhere), English as spoken, and natural mixed Hinglish exactly how creators talk.</p>
      <h2>Study scripts, don&apos;t steal them</h2>
      <p>Use transcripts to learn structure: where the hook lands, how long beats run, how the CTA is phrased. Then write your own — or let our <strong>Reel Remix Studio</strong> rewrite the formula for your niche automatically.</p>
    </SimpleToolLanding>
  );
}
