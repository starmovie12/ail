import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import CaptionFixer from "@/components/CaptionFixer";

export const metadata: Metadata = {
  title: "Instagram Caption Line Break Generator — Fix Spacing | InstaGrab",
  description:
    "Add clean line breaks and spacing to your Instagram captions and bio. Instagram collapses blank lines — this locks them so your caption pastes perfectly. Free.",
  alternates: { canonical: "/caption-fixer" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Caption fixer"
      h1={<>Captions that keep their <em className="gilded">line breaks</em>.</>}
      lead="Instagram eats your blank lines and spacing. Write it here, copy, and it pastes exactly as you meant."
      tool={<CaptionFixer />}
      faq={[
        { q: "Why does Instagram remove my line breaks?", a: "Instagram trims trailing spaces and collapses empty lines when you post. This tool puts an invisible character on blank lines so they survive." },
        { q: "How do I use it?", a: "Write or paste your caption with the spacing you want, copy the fixed version, then paste it into the Instagram caption or bio box." },
        { q: "Will the invisible characters be visible?", a: "No — they render as blank space. Your caption looks clean and properly spaced." },
      ]}
    >
      <h2>Why captions lose their formatting</h2>
      <p>When you press <em>enter</em> for a blank line in an Instagram caption, Instagram often removes it on publish — turning your carefully spaced caption into one dense block. The fix is a tiny invisible character that Instagram won&apos;t strip.</p>
      <h2>How the fixer works</h2>
      <p>Paste your caption with the exact line breaks you want. The tool trims stray trailing spaces (a common cause of the problem) and, on each blank line, inserts an invisible <strong>Braille-blank</strong> character so the spacing holds. Copy the result and paste it straight into Instagram.</p>
      <h2>Great for creators and copywriters</h2>
      <p>Readable captions get read. Clean spacing between a hook, the body and your call-to-action makes people actually finish the caption — and a finished caption drives more saves and comments.</p>
    </SimpleToolLanding>
  );
}
