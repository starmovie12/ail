import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import HashtagCounter from "@/components/HashtagCounter";

export const metadata: Metadata = {
  title: "Instagram Hashtag Counter & Cleaner — Dedupe + 30-Tag Limit | InstaGrab",
  description:
    "Count your Instagram hashtags, remove duplicates, drop banned tags and trim to the 30-tag limit in one click. Free hashtag cleaner, no login.",
  alternates: { canonical: "/hashtag-counter" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Hashtag counter & cleaner"
      h1={<>Thirty tags. <em className="gilded">Zero wasted.</em></>}
      lead="Paste your hashtag list — we count it, dedupe it, drop risky tags and hand back a clean set that fits Instagram's limit."
      tool={<HashtagCounter />}
      faq={[
        { q: "How many hashtags does Instagram allow?", a: "30 per post (feed and reels) and 10 per story. Go over on a post and Instagram may refuse the caption or silently drop it." },
        { q: "What does the cleaner remove?", a: "Exact duplicates (same tag twice never helps), tags on the known banned/restricted list, and anything past the 30-tag limit. What's left is copy-ready." },
        { q: "Do duplicate hashtags help reach?", a: "No — Instagram indexes a tag once. A duplicate is purely a wasted slot that could have been a fresh, relevant tag." },
        { q: "How is this different from the banned hashtag checker?", a: "The banned checker focuses on flagging risky tags in depth. This tool is the full laundering pass: count, dedupe, drop banned, trim to 30, copy." },
      ]}
    >
      <h2>The 30-tag limit is a hard wall</h2>
      <p>Instagram allows at most <strong>30 hashtags per post</strong>. Pasting your usual mega-list without checking means either an error at publish time or silently dropped tags. This tool counts the <em>unique</em> tags — because duplicates never counted anyway.</p>
      <h2>Duplicates and banned tags are wasted slots</h2>
      <p>Every duplicate and every banned tag occupies a slot that a working tag could have used. The cleaner strips both automatically and shows you exactly what it removed and why, so your final 30 all pull their weight.</p>
      <h2>Copy a set that just works</h2>
      <p>The cleaned set is one click to copy and safe to paste straight into your caption or first comment. Build the list once, clean it here, reuse it forever.</p>
    </SimpleToolLanding>
  );
}
