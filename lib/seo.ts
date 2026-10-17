/** SEO helpers: FAQ data + JSON-LD builders (server-safe, no client deps). */
import { SITE_URL as BASE } from "@/lib/site-url";

export type QA = { q: string; a: string };

export const DEFAULT_FAQ: QA[] = [
  { q: "Is this free?", a: "Yes. InstaGrab is free to use — no account, no limits for normal use. Ads keep it running." },
  { q: "Do I need to log in?", a: "No. We never ask for your Instagram login or password — that's a promise, and a safety feature." },
  { q: "Does it work on private accounts?", a: "No. InstaGrab fetches public content only. Private accounts stay private." },
  { q: "Where is my link stored?", a: "Nowhere. Links are processed in memory to fetch your media and never written to a database." },
  { q: "Is downloading allowed?", a: "Only download content you own or have permission to use. See our Terms for details." },
  { q: "Why did a download fail?", a: "Instagram changes things on their side from time to time; we patch fast — usually within hours. Try again soon." },
];

/** schema.org FAQPage — helps tool pages surface in Google's FAQ-rich results. */
export function faqJsonLd(items: QA[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

/** schema.org WebApplication — describes the tool itself on the homepage. */
export function webAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "InstaGrab",
    url: BASE,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free Instagram downloader for reels, photos, stories and carousels in HD — plus caption and hashtag extraction. No login required.",
  };
}
