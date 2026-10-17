import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import FollowerTracker from "@/components/FollowerTracker";

export const metadata: Metadata = {
  title: "Instagram Follower Tracker — Daily Growth Chart, Free | InstaGrab",
  description:
    "Track any Instagram account's follower growth daily with a beautiful chart, growth delta and milestone countdown. Private (stored only in your browser), free, no login.",
  alternates: { canonical: "/follower-tracker" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Follower growth tracker"
      h1={<>Watch your growth, <em className="gilded">day by day</em>.</>}
      lead="Log today's count in one tap — build a growth chart, see your delta, count down to the next milestone. All stored privately in your browser."
      tool={<FollowerTracker />}
      faq={[
        { q: "Where is my data stored?", a: "Only in your browser's localStorage — nothing touches our servers. That's also why the same chart won't appear on a different device." },
        { q: "How often should I log?", a: "Once a day. One tap fetches the live count from the public profile (or type it manually). From day 2 you get a chart; from week 2 you get a story." },
        { q: "Can I track competitors?", a: "Yes — track any public account. Their growth curve tells you when something they did worked; go see what they posted that day." },
        { q: "Why not just use Instagram Insights?", a: "Insights only covers your own account, resets ranges and buries daily deltas. This tracker does one thing clearly — and tracks accounts that aren't yours." },
      ]}
    >
      <h2>What gets measured, grows</h2>
      <p>A follower count glanced at daily is noise; a chart over weeks is signal. Logging takes one tap, and the curve tells you what actually moved the needle — the reel that spiked you, the quiet week that flatlined you.</p>
      <h2>Milestones keep you posting</h2>
      <p>The tracker always shows the distance to your next milestone — 1K, 5K, 10K and beyond. Small visible progress is the strongest motivator a creator has on the hard days.</p>
      <h2>Spy mode: track anyone</h2>
      <p>Add competitors and accounts you admire. When their curve jumps, check what they posted that day — that&apos;s free strategy research no analytics subscription gives you.</p>
    </SimpleToolLanding>
  );
}
