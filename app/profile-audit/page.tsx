import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ProfileStatsTool from "@/components/ProfileStatsTool";

export const metadata: Metadata = {
  title: "Instagram Profile Audit — Free Smart Report on Your Account | InstaGrab",
  description:
    "Get a free smart audit of any public Instagram profile — engagement, posting consistency, best time, hashtag use and caption strength, with clear tips. No login.",
  alternates: { canonical: "/profile-audit" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Profile audit"
      h1={<>A smart audit of <em className="gilded">your account</em>.</>}
      lead="Enter a public username for a clear report — engagement, consistency, timing, hashtags and captions, with fixes."
      tool={<ProfileStatsTool mode="audit" />}
      faq={[
        { q: "What does the audit check?", a: "Engagement rate, comment-to-like ratio, posting consistency, the window your recent posts cluster in, hashtag count, and caption length — each with a plain-English recommendation." },
        { q: "Is this AI?", a: "It's a rules-based analysis of your public numbers — fast, free and private. No data is sent to any AI service or stored." },
        { q: "Can I audit any account?", a: "Any public account — your own or a competitor's. It only reads public post metrics, never private data or follower lists." },
      ]}
    >
      <h2>Know what to fix, not just your numbers</h2>
      <p>Anyone can show you a follower count. A useful audit tells you <strong>what to change</strong>. This report reads your recent public posts and turns them into specific findings — where you&apos;re strong, and the two or three tweaks most likely to lift your reach.</p>
      <h2>What it looks at</h2>
      <p>Engagement rate for your size, how much conversation your posts spark, whether you post consistently, the day and hour your recent posts cluster around, and whether your hashtag count and caption length are in the healthy range — each with a short, actionable tip.</p>
      <h2>Private, instant, honest</h2>
      <p>It uses only public numbers, runs in seconds, and stores nothing. The findings are estimates meant to guide experiments — not guarantees. Test one change at a time and watch what moves.</p>
    </SimpleToolLanding>
  );
}
