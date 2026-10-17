import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import VideoTrimmer from "@/components/VideoTrimmer";

export const metadata: Metadata = {
  title: "Video Trimmer Online — Cut Clips in Your Browser, Free | InstaGrab",
  description:
    "Trim any video in your browser free: set start and end, get your clip — no upload, no watermark, no install. Great for cutting reels and stories to length.",
  alternates: { canonical: "/video-trimmer" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Video trimmer · beta"
      h1={<>Cut the clip, skip the <em className="gilded">editing app</em>.</>}
      lead="Pick a video, drag the start and end sliders, trim — the clip records in your browser, nothing uploads."
      tool={<VideoTrimmer />}
      faq={[
        { q: "How does browser trimming work?", a: "Your selected range plays once while being re-recorded on-device (canvas + MediaRecorder). The tab must stay visible during recording — that's the one rule." },
        { q: "What format is the output?", a: "WebM — plays everywhere modern and uploads to Instagram, WhatsApp and YouTube fine. Need MP4 specifically? Any free converter transcodes WebM in seconds." },
        { q: "Which browsers work best?", a: "Chrome and Edge (full support, audio included). Firefox works; Safari support for recording is partial — hence the beta label." },
        { q: "Is there a length limit?", a: "No hard limit, but the clip records in real time — a 30-second trim takes 30 seconds. Perfect for cutting reels and stories to length." },
      ]}
    >
      <h2>Most trims are 10 seconds of work</h2>
      <p>Cutting the dead air before your hook, or the fumble at the end — that&apos;s 90% of real-world trimming. Opening a full editor (or installing one) for that is overkill. Two sliders, one button, done.</p>
      <h2>Private by design</h2>
      <p>Online trimmers usually mean uploading your raw footage to someone&apos;s server. Here the video never leaves your device — the recording happens in the browser itself, which is also why it&apos;s free without caps.</p>
    </SimpleToolLanding>
  );
}
