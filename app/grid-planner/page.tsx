import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import GridPlanner from "@/components/GridPlanner";

export const metadata: Metadata = {
  title: "Instagram Grid Planner — Preview Your 3×3 Feed, Free | InstaGrab",
  description:
    "Plan your Instagram feed free: add up to 9 upcoming posts, swap them around, and preview your 3×3 grid exactly as profile visitors will see it. On-device, no login.",
  alternates: { canonical: "/grid-planner" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Grid preview planner"
      h1={<>See your feed <em className="gilded">before you post it</em>.</>}
      lead="Add your upcoming photos, swap them until the 3×3 sings — this is exactly what profile visitors will see."
      tool={<GridPlanner />}
      faq={[
        { q: "How does reordering work?", a: "Tap one photo, then another — they swap. Keep going until the grid flows. The top-left slot is your next (newest) post." },
        { q: "Why does the grid matter?", a: "New visitors decide to follow from your grid, not your latest post. A grid with rhythm — alternating tones, consistent palette, no two similar shots adjacent — converts visits into follows." },
        { q: "Can it post for me?", a: "No — this is a planning tool. You keep the order in mind (or screenshot it) and post in sequence. No login means zero account risk." },
      ]}
    >
      <h2>The grid is your storefront</h2>
      <p>Individually great photos can make a chaotic grid — three busy shots in a row, two sunsets touching, a palette fight. Seeing the nine together before posting is the difference between a feed and a camera roll.</p>
      <h2>Plan in seconds, not in an app suite</h2>
      <p>Paid planners want an account, an app install and a subscription for what is fundamentally a 3×3 preview. Add photos, swap, done — and your unposted content never leaves your device.</p>
    </SimpleToolLanding>
  );
}
