import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import LinkShortener from "@/components/LinkShortener";

export const metadata: Metadata = {
  title: "Link Shortener for Instagram Bio — Free Short Links | InstaGrab",
  description:
    "Shorten long links for your Instagram bio, stories and DMs free — clean short URLs that redirect instantly and stay valid for a year.",
  alternates: { canonical: "/link-shortener" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Link shortener"
      h1={<>Long links, made <em className="gilded">bio-sized</em>.</>}
      lead="Paste any long URL — get a clean short link that redirects instantly. Perfect for bios, stories and DMs."
      tool={<LinkShortener />}
      faq={[
        { q: "How long do short links last?", a: "One year from creation — plenty for bio links, campaign links and story swipe-ups. Re-shorten anytime to refresh." },
        { q: "Why shorten links for Instagram?", a: "Long UTM-tagged URLs look spammy in DMs and get cut off in bios. A short link is cleaner, easier to say out loud ('link in bio slash s slash abc123'), and just as trackable if you UTM-tag the destination first." },
        { q: "Can I track clicks?", a: "Track at the destination: build the long URL with our UTM builder first, then shorten it — your analytics will attribute every click correctly." },
      ]}
    >
      <h2>UTM first, shorten second</h2>
      <p>The winning combo: build your tracked link in the UTM builder (source, medium, campaign), then shorten the result here. You get a clean link for humans and full attribution for analytics — best of both.</p>
      <h2>Made for the DM economy</h2>
      <p>Sellers who close in DMs paste links all day. A short, trustworthy-looking URL gets clicked; a five-line tracking monster gets ignored. Shorten once, reuse everywhere.</p>
    </SimpleToolLanding>
  );
}
