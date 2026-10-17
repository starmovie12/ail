import type { Metadata } from "next";
import UsernameLanding from "@/components/UsernameLanding";

export const metadata: Metadata = {
  title: "Instagram Profile Viewer — Bio, Stats & Posts Anonymously | InstaGrab",
  description:
    "View any public Instagram profile anonymously — HD profile picture, bio, follower stats and a grid of recent posts, reels and carousels. No login, no trace.",
  alternates: { canonical: "/profile-viewer" },
};

export default function Page() {
  return (
    <UsernameLanding
      eyebrow="Profile viewer"
      h1={<>See any profile — <em className="gilded">A to Z</em>, anonymously.</>}
      lead="HD photo, bio, follower stats and every recent post — from any public account, without logging in."
      mode="feed"
      placeholder="Enter @username (e.g. natgeo)…"
      faq={[
        { q: "What can I see?", a: "The HD profile picture, full bio, follower/following/post counts, and a grid of the account's recent posts, reels and carousels — with like and comment counts." },
        { q: "Is it anonymous?", a: "Yes. Everything is fetched server-side without any Instagram login, so the account owner is never notified and no view is registered." },
        { q: "Does it work on private accounts?", a: "No — public accounts only. Private profiles never expose their posts, and we won't pretend otherwise." },
        { q: "Can I download the posts I see?", a: "Yes — each post has a download button for its image, and an open button to view the full post. For every quality of a specific post, paste its link into the reels or photo downloader." },
      ]}
    >
      <h2>What the profile viewer shows</h2>
      <p>Type any public account&apos;s <strong>@handle</strong> and press Search. InstaGrab pulls the same public profile data Instagram&apos;s own website loads — the full-size profile picture, the complete bio, the follower, following and post counts, and a grid of recent posts with their like and comment numbers.</p>
      <h2>How it works (the honest version)</h2>
      <p>There&apos;s no secret hack: the profile viewer calls Instagram&apos;s public web endpoint — the exact one that fills the page when you open a profile in a browser — and lays the result out cleanly. It&apos;s all public information; we simply present it in one place and let you download what you need.</p>
      <h2>Anonymous by design</h2>
      <p>Because the lookup happens on our server with no account attached, <strong>no view is ever registered</strong> and the profile owner is never notified. We don&apos;t store usernames or browsing history.</p>
      <h2>Public accounts only</h2>
      <p>Private profiles keep their posts hidden from everyone who doesn&apos;t follow them, and that stays true here — the viewer works only on public accounts, and returns a clear message for private ones.</p>
    </UsernameLanding>
  );
}
