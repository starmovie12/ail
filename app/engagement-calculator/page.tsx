import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ProfileStatsTool from "@/components/ProfileStatsTool";

export const metadata: Metadata = {
  title: "Instagram Engagement Rate Calculator — Free, No Login | InstaGrab",
  description:
    "Calculate any public Instagram account's engagement rate — likes + comments ÷ followers — from its recent posts. Free, instant, no login. Great for sponsorships.",
  alternates: { canonical: "/engagement-calculator" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Engagement calculator"
      h1={<>Your real <em className="gilded">engagement rate</em>.</>}
      lead="Enter any public username to get its engagement rate from recent posts — plus likes, comments and ratios."
      tool={<ProfileStatsTool mode="engagement" />}
      faq={[
        { q: "How is engagement rate calculated?", a: "Average (likes + comments) on the recent posts, divided by follower count, as a percentage. It's the standard metric brands look at." },
        { q: "What's a good engagement rate?", a: "It depends on size — smaller accounts run higher. Roughly: 3%+ is excellent for under 10k followers, while 1–2% is healthy for larger accounts." },
        { q: "Does it need login or the account's password?", a: "Never. It only reads public numbers already shown on the profile — no login, nothing stored." },
      ]}
    >
      <h2>Why engagement rate matters</h2>
      <p>Follower count is vanity; <strong>engagement rate</strong> is what brands actually pay for. It shows how many of an account&apos;s followers really interact — the single number that decides sponsorship value. Whether you&apos;re pitching yourself or vetting an influencer, this is the figure to check.</p>
      <h2>How this calculator works</h2>
      <p>Enter a public @username. InstaGrab reads the likes and comments on the account&apos;s recent posts and its follower count — all <strong>public information</strong> — and computes the rate, plus average likes, average comments, and follower-to-following and likes-to-followers ratios.</p>
      <h2>Public numbers only</h2>
      <p>This tool never logs in and never touches follower lists or private data — it only uses the counts already visible on the public profile. Results are estimates; real engagement shifts with niche and content type.</p>
    </SimpleToolLanding>
  );
}
