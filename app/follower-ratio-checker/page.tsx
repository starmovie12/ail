import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import RatioChecker from "@/components/RatioChecker";

export const metadata: Metadata = {
  title: "Follower Ratio Checker — Is Your Instagram Ratio Healthy? | InstaGrab",
  description:
    "Check your Instagram follower-to-following ratio and likes-to-followers ratio against healthy benchmarks — with an honest verdict on what your ratio signals. Free.",
  alternates: { canonical: "/follower-ratio-checker" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Follower ratio checker"
      h1={<>What does your <em className="gilded">ratio</em> say about you?</>}
      lead="Followers ÷ following, judged honestly — plus your likes-to-followers rate against real benchmarks."
      tool={<RatioChecker />}
      faq={[
        { q: "What's a good follower-to-following ratio?", a: "Above 1× is balanced, 2×+ reads as a healthy creator, 10×+ is authority territory. Below 0.5× (following double your followers) often signals follow-for-follow growth." },
        { q: "Does the ratio actually matter?", a: "Visitors judge it in the first second on your profile — it's a credibility shortcut. Brands screening creators check it too, right after engagement rate." },
        { q: "What's a healthy likes-to-followers rate?", a: "2–5% for most accounts. Below 2% suggests inactive or low-quality followers are diluting your audience — our fake follower checker can dig deeper." },
        { q: "How do I improve a bad ratio?", a: "Slowly unfollow inactive accounts (mass-unfollowing triggers action blocks), and let content-led growth raise the numerator. No shortcuts worth the risk." },
      ]}
    >
      <h2>The 1-second credibility check</h2>
      <p>Before anyone reads your bio, their eyes hit two numbers — followers and following. The gap between them is an instant story: authority, balance, or follow-for-follow hustle. This checker tells you which story yours is telling.</p>
      <h2>Two ratios, one picture</h2>
      <p>The <strong>follower/following ratio</strong> is what visitors judge; the <strong>likes-to-followers rate</strong> is what the algorithm judges. A big audience that doesn&apos;t like your posts is dead weight — checking both catches problems either one alone would miss.</p>
      <h2>Fix it the safe way</h2>
      <p>Ratios improve from both ends: gradual unfollows of inactive accounts, and content that earns follows. Avoid mass-unfollow apps — they violate Instagram&apos;s terms and earn action blocks that hurt far more than a mediocre ratio.</p>
    </SimpleToolLanding>
  );
}
