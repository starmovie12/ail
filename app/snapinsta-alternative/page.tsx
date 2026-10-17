import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import GoldenBar from "@/components/GoldenBar";

export const metadata: Metadata = {
  title: "SnapInsta Alternative — InstaGrab (Free, No Ads Maze) | InstaGrab",
  description:
    "Looking for a SnapInsta alternative? InstaGrab downloads reels, photos and stories in HD — plus captions, hashtags, 80+ creator tools and Hinglish AI. Free, no login.",
  alternates: { canonical: "/snapinsta-alternative" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="SnapInsta alternative"
      h1={<>Everything SnapInsta does — <em className="gilded">plus 80 tools it doesn&apos;t</em>.</>}
      lead="Same one-paste downloads, none of the ad maze — and a full creator toolkit SnapInsta never built. Try it right here:"
      tool={<GoldenBar />}
      faq={[
        { q: "Is InstaGrab really a full SnapInsta replacement?", a: "Yes — reels, videos, photos, carousels, stories, highlights and profile pictures in HD, from one paste bar. Everything SnapInsta downloads, InstaGrab downloads." },
        { q: "What does InstaGrab have that SnapInsta doesn't?", a: "The whole creator workflow: caption + hashtag extraction with every download, Creator Pack ZIP, reel transcripts, AI caption/bio/script generators in Hinglish, engagement calculators, giveaway tools, an image studio — 80+ tools, all free." },
        { q: "What about the ads?", a: "No fake download buttons, no popup chains, no redirect roulette. Clean ad frames that never sit between you and your file." },
        { q: "Do I need an account?", a: "Never — no login, no app install, and links are processed in memory without being stored." },
      ]}
    >
      <h2>Where SnapInsta stops, InstaGrab starts</h2>
      <p>SnapInsta does one thing: it hands you a file. InstaGrab hands you the file <strong>plus the caption, every hashtag and the mentions</strong> — because a downloader for creators should understand what creators actually do with a post after saving it.</p>
      <h2>The 80-tool difference</h2>
      <p>After the download, the workflow continues: transcribe the reel, remix its formula for your niche, generate a Hinglish caption, check the best time to post, pick a giveaway winner. On SnapInsta each of those means finding another website; here it&apos;s the same paste bar.</p>
      <h2>Switching costs nothing</h2>
      <p>There&apos;s no account to migrate and nothing to learn — paste the same link into the bar above and see the difference on your first download. Bookmark it (or install the PWA) and the whole toolkit lives one tap away.</p>
    </SimpleToolLanding>
  );
}
