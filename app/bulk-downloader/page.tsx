import type { Metadata } from "next";
import UsernameLanding from "@/components/UsernameLanding";

export const metadata: Metadata = {
  title: "Instagram Bulk Downloader — Save a Profile's Posts in One ZIP | InstaGrab",
  description:
    "Enter a public username and download its recent posts together in a single ZIP file. Fast, anonymous, no login. Great for content research and archiving.",
  alternates: { canonical: "/bulk-downloader" },
};

export default function Page() {
  return (
    <UsernameLanding
      eyebrow="Bulk downloader"
      h1={<>A profile&apos;s posts, in <em className="gilded">one ZIP</em>.</>}
      lead="Enter a public @username and grab its recent posts together — one click, one ZIP file."
      mode="feed"
      placeholder="Enter @username (e.g. natgeo)…"
      faq={[
        { q: "How many posts do I get?", a: "The account's most recent page of posts (about 12). Downloading a profile's entire history needs heavy infrastructure and isn't offered here — this covers the recent grid, which is what most research needs." },
        { q: "What's in the ZIP?", a: "The image of each recent post, named in order. Use the per-post buttons for the full post or to open it on Instagram." },
        { q: "Is it anonymous?", a: "Yes — everything is fetched server-side with no login, and the ZIP is built in your browser. Nothing is stored." },
        { q: "Public accounts only?", a: "Yes. Private profiles never expose their posts, and we don't bypass that." },
      ]}
    >
      <h2>Grab a profile&apos;s grid at once</h2>
      <p>Instead of saving posts one by one, enter a public @username, then hit <strong>Download all (ZIP)</strong> to pack the recent grid into a single file. Perfect for content research, mood boards, or archiving your own posts.</p>
      <h2>Recent posts, honestly scoped</h2>
      <p>Instagram serves one page of a profile&apos;s posts at a time (about 12). Pulling a full multi-hundred-post history reliably requires rotating proxies and heavy infrastructure — so this tool sticks to the recent grid, which covers most real needs without breaking or getting blocked.</p>
      <h2>Private and clean</h2>
      <p>Media is fetched server-side with no login, and the ZIP is assembled in your browser — no watermark, nothing stored.</p>
    </UsernameLanding>
  );
}
