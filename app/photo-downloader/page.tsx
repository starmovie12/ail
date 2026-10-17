import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";

export const metadata: Metadata = {
  title: "Instagram Photo Downloader — Original Quality, Carousels Too | InstaGrab",
  description: "Download Instagram photos in original resolution — single posts and full carousels, every slide. Free, no login.",
  alternates: {
    canonical: "/photo-downloader",
  },
};

export default function Page() {
  return (
    <ToolLanding
      eyebrow="Photo downloader"
      h1={<>Photo downloader — original quality, <em className="gilded">untouched</em>.</>}
      lead="Full-resolution JPGs straight from the source — carousels included, every slide."
    >
      <h2>Original resolution, not a screenshot</h2>
      <p>Screenshots crop, compress and cap at your screen size. InstaGrab pulls the <strong>original file</strong> Instagram stores — often 1440px wide — with no recompression.</p>
      <h2>Carousels, complete</h2>
      <p>Paste a carousel link and you&apos;ll see every slide in a strip — download each one individually, in order, with clear numbering. No more &ldquo;it only saved the first photo.&rdquo;</p>
      <h2>Caption and tags come along</h2>
      <p>Like every InstaGrab tool, the photo arrives with its caption, hashtags and mentions ready to copy — useful for moodboards, credits and reposts with permission.</p>
    </ToolLanding>
  );
}
