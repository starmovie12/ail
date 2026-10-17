import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import StoryFeed from "@/components/StoryFeed";

export const metadata: Metadata = {
  title: "Multi-Account Story Viewer — All Stories in One Feed | InstaGrab",
  description:
    "Watch stories from all your favorite public Instagram accounts in one anonymous feed. Build a watchlist (saved on-device), load everything with one tap, download any story.",
  alternates: { canonical: "/story-feed" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Story watch mode"
      h1={<>Every favourite account&apos;s stories, <em className="gilded">one feed</em>.</>}
      lead="Build a watchlist of up to 10 public accounts — one tap loads all their active stories, anonymously."
      tool={<StoryFeed />}
      wide
      faq={[
        { q: "Do story views show up?", a: "No — this loads stories anonymously, the same as our story viewer. Watch competitors, exes and celebrities in peace. 😄" },
        { q: "Where is my watchlist stored?", a: "Only in your browser's localStorage — we never see it. That's also why it won't sync to another device." },
        { q: "Why is loading one-by-one?", a: "Sequential loading respects rate limits so all 10 accounts load reliably instead of half of them erroring. Ten accounts take a few seconds." },
        { q: "Private accounts?", a: "Public accounts only — private stories are private, and no tool that claims otherwise is telling the truth." },
      ]}
    >
      <h2>The daily check, without the app</h2>
      <p>If you check the same handful of accounts every day — competitors, clients, inspirations — opening each profile is friction. A watchlist turns the routine into one tap: every active story, one scrollable feed, zero view receipts.</p>
      <h2>Made for competitor watching</h2>
      <p>Stories are where accounts test offers, tease launches and speak candidly — and they vanish in 24 hours. A daily one-tap sweep of your niche&apos;s top 10 accounts is genuine market research, downloadable when something&apos;s worth keeping.</p>
    </SimpleToolLanding>
  );
}
