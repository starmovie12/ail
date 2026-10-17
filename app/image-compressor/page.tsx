import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ImageCompressor from "@/components/ImageCompressor";

export const metadata: Metadata = {
  title: "Image Compressor — Shrink Photos Without Visible Loss | InstaGrab",
  description:
    "Compress images in your browser free: quality slider, live before/after size comparison, instant download. 100% on-device — photos are never uploaded.",
  alternates: { canonical: "/image-compressor" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Image compressor"
      h1={<>Smaller files, <em className="gilded">same look</em>.</>}
      lead="Drag the quality slider, watch the size drop live, download when happy. Your photo never leaves this device."
      tool={<ImageCompressor />}
      wide
      faq={[
        { q: "What quality setting should I use?", a: "80% is the sweet spot — visually identical to the original for most photos at a fraction of the size. Go 60-70% for web pages where speed matters more than pixel-peeping." },
        { q: "Why compress before posting to Instagram?", a: "Giant camera files upload slowly on mobile data and Instagram re-compresses them anyway — often worse than you would. Feeding it a clean, reasonably-sized JPG gives better final quality." },
        { q: "Is there a file size limit?", a: "No hard limit — big camera files are also scaled to 2400px on the long side, which is more than any social platform displays." },
        { q: "Are my images uploaded to your server?", a: "No — compression runs on your device via the browser's canvas API. This page works even offline once loaded." },
      ]}
    >
      <h2>See the trade-off before you commit</h2>
      <p>Compression is a bargain between size and quality — the only way to strike it well is to watch both change live. The slider shows the compressed size and preview instantly, so you stop at exactly the point where your eyes notice nothing but your file is 5× lighter.</p>
      <h2>Why smaller files win on social</h2>
      <p>Faster uploads on mobile data, faster WhatsApp sends to clients, faster web pages if you run a portfolio — and Instagram&apos;s own compressor behaves better when it isn&apos;t handed a 12MB monster.</p>
      <h2>On-device, always</h2>
      <p>Like every InstaGrab studio tool, the compressor runs entirely in your browser. No upload queue, no privacy question, no server ever sees your photo.</p>
    </SimpleToolLanding>
  );
}
