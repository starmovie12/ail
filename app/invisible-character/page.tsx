import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import InvisibleChar from "@/components/InvisibleChar";

export const metadata: Metadata = {
  title: "Invisible Character for Instagram — Blank Name & Line Breaks | InstaGrab",
  description:
    "Copy invisible characters (Braille blank, zero-width space and more) for blank Instagram names, clean line breaks and spacing tricks. One-tap copy, free.",
  alternates: { canonical: "/invisible-character" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Invisible character tool"
      h1={<>Characters you can&apos;t see, <em className="gilded">tricks you can</em>.</>}
      lead="Blank names, clean caption spacing, hidden separators — copy the right invisible Unicode character in one tap."
      tool={<InvisibleChar />}
      faq={[
        { q: "How do I make my Instagram name blank?", a: "Copy the 'blank name preset' above, open Edit Profile, paste it into the Name field and save. The username itself can't be blank — only the display name." },
        { q: "Which character survives Instagram captions?", a: "The Braille blank (U+2800) is the reliable one — Instagram doesn't strip it, so blank lines built with it keep your caption spacing intact." },
        { q: "What's a zero-width space for?", a: "It's invisible AND takes no width. Slip it inside a long word to control where it can break, or use it to make text that looks identical but differs technically." },
        { q: "Are invisible characters against the rules?", a: "No — they're standard Unicode used across the web. Just use them for formatting, not for impersonating other accounts." },
      ]}
    >
      <h2>Why normal spaces fail on Instagram</h2>
      <p>Instagram trims trailing spaces and collapses empty lines when you publish — that&apos;s why your carefully spaced caption arrives as one dense block. Invisible Unicode characters occupy a line without looking like anything, so the spacing survives.</p>
      <h2>Each character has a job</h2>
      <p>The <strong>Braille blank</strong> holds blank lines in captions and makes names invisible. The <strong>zero-width space</strong> hides inside words. The wide spaces (en, ideographic) create gaps Instagram won&apos;t collapse. Copy the one that matches your trick.</p>
      <h2>The automatic version</h2>
      <p>If all you want is clean caption line breaks, skip the manual work — our caption fixer inserts the right invisible characters on every blank line automatically.</p>
    </SimpleToolLanding>
  );
}
