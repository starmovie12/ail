import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import GiveawayPicker from "@/components/GiveawayPicker";

export const metadata: Metadata = {
  title: "Instagram Giveaway Comment Picker — Random Winner, Free | InstaGrab",
  description:
    "Pick a random giveaway winner from your Instagram post's comments free: entry filters (tag requirements, keywords), multiple winners, backup winners and a certificate.",
  alternates: { canonical: "/giveaway-picker" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Giveaway comment picker"
      h1={<>Fair winners, straight from your <em className="gilded">comments</em>.</>}
      lead="Paste your giveaway post — filter entries by rules, draw one or many winners (plus backups), all provably random."
      tool={<GiveawayPicker />}
      faq={[
        { q: "How are entries filtered?", a: "One entry per person (duplicates auto-removed), optional 'tag N+ friends' requirement counted from @mentions, and an optional keyword filter (like 'done'). Only comments passing every rule enter the draw." },
        { q: "Is the draw really random?", a: "Yes — winners are picked with your browser's cryptographic random generator. Screen-record the draw for full transparency with your audience." },
        { q: "How many comments does it consider?", a: "The most recent ~40-50 public comments Instagram exposes without login. For small and mid-size giveaways that's the whole pool; for huge ones, announce that the draw runs on recent entries — or run elimination rounds." },
        { q: "What about backup winners?", a: "Set 1-3 backups — if a winner doesn't claim in time, the next backup steps in. No re-draws, no arguments." },
      ]}
    >
      <h2>The draw your entrants can verify</h2>
      <p>Nothing kills a community faster than a giveaway that smells rigged. This picker shows the pool size, applies your stated rules mechanically, and draws with cryptographic randomness — screen-record it and nobody can argue.</p>
      <h2>Rules become filters</h2>
      <p>&ldquo;Tag 2 friends and comment done&rdquo; isn&apos;t just caption text — set it as a filter and non-qualifying comments are excluded automatically. What you announced is exactly what happens.</p>
      <h2>Finish with a certificate</h2>
      <p>One click after the draw creates a winner certificate with a unique ID — post it to your story as the official result. The whole giveaway pipeline (caption → draw → certificate) lives on InstaGrab, free.</p>
    </SimpleToolLanding>
  );
}
