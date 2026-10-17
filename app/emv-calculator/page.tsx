import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import EmvCalculator from "@/components/EmvCalculator";

export const metadata: Metadata = {
  title: "Instagram EMV Calculator — Earned Media Value (₹ / $) | InstaGrab",
  description:
    "Calculate the earned media value (EMV) of your Instagram posts: impressions, likes, comments, shares and saves converted to ₹ or $ — the number brands understand. Free.",
  alternates: { canonical: "/emv-calculator" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="EMV calculator"
      h1={<>What your post is worth in <em className="gilded">ad money</em>.</>}
      lead="Enter a post's engagement — get its earned media value: what that organic attention would cost as paid ads."
      tool={<EmvCalculator />}
      faq={[
        { q: "What is EMV?", a: "Earned Media Value estimates what your organic engagement would have cost as paid media — each impression, like, comment, share and save priced at industry rates. It's the metric agencies use to justify influencer budgets." },
        { q: "Why do comments have the highest value?", a: "Because they're the rarest and hardest to buy — a comment is real attention. Industry EMV indexes price a comment at roughly 40× a like." },
        { q: "How do I use EMV in pitches?", a: "\"My average post generates ₹18,000 in earned media\" hits harder than follower counts. Calculate EMV for your last 5 posts, average it, and put it in your media kit." },
        { q: "Is EMV exact?", a: "No EMV figure is — the per-interaction values are industry conventions. Use it for comparisons and pitching, not accounting." },
      ]}
    >
      <h2>Speak the language brands budget in</h2>
      <p>Brands don&apos;t buy followers; they buy attention priced against their ad spend. EMV translates your engagement into exactly that currency — which is why agencies report campaign results in EMV, and why your pitch should too.</p>
      <h2>India rates, not just dollar math</h2>
      <p>Indian CPMs and interaction values run differently from US campaigns, so this calculator has a proper ₹ mode with domestic values — not a blind currency conversion that would overprice your pitch into rejection.</p>
      <h2>Pair it with your media kit</h2>
      <p>Average the EMV of your recent posts and drop it into our free media kit generator next to your engagement rate. Numbers that talk money get replies from brand managers.</p>
    </SimpleToolLanding>
  );
}
