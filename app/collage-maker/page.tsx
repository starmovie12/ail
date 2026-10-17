import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import CollageMaker from "@/components/CollageMaker";

export const metadata: Metadata = {
  title: "Photo Collage Maker — 2-9 Photos, Gold Borders, Free | InstaGrab",
  description:
    "Make a photo collage for Instagram free: 6 layouts for 2-9 photos, adjustable borders (gold gradient optional), live preview, 1080px download. 100% on-device.",
  alternates: { canonical: "/collage-maker" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Collage maker"
      h1={<>Many photos, one <em className="gilded">beautiful frame</em>.</>}
      lead="Pick a layout, drop in 2-9 photos, tune the borders — download a crisp 1080px collage. Gold borders included, obviously."
      tool={<CollageMaker />}
      wide
      faq={[
        { q: "Which layouts are there?", a: "Six: two side-by-side, two stacked, one-big-plus-two, and clean 4/6/9 grids. Photos are auto-cropped to fill their cells — centered on the middle of each shot." },
        { q: "What size is the download?", a: "1080×1080 JPG — Instagram's native post size, so the app won't re-crush your collage." },
        { q: "Are my photos uploaded?", a: "Never — the collage is composed on your device with the canvas API. Works offline once the page loads." },
      ]}
    >
      <h2>Collages that don&apos;t look like collages apps</h2>
      <p>Most collage apps bury your photos under stickers, watermarks and 2014 clip-art. This one does the opposite: clean cells, adjustable spacing, and an optional gold gradient border that makes a phone-photo grid look editorial.</p>
      <h2>Before/after, hauls and recaps</h2>
      <p>Side-by-side layouts are made for transformations and comparisons; the 4-9 grids fit trip recaps, product hauls and monthly dumps in a single post — one frame instead of a ten-slide carousel.</p>
    </SimpleToolLanding>
  );
}
