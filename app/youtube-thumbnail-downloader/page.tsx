import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import YtThumbnail from "@/components/YtThumbnail";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Downloader — Full HD, Free | InstaGrab",
  description:
    "Download any YouTube video's thumbnail in Full HD (1280×720), free. Works with normal videos, Shorts and youtu.be links — paste the URL, save the image. No login.",
  alternates: { canonical: "/youtube-thumbnail-downloader" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="YouTube thumbnail downloader"
      h1={<>Any YouTube thumbnail, <em className="gilded">full HD</em>.</>}
      lead="Paste a video or Shorts link — get every available thumbnail size, up to 1280×720, with one-click downloads."
      tool={<YtThumbnail />}
      wide
      faq={[
        { q: "Which links work?", a: "All of them: youtube.com/watch, youtu.be short links, Shorts, embeds and live URLs. You can even paste a bare 11-character video ID." },
        { q: "Why is there no Full HD option for some videos?", a: "The 1280×720 (maxres) thumbnail only exists when the creator uploaded a high-resolution custom thumbnail. For older or auto-thumbnail videos, the largest available size is shown instead." },
        { q: "Can I use downloaded thumbnails in my own content?", a: "Thumbnails belong to their creators. Downloading for reference, mood boards or research is normal practice — reusing one as-is in your own upload may infringe copyright. Use them as inspiration, not assets." },
        { q: "Do you download the video too?", a: "No — this tool fetches only the public thumbnail images that YouTube serves. It's instant and completely legal to view." },
      ]}
    >
      <h2>Grab the thumbnail, skip the screenshot</h2>
      <p>Screenshotting a paused video gives you a compressed frame with a play button in it. YouTube actually serves every video&apos;s thumbnail as a clean image at several sizes — this tool simply finds them all and gives you real download buttons, up to <strong>1280×720 Full HD</strong>.</p>
      <h2>For creators studying what works</h2>
      <p>Thumbnails decide clicks. Collecting the thumbnails of the top videos in your niche — full-size, side by side — is the fastest way to see the patterns: face size, text length, colour contrast. Build your reference board here, then design yours better.</p>
      <h2>Works with Shorts too</h2>
      <p>Shorts links, classic watch URLs, youtu.be shares, even raw video IDs — paste anything and the tool extracts the right video automatically, hiding sizes that don&apos;t exist for that upload.</p>
    </SimpleToolLanding>
  );
}
