import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import HistoryList from "@/components/HistoryList";

export const metadata: Metadata = {
  title: "Download History — Private, On-Device | InstaGrab",
  description:
    "Your InstaGrab download history — stored only in your browser, visible only to you. Pick up where you left off, reopen original posts, clear anytime.",
  alternates: { canonical: "/history" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Download history"
      h1={<>Continue where you <em className="gilded">left off</em>.</>}
      lead="Everything you've downloaded here, with thumbnails — private, on this device only, never on our servers."
      tool={<HistoryList />}
      wide
      faq={[
        { q: "Who can see my history?", a: "Only you, only on this device. It lives in your browser's localStorage — our servers store nothing, which you can verify: log out, switch browsers, and it's gone." },
        { q: "Why do some thumbnails stop loading?", a: "Instagram's CDN links expire after a while. The history entry stays (tap it to reopen the original post), only the preview image dies." },
        { q: "How do I clear it?", a: "The 'Clear history' button wipes everything instantly. Clearing your browser data does the same." },
      ]}
    >
      <h2>Memory without surveillance</h2>
      <p>&ldquo;Which reel was that again?&rdquo; — history answers it without us knowing anything about you. The list is written by your own browser, on your own device, and can be wiped in one tap. That&apos;s the whole design.</p>
      <h2>A quiet superpower for repost workflows</h2>
      <p>Curation accounts download in batches and post on schedule. History keeps the queue visible — what you grabbed, when, from whom — with one-tap links back to the source for credits.</p>
    </SimpleToolLanding>
  );
}
