import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import HashtagChecker from "@/components/HashtagChecker";

export const metadata: Metadata = {
  title: "Banned Hashtag Checker — Spot Shadowbanned Tags | InstaGrab",
  description:
    "Paste your Instagram hashtags and instantly see which ones are banned, blocked or risky — before you post. Avoid shadowbans. Free, runs in your browser.",
  alternates: { canonical: "/hashtag-checker" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Banned hashtag checker"
      h1={<>Catch banned tags <em className="gilded">before you post</em>.</>}
      lead="Paste your hashtags and instantly see which ones are flagged, banned or risky — and copy the clean set."
      tool={<HashtagChecker />}
      faq={[
        { q: "What does 'banned' mean?", a: "Some hashtags are blocked or restricted by Instagram — posts using them get hidden from Explore and the hashtag page, quietly killing your reach (a 'shadowban')." },
        { q: "How accurate is this?", a: "It checks against a curated list of well-documented banned/restricted tags. Instagram never publishes an official list and it changes, so treat flags as 'avoid', not a guarantee." },
        { q: "Does it need my login?", a: "No. It runs entirely in your browser and checks against a built-in list — nothing is sent anywhere." },
      ]}
    >
      <h2>Why one bad hashtag hurts the whole post</h2>
      <p>Instagram can suppress an entire post&apos;s reach if it uses a single banned or restricted hashtag. These are often innocent-looking everyday words that got flagged because of spam — you&apos;d never guess they were risky. Checking before you post is the cheapest insurance for your reach.</p>
      <h2>How to use it</h2>
      <p>Paste your whole hashtag block. The checker splits it, flags the risky ones in red, and gives you a one-tap <strong>copy of the safe set</strong> so you can post with confidence.</p>
      <h2>An honest caveat</h2>
      <p>Instagram keeps its list secret and updates it constantly, so no checker can be 100% current. Use this as a strong first filter — and when a tag looks borderline, leave it out.</p>
    </SimpleToolLanding>
  );
}
