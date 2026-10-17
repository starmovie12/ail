import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import FontGenerator from "@/components/FontGenerator";

export const metadata: Metadata = {
  title: "Instagram Fonts Generator — Stylish Bio Fonts, Copy & Paste | InstaGrab",
  description:
    "Turn any text into 15+ stylish fonts for your Instagram bio, name or captions — bold, italic, script, cursive and more. Copy with one tap. Free.",
  alternates: { canonical: "/font-generator" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Font generator"
      h1={<>Bio fonts that <em className="gilded">stand out</em>.</>}
      lead="Type your name or bio and get 15+ copy-ready stylish fonts — bold, script, cursive and more."
      tool={<FontGenerator />}
      faq={[
        { q: "How do I use these on Instagram?", a: "Type your text, tap any style to copy it, then paste it into your Instagram bio, name field or a caption. It works because these are real Unicode characters, not images." },
        { q: "Will it work everywhere?", a: "Most fonts render on modern phones. A few rare characters may show as boxes on very old devices — pick a style that looks right on your screen." },
        { q: "Is it free?", a: "Completely. It runs entirely in your browser — nothing is sent anywhere." },
      ]}
    >
      <h2>Make your bio pop</h2>
      <p>Instagram only gives you one plain font, so every profile looks the same. These <strong>Unicode font styles</strong> let your name, bio or highlight titles stand out — bold serif, elegant script, cursive, monospace and more. Type once, tap to copy, paste anywhere.</p>
      <h2>How it works</h2>
      <p>There&apos;s no trick and no app to install. Each &ldquo;font&rdquo; is a set of real Unicode characters that look like styled letters, so they paste as text into any Instagram field. Because it all runs in your browser, it&apos;s instant and private.</p>
      <h2>Where to use them</h2>
      <p>Your <strong>name field</strong> (the bold line at the top of your profile), your <strong>bio</strong>, story highlight covers, and captions. Mix a script style for your name with a clean sans for the rest to build a signature look.</p>
    </SimpleToolLanding>
  );
}
