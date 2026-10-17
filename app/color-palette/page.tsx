import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import PaletteExtractor from "@/components/PaletteExtractor";

export const metadata: Metadata = {
  title: "Color Palette Extractor — 5 Hex Codes from Any Photo | InstaGrab",
  description:
    "Upload a photo and get its 5 signature colors as hex codes, free. Build a consistent Instagram aesthetic — palette extraction runs entirely in your browser.",
  alternates: { canonical: "/color-palette" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Color palette extractor"
      h1={<>Your photo&apos;s five <em className="gilded">signature colors</em>.</>}
      lead="Drop in any image — get its palette as tappable hex codes for stories, covers and a feed that looks planned."
      tool={<PaletteExtractor />}
      faq={[
        { q: "How are the colors picked?", a: "We sample the image, cluster similar pixels, and keep the 5 most dominant colors that are visually distinct from each other — skipping near-white and near-black, which are rarely useful as swatches." },
        { q: "What do I do with hex codes?", a: "Paste them anywhere colors are set: Instagram story text/background (via the color picker), Canva brand kits, highlight covers, your website. Same 5 codes everywhere = instantly cohesive brand." },
        { q: "Is the photo uploaded?", a: "No — the extraction runs on your device in the browser. Nothing is sent to any server." },
      ]}
    >
      <h2>Aesthetic feeds are just consistent palettes</h2>
      <p>The accounts that look &ldquo;curated&rdquo; aren&apos;t using better cameras — they&apos;re reusing the same handful of colors in every story, cover and graphic. Extract the palette from your best photo and make it your law.</p>
      <h2>From photo to brand kit in a minute</h2>
      <p>Tap each swatch to copy its hex, drop the five codes into your notes (or Canva&apos;s brand kit), and use nothing else for a month. That&apos;s the entire secret behind feeds that look art-directed.</p>
      <h2>Great for moodboards too</h2>
      <p>Studying an account whose look you love? Extract palettes from their posts and see the pattern — most stick to 3 dominant colors plus 2 accents. Now you know their recipe.</p>
    </SimpleToolLanding>
  );
}
