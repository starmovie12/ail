import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import DmLinkGenerator from "@/components/DmLinkGenerator";

export const metadata: Metadata = {
  title: "Instagram DM Link Generator — ig.me Link + QR Code | InstaGrab",
  description:
    "Create your Instagram DM link (ig.me) with an optional pre-filled message, plus a scan-to-DM QR code you can download and print. Free, no login.",
  alternates: { canonical: "/dm-link-generator" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="DM link generator"
      h1={<>One tap, straight into your <em className="gilded">DMs</em>.</>}
      lead="Generate your official ig.me DM link — with an optional pre-filled message — plus a QR code for print."
      tool={<DmLinkGenerator />}
      faq={[
        { q: "What is an ig.me link?", a: "Instagram's official DM deep link: ig.me/m/yourusername opens a chat with you directly in the app. No profile visit, no Follow-then-find-the-button friction." },
        { q: "What's the pre-filled message for?", a: "It types the first message for the sender — 'Hi! I want to order' or 'Interested in a collab'. Lower friction means more people actually send it, and you instantly know why they're messaging." },
        { q: "Where should I use the QR code?", a: "Product packaging, visiting cards, shop counters, event posters, YouTube end screens — anywhere offline eyes can scan their way into your DMs." },
        { q: "Does this work for business accounts?", a: "Yes — ig.me works for all account types. It's especially powerful for Instagram-first sellers who close orders in DMs." },
      ]}
    >
      <h2>DMs are where money happens</h2>
      <p>For lakhs of Indian sellers, the DM <em>is</em> the checkout. Every step between a customer&apos;s intent and your chat loses buyers — an ig.me link removes all of them. One tap from a bio, a WhatsApp status or an email signature, straight into conversation.</p>
      <h2>Pre-filled messages qualify your leads</h2>
      <p>Different links for different placements: &ldquo;Saw your reel about X&rdquo; from reels, &ldquo;Want to order&rdquo; from your bio, &ldquo;Collab enquiry&rdquo; from your media kit. The first message tells you the source and intent before you even reply.</p>
      <h2>Print the QR, bridge offline to online</h2>
      <p>The downloadable QR code turns physical surfaces into DM funnels — packaging inserts, stall banners, business cards. Scan → chat → customer. Pair it with our UTM builder for the links you can track in analytics.</p>
    </SimpleToolLanding>
  );
}
