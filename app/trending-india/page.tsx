import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import TrendingIndia from "@/components/TrendingIndia";

export const metadata: Metadata = {
  title: "Trend Radar India — Trending Hashtags, Audio & Reel Formats | InstaGrab",
  description:
    "What's working on Instagram India right now: copy-ready hashtag sets by category, audio strategy and the reel formats getting reach — curated and updated regularly.",
  alternates: { canonical: "/trending-india" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Trend radar · India"
      h1={<>What&apos;s working in <em className="gilded">India</em>, right now.</>}
      lead="Copy-ready hashtag sets, audio strategy and the formats getting reach — curated for the Indian Instagram, refreshed regularly."
      tool={<TrendingIndia />}
      wide
      faq={[
        { q: "How current is this data?", a: "Curated by humans and refreshed regularly — the last-updated date is shown at the top. It's a radar for direction, not a fake 'live' feed; verify final audio picks inside the app where the ↗ trending arrow shows." },
        { q: "Why India-specific?", a: "Global trend lists are US-centric. Indian Instagram has its own audio cycles (Bollywood remixes, OTT dialogues, festival spikes) and its own winning formats — this page tracks those." },
        { q: "How do I use the hashtag sets?", a: "Copy the set closest to your niche, then swap 2-3 generic tags for ultra-specific ones about your post. Run the result through our hashtag counter to dedupe and trim." },
      ]}
    >
      <h2>Ride waves early, not late</h2>
      <p>Reach on Instagram India follows waves — an audio spikes, a format breaks out, a festival approaches. Creators who catch the wave in its first days get the outsized reach; by the time it&apos;s everywhere, it&apos;s over. The radar keeps you on the early side.</p>
      <h2>Bookmark-worthy on purpose</h2>
      <p>This page is designed to be your Monday ritual: check the radar, pick this week&apos;s formats, copy the hashtag base, plan with the content-ideas AI. Five minutes of direction before you create.</p>
    </SimpleToolLanding>
  );
}
