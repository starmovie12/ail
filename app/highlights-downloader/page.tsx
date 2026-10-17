import type { Metadata } from "next";
import UsernameLanding from "@/components/UsernameLanding";

export const metadata: Metadata = {
  title: "Instagram Highlights Downloader — Covers & Stories | InstaGrab",
  description:
    "Download Instagram story highlights from any public profile — save highlight covers and the stories inside them in HD. Free, no login, username-based.",
  alternates: { canonical: "/highlights-downloader" },
};

export default function Page() {
  return (
    <UsernameLanding
      eyebrow="Highlights downloader"
      h1={<>Highlights — whole collections, <em className="gilded">saved</em>.</>}
      lead="Covers plus the stories inside each highlight album, from any public profile."
      mode="highlights"
      placeholder="Enter @username (e.g. natgeo)…"
      faq={[
        { q: "What exactly can I save?", a: "Both the highlight cover images and the individual stories inside each highlight album — in HD." },
        { q: "Why use a username instead of a link?", a: "Highlights live on the profile, not on a single post. A username lets us list the full collection at once." },
        { q: "Does it work for private accounts?", a: "No — only public profiles with publicly visible highlights." },
        { q: "Why are some highlights empty?", a: "If an album's stories aren't publicly accessible, only the cover will be available." },
      ]}
    >
      <h2>How to download highlights</h2>
      <p>Enter the public account&apos;s <strong>@handle</strong> and press Search. Every highlight album loads with its cover image — save any cover directly, or tap <strong>Load stories</strong> to list and download the clips inside.</p>
      <h2>Why save highlights separately</h2>
      <p>Highlights are the stories an account chose to keep — tutorials, menus, portfolios, event recaps. Saving them gives you an offline archive of exactly the content the creator considered worth pinning.</p>
      <h2>Tip: paste a highlight link too</h2>
      <p>Got a direct <code>instagram.com/stories/highlights/…</code> link? Paste it into the bar on the home page — it works there as well.</p>
    </UsernameLanding>
  );
}
