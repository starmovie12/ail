import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import FakeFollowerChecker from "@/components/FakeFollowerChecker";

export const metadata: Metadata = {
  title: "Fake Follower Checker for Instagram — Free Audience Audit | InstaGrab",
  description:
    "Check any Instagram account for fake or bought followers, free. Enter a @username and get an audience quality grade (A+ to F) from public engagement signals. No login.",
  alternates: { canonical: "/fake-follower-checker" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Fake follower checker"
      h1={<>Are those followers <em className="gilded">real</em>?</>}
      lead="Enter any public @username — we grade the audience A+ to F using engagement signals bots can't fake."
      tool={<FakeFollowerChecker />}
      faq={[
        { q: "How do you detect fake followers?", a: "From public signals: engagement rate vs account size, comments-to-likes ratio, following/follower balance, content volume and like-count consistency. Bought audiences leave a very recognisable footprint across these." },
        { q: "Can you tell me the exact percentage of fakes?", a: "No tool can without Instagram's internal data — anyone promising an exact percentage is guessing. We grade audience quality honestly instead, which is what brands actually care about." },
        { q: "Why should I check before a collab?", a: "If you pay a creator with 40% bot followers, your campaign reaches 60% of what you bought. A 30-second check protects your budget." },
        { q: "Does the account owner know I checked?", a: "No — the check reads only public data and leaves no trace." },
      ]}
    >
      <h2>Why fake followers matter</h2>
      <p>Bought followers don&apos;t buy products, don&apos;t comment, and don&apos;t share. For brands, they quietly burn campaign budgets; for creators, they wreck your engagement rate and suppress your reach — Instagram shows your content to fewer real people when the fake ones never react.</p>
      <h2>The tells we look for</h2>
      <p>Purchased audiences leave patterns: a large following with an engagement rate far below the floor for that size, thousands of likes with almost no comments, follow-for-follow ratios, huge audiences on nearly-empty profiles, and like counts that spike and crash between posts. Our checker scores all of these from public data and grades the account <strong>A+ to F</strong>.</p>
      <h2>Before you collab, check</h2>
      <p>Agencies routinely audit creators before signing deals — now you can run the same sanity check free. Pair it with our engagement calculator and profile audit for the full picture.</p>
    </SimpleToolLanding>
  );
}
