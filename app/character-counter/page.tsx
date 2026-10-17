import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import CharCounter from "@/components/CharCounter";

export const metadata: Metadata = {
  title: "Instagram Character Counter — Caption, Bio & Hashtag Limits | InstaGrab",
  description:
    "Live character counter for Instagram: caption (2,200), bio (150), username (30) and the 30-hashtag limit — with a “… more” fold preview. Free, no login.",
  alternates: { canonical: "/character-counter" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Character counter"
      h1={<>Every Instagram limit, <em className="gilded">counted live</em>.</>}
      lead="Captions, bios, usernames and comments — see exactly how much room you have left, including the “… more” fold."
      tool={<CharCounter />}
      faq={[
        { q: "What are Instagram's character limits?", a: "Caption: 2,200 characters. Bio: 150. Username: 30. Comments: 2,200. Hashtags: max 30 per post. This counter tracks all of them live." },
        { q: "What is the “… more” fold?", a: "In the feed, Instagram shows only the first ~125 characters of a caption before collapsing it behind “… more”. Your hook must land inside that window — the counter warns you when you cross it." },
        { q: "Do emojis count as one character?", a: "Visually yes, and this counter counts them the way Instagram does — one emoji = one character, even complex ones that are technically multiple code units." },
        { q: "Do line breaks count in the bio?", a: "Yes — every line break eats one character of your 150. Write tight." },
      ]}
    >
      <h2>Why 125 characters matter more than 2,200</h2>
      <p>You <em>can</em> write 2,200 characters, but only the first ~125 show in the feed before <strong>“… more”</strong>. That&apos;s your headline. This counter shows a live warning the moment your hook crosses the fold, so the part that sells the tap never gets buried.</p>
      <h2>Bios are a 150-character pitch</h2>
      <p>Who you are, what you post, why to follow — in 150 characters including line breaks. Switch to Bio mode and the counter enforces the real limit while you draft.</p>
      <h2>Count hashtags before Instagram silently drops them</h2>
      <p>Post with more than 30 tags and Instagram can drop your caption entirely. The counter tracks your hashtag count live — and our hashtag counter &amp; cleaner tool dedupes and trims the set for you.</p>
    </SimpleToolLanding>
  );
}
