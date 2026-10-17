import type { Metadata } from "next";
import UsernameLanding from "@/components/UsernameLanding";

export const metadata: Metadata = {
  title: "Anonymous Instagram Story Viewer — No Trace, No Login | InstaGrab",
  description:
    "Watch public Instagram stories anonymously — no login, no trace, the account owner never knows. View and optionally download in HD. Free.",
  alternates: { canonical: "/story-viewer" },
};

export default function Page() {
  return (
    <UsernameLanding
      eyebrow="Anonymous story viewer"
      h1={<>Watch stories — <em className="gilded">without being seen</em>.</>}
      lead="View public stories without leaving a trace. No login, no view registered — ever."
      mode="viewer"
      placeholder="Enter @username to view stories…"
      faq={[
        { q: "Is it really anonymous?", a: "Yes. Because you never log in, viewing here never registers as a story view on the owner's account." },
        { q: "Does it work for private accounts?", a: "No — only public accounts. Private stories are protected by Instagram." },
        { q: "Can I download the stories I view?", a: "Yes — each story has an HD download button alongside the preview." },
        { q: "Do you keep any record of what I viewed?", a: "No. We don't store usernames, links, or any browsing history." },
      ]}
    >
      <h2>How anonymous viewing works</h2>
      <p>Enter the public account&apos;s <strong>@handle</strong> and press View. InstaGrab fetches the active stories server-side, without any Instagram account — so no view is ever registered against your name, and you never appear in the uploader&apos;s view list.</p>
      <h2>Watch, then save if you like</h2>
      <p>Each story plays right here — videos with sound, photos in full resolution. Every story also has an HD download button, so you can keep anything worth keeping before it expires.</p>
      <h2>The 24-hour rule</h2>
      <p>Stories vanish exactly 24 hours after posting. If an account shows no active stories, there&apos;s simply nothing live right now — check back later.</p>
    </UsernameLanding>
  );
}
