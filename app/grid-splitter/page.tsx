import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import GridSplitter from "@/components/GridSplitter";

export const metadata: Metadata = {
  title: "Instagram 9-Grid Photo Splitter — Giant Square Maker | InstaGrab",
  description:
    "Split one photo into a 3×3 grid for a giant Instagram profile layout. Upload, get 9 perfectly cut tiles in a ZIP, ready to post. Free, runs in your browser.",
  alternates: { canonical: "/grid-splitter" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="9-grid splitter"
      h1={<>One photo, a <em className="gilded">giant grid</em>.</>}
      lead="Cut a single image into 9 perfect tiles for a 3×3 profile layout — download them ready to post."
      tool={<GridSplitter />}
      faq={[
        { q: "How do I post the grid?", a: "Upload the 9 tiles to Instagram in reverse order — bottom-right first (tile 9), top-left last (tile 1) — so they line up as one big image on your profile." },
        { q: "What size should my photo be?", a: "Any size works. The tool centre-crops to a square, then slices it into nine equal tiles at good quality." },
        { q: "Is my photo uploaded anywhere?", a: "No. The splitting happens entirely in your browser with a canvas — your image never leaves your device." },
      ]}
    >
      <h2>What a 9-grid does</h2>
      <p>Posting one image as nine connected tiles turns the top of your profile into a single <strong>giant banner</strong> — a striking way to introduce yourself, launch a product, or anchor a theme. It&apos;s a classic premium-profile move.</p>
      <h2>How to use the splitter</h2>
      <p>Upload your photo. It&apos;s cropped to a square and cut into a 3×3 grid instantly. Download all nine tiles as a ZIP, then upload them to Instagram <strong>bottom-right first</strong> so they assemble correctly on your grid.</p>
      <h2>Private and instant</h2>
      <p>Everything runs in your browser — no upload, no wait, no watermark. Your original photo stays on your device.</p>
    </SimpleToolLanding>
  );
}
