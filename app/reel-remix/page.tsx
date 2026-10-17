import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ReelTranscript from "@/components/ReelTranscript";

export const metadata: Metadata = {
  title: "Reel Remix Studio — Copy a Viral Reel's Formula for Your Niche | InstaGrab",
  description:
    "Paste a viral Instagram reel — get its transcript, why it went viral, and a fully rewritten script for YOUR niche with hooks, caption and hashtags. Hinglish supported. Free.",
  alternates: { canonical: "/reel-remix" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Reel remix studio"
      h1={<>Steal the formula, <em className="gilded">not the reel</em>.</>}
      lead="Paste a viral reel → get its script → we rewrite the whole formula for your niche: hooks, beats, caption, hashtags."
      tool={<ReelTranscript mode="remix" />}
      faq={[
        { q: "What do I get out of a remix?", a: "Five things: an analysis of why the original went viral, a full script rewritten for your niche using the same structure, 3 alternative hooks, a ready caption, and 10 hashtags." },
        { q: "Is remixing copying?", a: "No — formats and structures aren't owned by anyone (that's why trends exist). The remix keeps the formula and replaces every word with your niche's content. Copying the exact words would be stealing; this is studying." },
        { q: "Can I get the remix in Hinglish?", a: "Yes — pick Hinglish or Hindi in step 2 and the entire package comes back in that language." },
        { q: "Which reels work best?", a: "Talking reels — tutorials, storytimes, rants, listicles. Music-only reels have no script to remix." },
      ]}
    >
      <h2>How the best creators actually work</h2>
      <p>Nobody invents formats from scratch. Top creators watch what&apos;s travelling, decode the structure — hook style, beat count, CTA placement — and pour their own niche into it. The Remix Studio automates exactly that: transcript → formula → your version.</p>
      <h2>Two steps, one viral formula</h2>
      <p><strong>Step 1:</strong> paste the viral reel's link; we extract and transcribe its script. <strong>Step 2:</strong> tell us your niche and language; the AI explains why the original worked and rebuilds the entire package for you — script, hooks, caption and hashtags, ready to film.</p>
      <h2>Only on InstaGrab</h2>
      <p>Transcript extraction plus formula remixing in one flow doesn&apos;t exist anywhere else — this is the workflow agencies charge for, free.</p>
    </SimpleToolLanding>
  );
}
