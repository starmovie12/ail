import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import QuoteMaker from "@/components/QuoteMaker";

export const metadata: Metadata = {
  title: "Quote Post Maker — Aesthetic Quote Images for Instagram | InstaGrab",
  description:
    "Turn any text into a beautiful quote image for Instagram free: 5 editorial themes, post/story sizes, live preview, PNG download. No watermark, no login, on-device.",
  alternates: { canonical: "/quote-maker" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Quote post maker"
      h1={<>Words, dressed <em className="gilded">beautifully</em>.</>}
      lead="Type a quote, pick a theme and size — get a clean editorial quote image with live preview. No watermark."
      tool={<QuoteMaker />}
      wide
      faq={[
        { q: "Why do quote posts perform so well?", a: "They're the most shareable format on Instagram — relatable words get sent to friends and reposted to stories, and shares are the strongest distribution signal the algorithm has." },
        { q: "Is there a watermark?", a: "No watermark, no logo, no paywall. The PNG is clean and yours — add your own @handle in the author field instead." },
        { q: "Which size should I pick?", a: "4:5 portrait for feed posts (largest on screen), 9:16 for stories. The text auto-scales to fit whichever you choose." },
        { q: "Can I write in Hindi or Hinglish?", a: "Yes — type anything. Need the words themselves? Our AI caption generator writes quotable lines in Hindi, English and Hinglish." },
      ]}
    >
      <h2>The highest ROI format on Instagram</h2>
      <p>A quote post takes 60 seconds to make and regularly out-shares photos that took an hour. Relatable words in a clean frame are DM currency — and every share is free distribution.</p>
      <h2>Editorial themes, not clip-art</h2>
      <p>Five restrained themes — ivory & gold, noir, blush, sage, midnight — designed to look like a magazine pull-quote, not a 2012 motivation page. Serif italics, thin frames, room to breathe.</p>
      <h2>Your handle, your credit</h2>
      <p>Put your @username in the author line so the credit travels with every repost. Consistent theme + consistent handle = a quote series people recognize in their feed before they read a word.</p>
    </SimpleToolLanding>
  );
}
