import type { Metadata } from "next";
import UsernameLanding from "@/components/UsernameLanding";

export const metadata: Metadata = {
  title: "Instagram Profile Picture Zoom — View Any DP in Full HD | InstaGrab",
  description:
    "Zoom any Instagram profile picture to full size free — see the HD original instead of the tiny circle, and download it if you want. No login, anonymous.",
  alternates: { canonical: "/profile-pic-zoom" },
};

export default function Page() {
  return (
    <UsernameLanding
      mode="dp"
      eyebrow="Profile pic zoom"
      h1={<>See the DP <em className="gilded">full size</em>, not the circle.</>}
      lead="Enter any @username — we fetch the profile picture's HD original so you can actually see it (and save it)."
      placeholder="Enter @username to zoom their DP"
      faq={[
        { q: "Why can't I zoom DPs in the app?", a: "Instagram deliberately locks profile pictures to a small circle — there's no pinch-to-zoom. But the HD original exists on their servers; this tool simply shows it to you." },
        { q: "Does the person know I viewed it?", a: "No — viewing and downloading a profile picture leaves no trace and sends no notification." },
        { q: "What resolution do I get?", a: "The largest version Instagram stores — typically 320×320 to 1080×1080 depending on what the account uploaded." },
        { q: "How is this different from the DP downloader?", a: "Same engine, zoom-first presentation — this page is for when you want to LOOK at the full-size picture; the downloader page is optimized for saving it. Both do both." },
      ]}
    >
      <h2>The tiny circle, decoded</h2>
      <p>Is that a mutual friend in their DP? What does that background text say? Instagram&apos;s micro-circle answers nothing. Full-size view answers everything — anonymously, in one search.</p>
      <h2>Instazoom, the honest version</h2>
      <p>DP-zoom sites are traditionally ad-minefields with fake download buttons. Same capability here, zero traps: type a username, see the HD original, save it if you need it. Nothing stored, nobody notified.</p>
    </UsernameLanding>
  );
}
