import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import PhotoResizer from "@/components/PhotoResizer";

export const metadata: Metadata = {
  title: "Instagram Photo Resizer — All Post, Story & DP Sizes | InstaGrab",
  description:
    "Resize any photo to Instagram's exact sizes free: square 1:1, portrait 4:5, story 9:16, reel cover, profile picture — crop-to-fill or blur-pad fit. 100% on-device.",
  alternates: { canonical: "/photo-resizer" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Photo resizer"
      h1={<>Every Instagram size, <em className="gilded">pixel-perfect</em>.</>}
      lead="Pick a preset — post, story, reel cover or DP — and get your photo at the exact resolution Instagram wants."
      tool={<PhotoResizer />}
      wide
      faq={[
        { q: "What sizes does Instagram actually use?", a: "Posts: 1080×1080 (square), 1080×1350 (portrait — the biggest on screen), 1080×566 (landscape). Stories and reels: 1080×1920. Profile picture displays small but upload 320×320+." },
        { q: "Crop-to-fill vs blur pad?", a: "Crop-to-fill trims your photo to fill the frame exactly. Blur pad keeps the whole photo visible and fills the empty space with a blurred version of itself — the classic look for landscape photos in portrait frames." },
        { q: "Is my photo uploaded anywhere?", a: "Never — the resize happens entirely in your browser with the canvas API. The photo doesn't leave your device." },
        { q: "Why does my quality drop after posting?", a: "Instagram re-compresses aggressively when your upload isn't at its native sizes. Uploading at exactly 1080px wide gives its compressor the least excuse to mangle your photo." },
      ]}
    >
      <h2>Stop letting Instagram crop for you</h2>
      <p>Upload the wrong shape and Instagram decides what gets cut — usually a forehead or the product you were showcasing. Resizing to the exact frame first means <em>you</em> choose what the frame contains.</p>
      <h2>Portrait 4:5 is free real estate</h2>
      <p>A 1080×1350 portrait post takes ~30% more screen than a square while scrolling — more pixels, more stopping power, same post. If you only remember one preset, make it this one.</p>
      <h2>Private by architecture</h2>
      <p>This resizer has no upload button because there&apos;s no server — the canvas in your browser does all the work. Resize client photos, unreleased products, personal pictures; nothing leaves the device.</p>
    </SimpleToolLanding>
  );
}
