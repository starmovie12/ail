import type { Metadata } from "next";
import UsernameLanding from "@/components/UsernameLanding";

export const metadata: Metadata = {
  title: "Instagram Profile Picture Downloader — Full HD DP | InstaGrab",
  description:
    "View and download any public Instagram profile picture (DP) in full HD. Enter a username, get the full-size photo instantly. Free, no login.",
  alternates: { canonical: "/profile-picture-downloader" },
};

export default function Page() {
  return (
    <UsernameLanding
      eyebrow="Profile picture downloader"
      h1={<>Profile pictures — the <em className="gilded">full-size</em> original.</>}
      lead="Instagram shrinks profile photos to a tiny circle. Enter any public username to view and download the HD original."
      mode="dp"
      placeholder="Enter @username (e.g. cristiano)…"
      faq={[
        { q: "What size is the downloaded picture?", a: "The full HD original Instagram stores (typically 320–1080px), not the tiny circle shown in the app." },
        { q: "Does it work for private accounts?", a: "Profile pictures of private accounts may be limited. Public accounts always work in full HD." },
        { q: "Will the person be notified?", a: "No. There's no login and no interaction with their account — it's completely private." },
        { q: "Can I zoom into someone's DP?", a: "Yes — downloading the HD version lets you see the full picture clearly, not the cropped thumbnail." },
      ]}
    >
      <h2>How to download a profile picture in HD</h2>
      <p>Type the public account&apos;s <strong>@handle</strong> (or paste their profile URL) in the bar above and press Search. InstaGrab fetches the full-resolution profile picture along with the account&apos;s basic stats, and gives you a one-click HD download.</p>
      <h2>Why the app can&apos;t do this</h2>
      <p>Instagram only ever shows the profile photo as a small circle — there&apos;s no built-in way to open it full-size. We request the original file Instagram stores, so you get the photo at its true resolution.</p>
      <h2>Anonymous by design</h2>
      <p>No login, no follow, no view — the account owner is never notified. We don&apos;t store usernames or any history.</p>
    </UsernameLanding>
  );
}
