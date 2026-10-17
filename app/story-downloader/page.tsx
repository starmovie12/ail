import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";

export const metadata: Metadata = {
  title: "Instagram Story Downloader — Save Before They Vanish | InstaGrab",
  description: "Save public Instagram stories as video or photo before they disappear at 24 hours. Anonymous — no login, no view notification.",
  alternates: {
    canonical: "/story-downloader",
  },
};

export default function Page() {
  return (
    <ToolLanding
      eyebrow="Story downloader"
      h1={<>Story downloader — saved <em className="gilded">before they vanish</em>.</>}
      lead="Public stories disappear in 24 hours. Save them as video or photo, anonymously."
      faq={[
        { q: "Will they know I viewed their story?", a: "No. InstaGrab fetches stories server-side without your account, so no view is registered against your name." },
        { q: "Why does it say the story expired?", a: "Stories live for exactly 24 hours. Once gone, no downloader can retrieve them." },
        { q: "Can I save private-account stories?", a: "No — public accounts only. Private stays private." },
      ]}
    >
      <h2>How to save a story</h2>
      <p>Open the profile, tap the story, then copy the story link (share icon → Copy link) and paste it above. Videos save as MP4, photos as full-resolution JPG.</p>
      <h2>Anonymous by design</h2>
      <p>Because we fetch the story without any Instagram account, <strong>no view notification</strong> is ever sent. The uploader&apos;s view list never shows you.</p>
      <h2>The 24-hour rule</h2>
      <p>Stories expire exactly 24 hours after posting. If you get an &ldquo;expired&rdquo; message, the content is genuinely gone from Instagram&apos;s servers — save early.</p>
    </ToolLanding>
  );
}
