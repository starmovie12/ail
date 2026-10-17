import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import CaseConverter from "@/components/CaseConverter";

export const metadata: Metadata = {
  title: "Case Converter — UPPERCASE, Title Case, Small Caps & More | InstaGrab",
  description:
    "Free text case converter for Instagram captions and bios: UPPERCASE, lowercase, Title Case, Sentence case, aLtErNaTiNg and Unicode small caps — with one-tap copy.",
  alternates: { canonical: "/case-converter" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Caption case converter"
      h1={<>Same words, different <em className="gilded">energy</em>.</>}
      lead="Type once — get your text in 7 cases at the same time, from SHOUTING to ꜱᴍᴀʟʟ ᴄᴀᴘꜱ, each one tap to copy."
      tool={<CaseConverter />}
      faq={[
        { q: "What is small caps and why does it work in bios?", a: "It's not a font — each letter is a special Unicode character (ᴀ ʙ ᴄ) that Instagram treats as normal text. That's why it survives in bios, captions and comments where real fonts can't go." },
        { q: "When should I use UPPERCASE?", a: "Sparingly and strategically — a caps HOOK LINE at the top of a caption stops the scroll, but full-caps paragraphs read as shouting and hurt readability." },
        { q: "What's alternating case for?", a: "The sPoNgEbOb MoCkInG mEmE format — sarcasm's official typeface. Use responsibly. 😄" },
      ]}
    >
      <h2>Case is tone</h2>
      <p>THE SAME SENTENCE reads completely differently in caps, Title Case or ꜱᴍᴀʟʟ ᴄᴀᴘꜱ. Caps shout, title case headlines, small caps whisper premium. This converter shows all seven at once so you can pick the energy that fits the post.</p>
      <h2>Fix pasted text in seconds</h2>
      <p>Copied a caption that arrived IN FULL CAPS or all lowercase? Sentence case rebuilds normal capitalization instantly — no manual retyping, capital by capital.</p>
      <h2>Want fancier?</h2>
      <p>Small caps is the tasteful end of styled text. For the full range — bold, cursive, bubble letters and 15+ more — head to our font generator.</p>
    </SimpleToolLanding>
  );
}
