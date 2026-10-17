import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import InstaGuess from "@/components/InstaGuess";

export const metadata: Metadata = {
  title: "InstaGuess — Daily Blurred DP Guessing Game | InstaGrab",
  description:
    "Guess the celebrity from their blurred Instagram profile picture. A new mystery every day, build your streak — the daily Instagram game. Free, no login.",
  alternates: { canonical: "/insta-guess" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="InstaGuess · Daily game"
      h1={<>Guess the <em className="gilded">blurred DP</em>.</>}
      lead="A new blurred celebrity profile picture every day. Pick the right name, build your streak, come back tomorrow for the next one."
      tool={<InstaGuess />}
      faq={[
        { q: "How do I play?", a: "Look at today's blurred Instagram DP and pick who it belongs to from four options. Get it right to keep your streak alive — a fresh puzzle drops every day." },
        { q: "What's a streak?", a: "The number of days in a row you've guessed correctly, saved on your device. Miss a day or guess wrong and it resets — just like Wordle." },
        { q: "Where do the photos come from?", a: "Public profile pictures of well-known accounts, blurred so you have to really look. Guess right and it un-blurs." },
        { q: "Is there a new one every day?", a: "Yes — the mystery changes daily, so there's always a reason to come back." },
      ]}
    >
      <h2>The daily habit Instagram never had</h2>
      <p>Wordle proved it: one clever puzzle a day builds a habit millions return to. InstaGuess is that daily ritual for Instagram lovers — a ten-second game, a streak to protect, and a new face every morning.</p>
      <h2>Built to be shared</h2>
      <p>Beat your streak and share the result — no spoilers, just a nudge for friends to try today&apos;s puzzle. Daily play plus friendly bragging is a growth loop that runs itself.</p>
    </SimpleToolLanding>
  );
}
