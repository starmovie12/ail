import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";

export const metadata: Metadata = {
  title: "Instagram Thumbnail Downloader — Save Reel & Video Covers in HD | InstaGrab",
  description:
    "Download the cover image (thumbnail) of any public Instagram reel, video or IGTV in full HD. Free, no login — perfect for competitor and thumbnail research.",
  alternates: { canonical: "/thumbnail-downloader" },
};

export default function Page() {
  return (
    <ToolLanding
      eyebrow="Thumbnail downloader"
      h1={<>Reel &amp; video thumbnails, <em className="gilded">in HD</em>.</>}
      lead="Grab the cover image of any public reel, video or IGTV — the full-resolution poster frame."
      faq={[
        { q: "What exactly is downloaded?", a: "The cover image (poster frame) Instagram shows before a video plays — saved as a full-resolution JPG." },
        { q: "Does it work for photos too?", a: "For a photo post the 'thumbnail' is the photo itself. For carousels you also get each slide's image." },
        { q: "Why download thumbnails?", a: "Creators study which covers get clicks. Pulling competitors' thumbnails is the fastest way to learn what works in your niche." },
        { q: "Is it free?", a: "Yes — free, no login, no watermark." },
      ]}
    >
      <h2>How to download a thumbnail</h2>
      <p>Copy the reel or video link (<strong>Share → Copy link</strong>), paste it above and press Download. Alongside the video, InstaGrab lists a <strong>Thumbnail JPG</strong> button — the cover image at full resolution.</p>
      <h2>Thumbnail research made easy</h2>
      <p>The cover frame is what makes someone stop scrolling. Saving the thumbnails of top-performing reels in your niche lets you spot patterns — framing, text placement, colour — and design better covers of your own. It&apos;s the same reverse-engineering that works for hashtags, applied to visuals.</p>
      <h2>Full quality, straight from the source</h2>
      <p>The image comes directly from Instagram&apos;s CDN, so it&apos;s exactly the resolution Instagram stores — no re-compression, nothing added.</p>
    </ToolLanding>
  );
}
