import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import FrameGrabber from "@/components/FrameGrabber";

export const metadata: Metadata = {
  title: "Reel Frame Grabber — Capture Any Second as HD Image | InstaGrab",
  description:
    "Grab a full-resolution frame from any second of an Instagram reel or video, free. Scrub to the exact moment, capture, download as PNG — sharper than any screenshot.",
  alternates: { canonical: "/reel-frame-grabber" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Reel frame grabber"
      h1={<>Any second of any reel, as a <em className="gilded">crisp image</em>.</>}
      lead="Paste a reel, scrub to the exact moment, grab the frame — full video resolution, no play button, no UI."
      tool={<FrameGrabber />}
      wide
      faq={[
        { q: "How is this better than a screenshot?", a: "Screenshots capture your screen: compressed, with the progress bar and buttons baked in, at your display's resolution. This grabs the actual video frame at its native resolution — clean and sharp." },
        { q: "What do people use frames for?", a: "Custom reel covers (grab the exact flattering frame), thumbnails, memes from the perfect moment, and studying how creators frame their shots." },
        { q: "Can I grab from any point?", a: "Yes — scrub the player to any timestamp, pause, and capture. Grab as many frames as you like from one video." },
      ]}
    >
      <h2>The cover Instagram didn&apos;t pick</h2>
      <p>Instagram auto-picks your reel&apos;s cover and usually picks badly. Load your own reel here, scrub to the frame where you look right and the text is readable, grab it — that PNG is your custom cover, at full quality.</p>
      <h2>Built for the exact moment</h2>
      <p>The player scrubs frame-precisely and the capture takes whatever is on screen at that instant — no timing your screenshot against a moving video, no cropping out the pause button afterwards.</p>
    </SimpleToolLanding>
  );
}
