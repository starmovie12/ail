import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import VideoToGif from "@/components/VideoToGif";

export const metadata: Metadata = {
  title: "Video to GIF Converter — Free, In Your Browser | InstaGrab",
  description:
    "Convert any video clip to a GIF free: pick the start and length (up to 8s), encode on-device, download a WhatsApp-friendly GIF. No upload, no watermark.",
  alternates: { canonical: "/video-to-gif" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Video to GIF"
      h1={<>That moment, as a <em className="gilded">GIF</em>.</>}
      lead="Pick a video, choose the start and length, encode — a share-ready GIF built entirely in your browser."
      tool={<VideoToGif />}
      faq={[
        { q: "Why max 8 seconds?", a: "GIF is a wonderfully inefficient format — every second adds megabytes. 8 seconds at 10fps/480px keeps files WhatsApp- and Telegram-friendly. The best GIFs are 2-4 seconds anyway." },
        { q: "Where can I use the GIF?", a: "WhatsApp, Telegram, Twitter/X, Slack, Discord, blogs, presentations — anywhere that autoplays GIFs. Instagram itself converts them to video on upload, which also works." },
        { q: "Is the video uploaded?", a: "No — frames are sampled and encoded on your device. Your footage never leaves the browser." },
      ]}
    >
      <h2>Reaction GIFs from your own footage</h2>
      <p>The group chat&apos;s best GIFs aren&apos;t from Giphy — they&apos;re that 3-second clip of your friend&apos;s face. Load the video, scrub to the moment, encode. Instant inside joke, infinitely reusable.</p>
      <h2>Tuned for sharing, not archiving</h2>
      <p>10 frames per second at 480px wide is the sweet spot where motion stays smooth and the file stays sendable. No watermark, no sign-up wall between you and the download.</p>
    </SimpleToolLanding>
  );
}
