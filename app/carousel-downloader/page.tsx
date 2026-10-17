import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";

export const metadata: Metadata = {
  title: "Instagram Carousel Downloader — Save All Slides at Once | InstaGrab",
  description:
    "Download every slide of an Instagram carousel post — photos and videos — in HD. Each slide gets its own download. Free, no login, plus caption + hashtags.",
  alternates: { canonical: "/carousel-downloader" },
};

export default function Page() {
  return (
    <ToolLanding
      eyebrow="Carousel downloader"
      h1={<>Carousel downloader — all ten slides, <em className="gilded">complete</em>.</>}
      lead="Every photo and video in a multi-slide post, each with its own HD download."
      faq={[
        { q: "Can I download all slides at once?", a: "Each slide has its own button so you choose exactly what to save — photos and videos alike." },
        { q: "Do videos inside the carousel work too?", a: "Yes — mixed photo/video carousels are fully supported." },
        { q: "What about the caption and hashtags?", a: "They're extracted once for the whole post, with copy buttons — as with every InstaGrab tool." },
        { q: "Is there a slide limit?", a: "No — every slide in the carousel is returned." },
      ]}
    >
      <h2>How to download a carousel</h2>
      <p>On the multi-slide post, tap <strong>••• → Copy link</strong>, paste it in the bar above and press Download. Every slide appears in a strip — download each one, or grab the ones you need.</p>
      <h2>Photos and videos together</h2>
      <p>Carousels often mix formats. InstaGrab returns each slide in its original format — photos as full-resolution JPG, videos as HD MP4 with audio — so nothing is lost or re-compressed.</p>
      <h2>The text comes too</h2>
      <p>The complete caption, every hashtag and any @mentions are extracted once for the whole post, ready to copy — useful when you&apos;re archiving or reposting with credit.</p>
    </ToolLanding>
  );
}
