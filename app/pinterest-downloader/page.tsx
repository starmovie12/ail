import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import OgDownloader from "@/components/OgDownloader";

export const metadata: Metadata = {
  title: "Pinterest Downloader — Save Pins, Images & Videos Free | InstaGrab",
  description:
    "Download Pinterest images and videos in original quality free: paste any pin link (pinterest.com or pin.it) and save the media. No login, no watermark.",
  alternates: { canonical: "/pinterest-downloader" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Pinterest downloader"
      h1={<>Save the pin, keep the <em className="gilded">quality</em>.</>}
      lead="Paste any Pinterest link — pin pages and short pin.it links both work — and download the image or video."
      tool={<OgDownloader platform="Pinterest" hostHint={"(pinterest\\.[a-z.]+|pin\\.it)/"} placeholder="Paste a Pinterest pin link (pinterest.com or pin.it)" />}
      faq={[
        { q: "Which links work?", a: "Full pin URLs (pinterest.com/pin/…, in.pinterest.com/…) and the short pin.it share links from the app. Idea Pins with multiple pages save their primary media." },
        { q: "What quality do I get?", a: "The original file Pinterest stores — usually far larger than the compressed preview in your feed." },
        { q: "Do I need a Pinterest account?", a: "No — public pins download without any login. Private board pins are private and stay that way." },
      ]}
    >
      <h2>Pinterest saves aren&apos;t downloads</h2>
      <p>Saving to a board keeps the pin inside Pinterest — useless for your moodboard app, client presentation or print shop. This downloads the actual file, original resolution, onto your device.</p>
      <h2>Built for reference collectors</h2>
      <p>Designers, tailors, decorators and event planners live on Pinterest references. Paste, save, drop into your working folder — including the recipe and DIY videos that loop endlessly in the app.</p>
    </SimpleToolLanding>
  );
}
