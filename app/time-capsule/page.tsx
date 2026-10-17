import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import TimeCapsule from "@/components/TimeCapsule";

export const metadata: Metadata = {
  title: "Instagram Time Capsule — Seal Your Stats, Open in 30 Days | InstaGrab",
  description:
    "Snapshot your Instagram stats today, lock them for 30 days, then open the capsule to see exactly how much you grew. A growth ritual you'll come back for. Free.",
  alternates: { canonical: "/time-capsule" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Time Capsule"
      h1={<>Seal your stats. <em className="gilded">Open in 30 days.</em></>}
      lead="Bury a snapshot of your Instagram numbers today. In 30 days the capsule unlocks and shows exactly how far you've grown."
      tool={<TimeCapsule />}
      faq={[
        { q: "How does it work?", a: "Enter your @username and we snapshot your current followers, posts and average likes, then lock it. Thirty days later you open the capsule and see the before-and-after growth." },
        { q: "Why 30 days?", a: "It's long enough to show real growth and gives you a reason to come back exactly a month later — a built-in check-in on your progress." },
        { q: "Where is my capsule stored?", a: "Only in this browser, on this device. Nothing is uploaded — clear your browser data and the capsule is gone." },
        { q: "Can I bury more than one?", a: "Yes — track several accounts at once, each with its own unlock date and countdown." },
      ]}
    >
      <h2>A reason to come back — built in</h2>
      <p>Most analytics tools show you a number and you leave. The Time Capsule does the opposite: it gives you something to look forward to. Seal your stats, forget about them, and a month later get a satisfying reveal of how much you&apos;ve grown.</p>
      <h2>Growth you can actually feel</h2>
      <p>Day-to-day, follower growth is invisible. Compressed into a 30-day before-and-after, it&apos;s motivating — the kind of progress that keeps creators posting.</p>
    </SimpleToolLanding>
  );
}
