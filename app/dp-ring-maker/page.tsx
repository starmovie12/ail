import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import DpRingMaker from "@/components/DpRingMaker";

export const metadata: Metadata = {
  title: "Instagram Story Ring Maker — Add a Gradient Ring to Your DP | InstaGrab",
  description:
    "Add the colourful Instagram story-style gradient ring around your profile picture. Upload your DP, pick a ring, download the PNG. Free, in your browser.",
  alternates: { canonical: "/dp-ring-maker" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Story ring maker"
      h1={<>Give your DP the <em className="gilded">story ring</em>.</>}
      lead="Add the colourful story-style gradient ring around your profile picture — upload, pick a ring, download."
      tool={<DpRingMaker />}
      faq={[
        { q: "Why add a ring to my DP?", a: "A profile photo that looks like it has an active story draws the eye — people are trained to tap rings, so it can nudge more profile visits and clicks." },
        { q: "What do I get?", a: "A square PNG of your photo with the gradient ring baked in, ready to set as your Instagram profile picture." },
        { q: "Is my photo private?", a: "Yes. The ring is drawn in your browser on a canvas — your image never leaves your device." },
      ]}
    >
      <h2>The little detail that gets clicks</h2>
      <p>Instagram wraps profile photos with an active story in a bright gradient ring, and users instinctively tap it. A profile picture that already carries that ring stands out in comments, search and suggestions — a small visual trick with an outsized effect.</p>
      <h2>How to use the ring maker</h2>
      <p>Upload your photo, choose a ring style — the classic Instagram <strong>Story</strong> gradient, or gold, sunset and ocean variants — and download the PNG. Set it as your profile picture and you&apos;re done.</p>
      <h2>Private and free</h2>
      <p>No upload, no login, no watermark. The whole thing runs on your device.</p>
    </SimpleToolLanding>
  );
}
