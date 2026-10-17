import type { Metadata } from "next";
import QuietPage from "@/components/QuietPage";

export const metadata: Metadata = { title: "About — InstaGrab" };

export default function Page() {
  return (
    <QuietPage title="About InstaGrab">
      <p>InstaGrab is a small, fast tool for saving public Instagram content — reels, photos, stories and carousels — together with the text that belongs to it: the caption, the hashtags, the mentions.</p>
      <p>It exists because every other downloader treats the text as an afterthought. If you're a creator, marketer or archivist, the caption is often the part you actually need.</p>
      <h2>Principles</h2>
      <p><strong>No login, ever.</strong> We will never ask for your Instagram credentials.<br /><strong>Nothing stored.</strong> Links are processed in memory and discarded.<br /><strong>Public content only.</strong> Private accounts stay private.</p>
      <p>InstaGrab is not affiliated with Instagram™ or Meta.</p>
    </QuietPage>
  );
}
