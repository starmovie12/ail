import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";

export const metadata: Metadata = {
  title: "Instagram Caption Extractor — Copy Any Caption Instantly | InstaGrab",
  description: "Extract and copy the full caption from any public Instagram post or reel — line breaks preserved, one click to copy. Free.",
  alternates: {
    canonical: "/caption-extractor",
  },
};

export default function Page() {
  return (
    <ToolLanding
      eyebrow="Caption extractor · Signature tool"
      h1={<>Copy any Instagram caption, <em className="gilded">instantly</em>.</>}
      lead="The full text — line breaks, emoji and all — one click to copy. No more retyping from a screenshot."
    >
      <h2>Why a caption extractor?</h2>
      <p>Instagram doesn&apos;t let you select caption text in the app. Marketers transcribe competitor copy by hand; creators retype their own old captions. Paste the link above instead — the <strong>entire caption</strong> appears in a copy-ready panel, formatting intact.</p>
      <h2>What gets extracted</h2>
      <p>The full caption text with original line breaks and emoji, every hashtag separated out as individual chips, and every @mention. Copy the whole thing, just the tags, or a single handle.</p>
      <h2>Works on reels and posts</h2>
      <p>Any public post, reel or carousel link works. The media download buttons are right there too, if you want the file as well.</p>
    </ToolLanding>
  );
}
