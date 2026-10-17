import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";

export const metadata: Metadata = {
  title: "Instagram Hashtag Extractor — Grab Every Tag From Any Post | InstaGrab",
  description: "Extract every hashtag from any public Instagram post as tappable chips. Copy one tag or all of them, space-separated. Free.",
  alternates: {
    canonical: "/hashtag-extractor",
  },
};

export default function Page() {
  return (
    <ToolLanding
      eyebrow="Hashtag extractor · Signature tool"
      h1={<>Every hashtag from any post, <em className="gilded">extracted</em>.</>}
      lead="Tags become tappable chips — copy one, or copy all thirty, space-separated and paste-ready."
    >
      <h2>Research competitor hashtags in seconds</h2>
      <p>Found a post that&apos;s performing? Paste its link and every hashtag it uses appears as a chip. Tap one to copy it, or hit <strong>Copy all</strong> for the full space-separated set — ready to paste into your own draft.</p>
      <h2>Deduplicated and clean</h2>
      <p>Repeated tags are collapsed, order is preserved, and the count is shown so you know exactly how many tags the post uses (Instagram allows up to 30).</p>
      <h2>Build tag sets that work</h2>
      <p>Pull tags from three or four top posts in your niche, merge them, and cut to the 20&ndash;25 most relevant. That&apos;s a research workflow this tool turns into minutes.</p>
    </ToolLanding>
  );
}
