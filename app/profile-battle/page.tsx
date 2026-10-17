import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ProfileBattle from "@/components/ProfileBattle";

export const metadata: Metadata = {
  title: "Instagram Profile Battle — Compare Two Accounts (VS Mode) | InstaGrab",
  description:
    "Put two Instagram profiles head-to-head: followers, engagement, likes, ratios — with a battle score and a winner. Free VS comparison tool, no login.",
  alternates: { canonical: "/profile-battle" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Profile battle · VS mode"
      h1={<>Two profiles. <em className="gilded">One winner.</em> ⚔️</>}
      lead="Enter two usernames — we compare followers, engagement, likes and ratios, score both, and crown a champion."
      tool={<ProfileBattle />}
      faq={[
        { q: "How is the winner decided?", a: "A composite battle score: engagement rate carries the most weight, then audience size, follower/following balance and recent activity. A smaller account with a hot audience can absolutely beat a big sleepy one." },
        { q: "Why does engagement count more than followers?", a: "Because that's how brands and the algorithm think — 10K followers who actually respond beat 100K who scroll past. The battle rewards accounts that would win in real life." },
        { q: "Can I battle myself against a competitor?", a: "That's the smartest use: run yourself vs an account you admire, see exactly which metric you lose on, and work that one." },
        { q: "Is this visible to the profiles?", a: "No — public data only, nothing stored, nobody notified." },
      ]}
    >
      <h2>Settle it with numbers</h2>
      <p>Every friend group has the argument: whose Instagram is actually better? VS mode answers it with public data — six metrics side by side, each round marked, and a final battle score built the way brands actually evaluate accounts.</p>
      <h2>More than a game: competitor analysis</h2>
      <p>Swap &ldquo;friend&rdquo; for &ldquo;competitor&rdquo; and this becomes a free benchmarking tool. See whether the account outranking you wins on engagement or just size, where your ratios diverge, and which single metric would flip the fight.</p>
      <h2>Fair fights, honest scores</h2>
      <p>The score is computed from each profile&apos;s recent public posts — the same inputs for both sides, no follower-count worship. Rematch anytime; scores update as the accounts do.</p>
    </SimpleToolLanding>
  );
}
