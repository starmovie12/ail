import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import PhotoFilters from "@/components/PhotoFilters";

export const metadata: Metadata = {
  title: "Photo Filters Online — 15 Instagram-Style Presets, Free | InstaGrab",
  description:
    "Apply 15 Instagram-style filters to any photo free: golden hour, noir, vintage, vivid and more — live thumbnail previews, full-resolution download, 100% on-device.",
  alternates: { canonical: "/photo-filters" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Photo filters"
      h1={<>Fifteen moods, one <em className="gilded">photo</em>.</>}
      lead="Upload once, preview every filter as a thumbnail strip, download the winner at full resolution."
      tool={<PhotoFilters />}
      wide
      faq={[
        { q: "Which filters are included?", a: "Golden hour, soft fade, noir, silver, vivid, warm, cool, vintage, dramatic, pastel, sunset, matte, punch and dream — the palettes behind most popular Instagram looks." },
        { q: "Does the export match the preview?", a: "Exactly — the same filter math renders the preview and the download, at your photo's original resolution." },
        { q: "Is my photo uploaded?", a: "No — filtering happens in your browser via canvas. Private photos stay private." },
      ]}
    >
      <h2>Filters without the app circus</h2>
      <p>No install, no account, no subscription unlock for &ldquo;premium looks&rdquo;. Upload, tap through the strip, download. The thumbnail strip shows your actual photo in every filter simultaneously — pick with your eyes, not filter names.</p>
      <h2>Consistency is the aesthetic</h2>
      <p>Feeds look curated when every photo shares a treatment. Pick one filter (golden hour and matte are safe bets) and run your next nine posts through it — pair with the grid planner to preview the result before posting.</p>
    </SimpleToolLanding>
  );
}
