import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ProfileRoaster from "@/components/ProfileRoaster";

export const metadata: Metadata = {
  title: "AI Instagram Profile Roaster — Get Roasted (Funny, Free) | InstaGrab",
  description:
    "Enter any public Instagram username and let AI roast the profile — funny, PG-13 and shareable, in Hinglish, Hindi or English. The perfect group-chat weapon. Free.",
  alternates: { canonical: "/profile-roaster" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="AI profile roaster"
      h1={<>Get your profile <em className="gilded">roasted</em>. 🔥</>}
      lead="Drop a @username — the AI reads the bio and stats, then serves a roast worthy of the group chat. Hinglish default, obviously."
      tool={<ProfileRoaster />}
      faq={[
        { q: "Is the roast mean?", a: "Playful, not cruel. The AI is instructed to stay PG-13, never body-shame, never touch religion or politics — and it always ends with a genuine compliment. Roast, not harassment." },
        { q: "What does it roast?", a: "Whatever the public profile exposes: the bio, follower-to-following ratio, post count, engagement rate. Empty bios and 2,000-following accounts are easy targets — you've been warned." },
        { q: "Can I roast my friends?", a: "That's the whole point. Copy the roast and drop it in the group chat — the copy button formats it ready to send." },
        { q: "Does the person know?", a: "No — we only read public data, nothing is sent to them and nothing is stored." },
      ]}
    >
      <h2>The group chat just found its new weapon</h2>
      <p>Paste a friend&apos;s handle, pick your language, and receive a roast built from their actual profile — the &ldquo;dreamer ✨ hustler 💪&rdquo; bio, the 1,847 accounts they follow, the engagement rate they&apos;d rather not discuss. Screenshot, send, chaos.</p>
      <h2>Hinglish roasts hit different</h2>
      <p>A roast in stiff English is a review; a roast in Hinglish is <em>personal</em>. This is the only roaster on the internet that does desi-style humour natively — with Hindi and English available when you need them.</p>
      <h2>All love at the end</h2>
      <p>Every roast closes with a &ldquo;But real talk —&rdquo; line: one genuine compliment. Because the best roasts come from a place of love, and because we&apos;d like your friends to still be your friends.</p>
    </SimpleToolLanding>
  );
}
