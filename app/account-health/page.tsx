import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import AccountHealth from "@/components/AccountHealth";

export const metadata: Metadata = {
  title: "Instagram Account Health Score — Free A+ to F Report Card | InstaGrab",
  description:
    "Get a complete Instagram health report card free: engagement, consistency, audience quality and profile craft scored out of 100 with an A+ to F grade. Shareable.",
  alternates: { canonical: "/account-health" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Account health score"
      h1={<>Your Instagram&apos;s full <em className="gilded">report card</em>.</>}
      lead="Four pillars — engagement, consistency, audience quality, profile craft — scored /100 with a grade you can share."
      tool={<AccountHealth />}
      faq={[
        { q: "What are the four pillars?", a: "Engagement (rate vs benchmark for your size), Consistency (posting cadence), Audience quality (ratios and organic-growth signals) and Profile craft (bio, caption depth, hashtag usage). 25 points each." },
        { q: "How is this different from the profile audit?", a: "The audit gives you a detailed findings list; the health score compresses everything into one gamified grade — perfect for tracking month-over-month or comparing with friends." },
        { q: "My grade is a C. Now what?", a: "Look at your weakest pillar — that's your growth lever. Low engagement → hooks and reply speed; low consistency → a posting schedule; low audience quality → run the fake follower checker; low craft → bio and captions." },
        { q: "Can I check anyone?", a: "Any public account — friends, competitors, brands. Grades are computed from public data only." },
      ]}
    >
      <h2>One number that means something</h2>
      <p>Followers alone say almost nothing about account health. The report card weighs the four things that actually predict growth — and shows exactly which pillar is dragging your grade, so &ldquo;do better&rdquo; becomes &ldquo;fix this one thing&rdquo;.</p>
      <h2>Track it like a metric</h2>
      <p>Check your grade on the 1st of every month. The score is deterministic from public data, so movement means something real changed — a B climbing to an A- is a strategy working; a slipping grade catches problems early.</p>
    </SimpleToolLanding>
  );
}
