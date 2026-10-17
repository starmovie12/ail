import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";

export const metadata: Metadata = {
  title: "Instagram Reel Audio Downloader — Save the Sound as MP3/M4A | InstaGrab",
  description:
    "Download the trending audio from any public Instagram reel on its own — the music/sound as an M4A file, no video. Free, no login, no watermark.",
  alternates: { canonical: "/audio-downloader" },
};

export default function Page() {
  return (
    <ToolLanding
      eyebrow="Audio downloader"
      h1={<>Reel audio — just the <em className="gilded">sound</em>.</>}
      lead="Rip the trending music or voiceover from any public reel as an audio file — no video attached."
      faq={[
        { q: "What format is the audio?", a: "Instagram serves the track as M4A (AAC) — the same file the app streams. It plays everywhere and imports cleanly into editors." },
        { q: "Why is there no audio button on some reels?", a: "A separate audio track only exists when Instagram ships a DASH manifest for that video. Older posts or photos won't have one — you can still grab the full video." },
        { q: "Can I use the sound in my own reel?", a: "Only use audio you have the rights to. Trending sounds are often licensed to Instagram — reuse responsibly and credit the creator." },
        { q: "Is it free?", a: "Yes — free, no login, no watermark." },
      ]}
    >
      <h2>How to download a reel's audio</h2>
      <p>Open the reel in Instagram, tap <strong>Share → Copy link</strong>, paste it in the bar above and press Download. When Instagram exposes a separate audio track, an <strong>Audio</strong> button appears alongside the video qualities — that&apos;s the sound on its own, ready to save.</p>
      <h2>Why a separate audio download</h2>
      <p>Creators constantly need the <strong>trending sound</strong> from a reel to reuse in their own edits, and podcasters or students want the voiceover without a heavy video file. Instead of downloading the full MP4 and stripping the audio in an editor, InstaGrab hands you the audio track directly — no re-encoding, no quality loss.</p>
      <h2>No transcoding, no watermark</h2>
      <p>The file comes straight from Instagram&apos;s CDN exactly as uploaded. We don&apos;t re-compress it or add anything — you get the original audio.</p>
    </ToolLanding>
  );
}
