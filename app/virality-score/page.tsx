import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ViralityScore from "@/components/ViralityScore";

export const metadata: Metadata = {
  title: "Reel Virality Score Calculator — Rate Your Reel /100 | InstaGrab",
  description:
    "Score any reel out of 100: enter views, likes, comments, shares and followers — get a virality score with specific tips on what to improve. Free, no login.",
  alternates: { canonical: "/virality-score" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Reel virality score"
      h1={<>How viral was that reel, <em className="gilded">really</em>?</>}
      lead="Punch in the reel's numbers from Insights — get a score out of 100 and exactly which lever to pull next time."
      tool={<ViralityScore />}
      faq={[
        { q: "Where do I find the numbers?", a: "Open your reel → ··· menu → Insights (needs a Professional account, free to switch). Views, likes, comments and shares are right there." },
        { q: "How is the score built?", a: "Four rates that predict distribution: like rate (likes÷views), comment rate, share rate — the strongest virality signal — and reach multiple (views÷followers, i.e. did it escape your bubble)." },
        { q: "Why do shares matter most?", a: "A share puts your reel in someone's DMs — the highest-trust distribution there is, and the algorithm knows it. Reels with 0.5%+ share rates are the ones that snowball." },
        { q: "What's a good score?", a: "80+ is viral DNA — remake that format immediately. 60–79 is strong. Under 40 usually means the hook died in the first 2 seconds." },
      ]}
    >
      <h2>Turn Insights into decisions</h2>
      <p>Instagram gives you raw numbers; it doesn&apos;t tell you what they mean. The virality score converts views, likes, comments and shares into one number — and, more usefully, tells you which specific rate is holding the reel back.</p>
      <h2>The four levers</h2>
      <p><strong>Reach multiple</strong> — did it escape your followers? Fix: stronger hooks. <strong>Like rate</strong> — did it land emotionally? Fix: sharper payoff. <strong>Share rate</strong> — was it send-worthy? Fix: relatability and &ldquo;tag someone&rdquo; angles. <strong>Comment rate</strong> — did it start conversation? Fix: end on a question.</p>
      <h2>Score, fix, repeat</h2>
      <p>Score every reel for a month and patterns emerge fast: your best format, your real posting window, the hook style your audience rewards. Double down on what scores 60+.</p>
    </SimpleToolLanding>
  );
}
