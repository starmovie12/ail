import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import VoiceCloner from "@/components/VoiceCloner";

export const metadata: Metadata = {
  title: "Caption Voice Cloner — Write in Any Creator's Style (AI) | InstaGrab",
  description:
    "AI learns any public creator's caption style — tone, emojis, structure — then writes YOUR caption in that exact voice. The only style-transfer caption tool. Free.",
  alternates: { canonical: "/voice-cloner" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Voice cloner · AI"
      h1={<>Write in <em className="gilded">anyone&apos;s</em> caption style.</>}
      lead="Point the AI at a creator whose captions you love — it learns their voice and writes yours in the exact same style."
      tool={<VoiceCloner />}
      faq={[
        { q: "How does it learn a voice?", a: "It reads the account's recent public captions and picks up the patterns — tone, emoji habits, sentence length, how they open and close, hashtag style — then writes fresh captions on your topic in that voice." },
        { q: "Is this copying?", a: "No — it learns a STYLE and writes original content on your topic. Copying someone's actual captions word-for-word would be stealing; matching a writing style is what every writer does." },
        { q: "Which accounts work best?", a: "Ones that actually write captions (not just emojis) — the more text, the better the voice match." },
        { q: "Does it exist anywhere else?", a: "Not that we've found — style-transfer captioning is genuinely new. That's the whole point." },
      ]}
    >
      <h2>Study the greats, sound like yourself</h2>
      <p>Every niche has that one creator whose captions just <em>hit</em>. Now you can learn exactly what makes them work — and apply it to your own content, on your own topics. It&apos;s the fastest caption-writing lesson there is.</p>
      <h2>A voice library for your workflow</h2>
      <p>Save the handles whose style you like and generate in their voice before every post. Same tool, endless voices — a genuinely new way to level up your captions.</p>
    </SimpleToolLanding>
  );
}
