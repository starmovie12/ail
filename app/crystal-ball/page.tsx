import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import CrystalBall from "@/components/CrystalBall";

export const metadata: Metadata = {
  title: "Crystal Ball — Predict a Post's Virality BEFORE You Post (AI) | InstaGrab",
  description:
    "Upload your photo or reel frame before posting — AI gives a virality score, hook check, visual critique and a Post-it/Fix-it verdict. The pre-post checklist. Free.",
  alternates: { canonical: "/crystal-ball" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Crystal ball · AI"
      h1={<>Test virality <em className="gilded">before</em> you post.</>}
      lead="Upload what you're about to post — the AI predicts its virality, checks the hook, critiques the visual and gives a post-it-or-fix-it verdict."
      tool={<CrystalBall />}
      faq={[
        { q: "How is this different from a virality score?", a: "Every other tool analyses posts AFTER they're up. This is a PRE-post review — it tells you what to fix while you still can. It's a pre-flight checklist for creators." },
        { q: "What does the report include?", a: "A virality score out of 100, a hook check (is it readable in 2 seconds?), a visual critique (composition, colour, scroll-stopping power), a caption tip, a best-time suggestion, and a clear verdict with the single most important fix." },
        { q: "Is my image stored?", a: "No — it's resized on your device, analysed once, and never saved." },
        { q: "Does it work on reels?", a: "Upload a key frame (use our frame grabber) plus your planned caption — the AI reviews the visual hook that decides the first 2 seconds." },
      ]}
    >
      <h2>The pre-flight checklist creators never had</h2>
      <p>Pilots don&apos;t take off without a checklist; creators post on a hunch. The Crystal Ball is that checklist — a 10-second AI review that catches the weak hook, the busy composition, the buried subject, before your reach depends on it.</p>
      <h2>Habit-forming by design</h2>
      <p>Run it before every post and it becomes a ritual: upload, read the verdict, fix the one thing, publish with confidence. Weekly posters become weekly visitors.</p>
    </SimpleToolLanding>
  );
}
