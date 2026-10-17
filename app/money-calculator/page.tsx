import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import MoneyCalculator from "@/components/MoneyCalculator";

export const metadata: Metadata = {
  title: "Instagram Money Calculator — Earnings per Post (₹ / $) | InstaGrab",
  description:
    "Free Instagram money calculator: enter followers, engagement rate and niche to estimate earnings per sponsored post, story and reel — with Indian ₹ and global $ rates. No login.",
  alternates: { canonical: "/money-calculator" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Money calculator"
      h1={<>What&apos;s your Instagram <em className="gilded">really worth</em>?</>}
      lead="Followers + engagement + niche → your estimated rate per post, story and reel. India ₹ and global $ rates, both free."
      tool={<MoneyCalculator />}
      faq={[
        { q: "How is the estimate calculated?", a: "We use published influencer-marketing rate cards: a base rate per 1,000 followers for your niche, scaled by how your engagement rate compares to the ~2% benchmark. The India mode uses domestic brand budgets, which run lower than US CPMs." },
        { q: "What should I actually charge a brand?", a: "Start from the “quote brands this” number — it includes a margin for usage rights and revisions. Charge more for exclusivity, whitelisting (ads run from your handle) or multi-post packages." },
        { q: "Do nano and micro influencers earn money?", a: "Yes — accounts from 1,000 followers land barter and paid deals, especially with engagement above 4%. Brands increasingly prefer micro creators because their audiences trust them more." },
        { q: "Where do I find my engagement rate?", a: "Use our free engagement calculator — enter your @username and it computes the rate from your recent posts automatically." },
      ]}
    >
      <h2>How much money can you make on Instagram?</h2>
      <p>Sponsored posts are priced on three things: <strong>audience size</strong>, <strong>engagement rate</strong> and <strong>niche</strong>. A 25K-follower finance creator with 4% engagement often out-earns a 100K meme page, because brands pay for attention and trust — not raw follower counts.</p>
      <h2>Indian rates vs global rates</h2>
      <p>Indian domestic brand budgets are real but lower than US campaigns — that&apos;s why this calculator has a dedicated <strong>India ₹ mode</strong> instead of blindly converting dollar rates. If your audience is global or you work with international brands, switch to the $ mode.</p>
      <h2>Raise your rate, not just your followers</h2>
      <p>The fastest way to earn more per post is better engagement: reply to comments in the first hour, post when your audience is online (try our best-time-to-post tool), and keep captions above the fold sharp. A one-point jump in engagement rate can raise your quote by 50%.</p>
    </SimpleToolLanding>
  );
}
