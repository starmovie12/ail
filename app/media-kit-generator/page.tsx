import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import MediaKitMaker from "@/components/MediaKitMaker";

export const metadata: Metadata = {
  title: "Free Instagram Media Kit Generator — Gold Editorial Design | InstaGrab",
  description:
    "Create a beautiful one-page Instagram media kit free: stats, audience, collab rates and contact — in a premium gold editorial design. Download as PNG, no login, no watermark fees.",
  alternates: { canonical: "/media-kit-generator" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Media kit generator"
      h1={<>A media kit brands take <em className="gilded">seriously</em>.</>}
      lead="Your stats, audience and rates — laid out in a premium gold design and downloaded as a crisp PNG. Free, no watermark walls."
      tool={<MediaKitMaker />}
      wide
      faq={[
        { q: "What is a media kit?", a: "A one-page creator résumé for brands: who you are, your stats (followers, engagement, reach), your audience, your rates and how to contact you. It's the first thing serious brands ask for." },
        { q: "Where do I get my stats?", a: "Followers and engagement rate from our engagement calculator; average reach from Instagram's own Insights (Professional dashboard). Round honestly — brands verify." },
        { q: "Should I include rates?", a: "If you know them, yes — it filters out low-ball offers. Not sure what to charge? Run our money calculator first, then put the 'quote brands this' number here." },
        { q: "PNG or PDF?", a: "The PNG is 1080×1350 — sharp in email, WhatsApp and DMs, and it prints fine. Brands care about the numbers, not the file format." },
      ]}
    >
      <h2>Everything on the page a brand actually reads</h2>
      <p>Brand managers skim media kits in ~20 seconds: name, niche, followers, engagement, rates, contact. This generator puts exactly those on one gold-framed page — no fluffy &ldquo;about me&rdquo; essays, no design software, no ₹500/month kit-builder subscription.</p>
      <h2>Design that signals premium</h2>
      <p>Your media kit is a price tag. A Canva-default kit whispers &ldquo;negotiate me down&rdquo;; a clean editorial layout with restrained gold says the opposite. The design here is deliberately understated — your numbers do the talking inside a frame that makes them look expensive.</p>
      <h2>The full pitch workflow, free</h2>
      <p>Money calculator → your rates. Engagement calculator → your stats. Media kit → the document. DM link generator → the follow-up. InstaGrab covers the entire brand-deal pipeline without a single paid tool.</p>
    </SimpleToolLanding>
  );
}
