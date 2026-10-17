import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import GridArchitect from "@/components/GridArchitect";

export const metadata: Metadata = {
  title: "Grid Architect — Design a Colour-Cohesive Instagram Feed | InstaGrab",
  description:
    "Upload your next posts and arrange a beautiful, colour-cohesive grid. Auto-sort by colour or brightness, drag to reorder, preview your 3×3 feed. On-device, free.",
  alternates: { canonical: "/grid-architect" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Grid Architect"
      h1={<>Design a <em className="gilded">colour-cohesive</em> feed.</>}
      lead="Upload your next posts and Grid Architect reads each photo's colour — auto-arrange by hue or brightness, drag to fine-tune, and preview your 3×3 grid before you post."
      tool={<GridArchitect />}
      faq={[
        { q: "What does it do?", a: "It analyses the dominant colour of each photo you upload, then helps you order them into a harmonious grid — sort by colour for a gradient feed, by brightness for balance, or drag tiles to arrange it yourself." },
        { q: "How is this different from a grid planner?", a: "Ordinary planners just let you drag photos around. Grid Architect actually understands each photo's colour and can arrange a cohesive palette for you — that's the part that makes a feed look designed." },
        { q: "Do my photos get uploaded?", a: "No. Everything runs in your browser — the colour analysis and arranging never leave your device." },
        { q: "How many photos can I add?", a: "Up to 12, so you can plan the next few rows of your feed at once." },
      ]}
    >
      <h2>A feed that looks designed, not dumped</h2>
      <p>The accounts that make you hit &ldquo;follow&rdquo; almost always have one thing in common: a cohesive grid. Grid Architect gives you that on purpose — it reads the colour of every photo and helps you sequence them so your profile looks intentional at a glance.</p>
      <h2>Plan the whole row before you post</h2>
      <p>Instead of posting one photo and hoping it fits, lay out your next 3, 6 or 9 posts here first. Rearrange until the palette flows, then publish in that order — the difference between a random feed and a signature one.</p>
    </SimpleToolLanding>
  );
}
