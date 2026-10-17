import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import WheelSpinner from "@/components/WheelSpinner";

export const metadata: Metadata = {
  title: "Wheel Spinner — Random Name Picker for Giveaways | InstaGrab",
  description:
    "Free spinning wheel name picker for Instagram giveaways: paste entrants, spin a beautiful gold wheel, get a provably random winner. Perfect for screen-recorded draws.",
  alternates: { canonical: "/wheel-spinner" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Giveaway wheel spinner"
      h1={<>Spin the wheel, crown a <em className="gilded">winner</em>.</>}
      lead="Paste your entrants, hit spin — a casino-smooth wheel picks a provably random winner. Screen-record it for a transparent draw."
      tool={<WheelSpinner />}
      wide
      faq={[
        { q: "Is the pick really random?", a: "Yes — the winning angle comes from your browser's cryptographic random generator (the same tech behind passwords), not a predictable shortcut. Every name has an exactly equal chance." },
        { q: "How do I run a transparent giveaway?", a: "Announce the draw time in your caption, screen-record the spin, and post the recording to your story. Entrants can see their own name on the wheel — nothing builds trust faster." },
        { q: "How many names can I add?", a: "Hundreds — duplicates are removed automatically, and labels shrink to fit. For very large draws, paste in batches or run elimination rounds (spin, remove, respin)." },
        { q: "Where do I get the entrant list?", a: "Copy the names from your comments manually or from any export. Winner announcement caption? Our AI giveaway caption generator writes it." },
      ]}
    >
      <h2>The draw your followers can trust</h2>
      <p>&ldquo;Winner picked randomly&rdquo; in a caption convinces nobody. A wheel spinning on camera with every entrant&apos;s name visible — that convinces everyone. Paste, spin, screen-record: transparent giveaway in under a minute.</p>
      <h2>Not just giveaways</h2>
      <p>Who pays for chai today? Which reel idea do you film next? Which follower gets a shoutout? Any decision with names attached becomes content — spin it on camera and let chance be the villain.</p>
      <h2>Run the whole giveaway free</h2>
      <p>Announcement caption from the AI giveaway generator, entries collected on your post, winner from this wheel, DM the winner with a link from our DM link generator. Zero paid tools, start to finish.</p>
    </SimpleToolLanding>
  );
}
