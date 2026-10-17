import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import UtmBuilder from "@/components/UtmBuilder";

export const metadata: Metadata = {
  title: "UTM Link Builder for Instagram — Track Your Bio Link | InstaGrab",
  description:
    "Build UTM tracking links for Instagram free: tag your bio, story and reel links so Google Analytics shows exactly which placement drives traffic and sales.",
  alternates: { canonical: "/utm-builder" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="UTM link builder"
      h1={<>Know which post actually <em className="gilded">sells</em>.</>}
      lead="Tag your links with UTM parameters — Google Analytics will show exactly which Instagram placement sent the traffic."
      tool={<UtmBuilder />}
      faq={[
        { q: "What are UTM parameters?", a: "Little tags on a URL (utm_source, utm_medium, utm_campaign…) that analytics tools read. They don't change where the link goes — they just label where the click came from." },
        { q: "What should I put in each field?", a: "source = instagram; medium = the placement (bio, story, reel, dm); campaign = the push it belongs to (diwali_sale); content = the specific post if you're testing variants." },
        { q: "Where do I see the results?", a: "Google Analytics → Acquisition → Traffic acquisition. You'll see instagram/bio vs instagram/story as separate rows — that comparison is the whole point." },
        { q: "Does Instagram allow UTM links?", a: "Completely — they're standard marketing practice and work in your bio, stories, and anywhere links are allowed." },
      ]}
    >
      <h2>&ldquo;Link in bio&rdquo; is a black box — open it</h2>
      <p>Traffic from Instagram lands in your analytics as one anonymous blob. UTM tags split that blob into bio vs story vs reel vs DM — and suddenly you know that stories drive browsers but DMs drive buyers. That knowledge changes what you post.</p>
      <h2>A naming system that stays useful</h2>
      <p>Keep source as <code>instagram</code>, use medium for placement, campaign for the launch or sale, content for the variant. Lowercase everything (the builder does this for you) — <code>Bio</code> and <code>bio</code> would show up as two different rows in your reports.</p>
      <h2>Free forever, works everywhere</h2>
      <p>UTMs are an open standard: Google Analytics, Mixpanel, Plausible, Shopify — everything reads them. Build the link here, paste it in your bio, and let the data start accumulating today.</p>
    </SimpleToolLanding>
  );
}
