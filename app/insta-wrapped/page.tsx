import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import WrappedTool from "@/components/WrappedTool";

export const metadata: Metadata = {
  title: "Insta Wrapped — Your Instagram Year in Review (Free) | InstaGrab",
  description:
    "Spotify-Wrapped for Instagram. Enter any @username → get a shareable card with followers, top post, engagement, posting personality and a fun title. Free, no login.",
  alternates: { canonical: "/insta-wrapped" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Insta Wrapped"
      h1={<>Your Instagram <em className="gilded">year in review</em>.</>}
      lead="Spotify Wrapped, but for Instagram. Enter a username and get a share-worthy card — your stats, top post and posting personality."
      tool={<WrappedTool />}
      faq={[
        { q: "What's on the Wrapped card?", a: "Your followers, posts, average likes and comments, engagement rate, posting vibe (night owl vs daylight), your top-performing post, and a fun AI-generated 'posting personality' title." },
        { q: "Is it really like Spotify Wrapped?", a: "Same idea — a beautiful, shareable summary people love to post. That's exactly why Wrapped goes viral every December; now Instagram has its own." },
        { q: "Does it work on any account?", a: "Any public account. Enter your own or a friend's @username." },
        { q: "Is my data stored?", a: "No — it's built live from public posts and nothing is saved." },
      ]}
    >
      <h2>The most shared format on the internet, for Instagram</h2>
      <p>Every year Spotify Wrapped takes over feeds because people love seeing — and sharing — a summary of their own year. Insta Wrapped brings that exact feeling to Instagram: one tap, one gorgeous card, endless shares. It&apos;s built to be posted to your story.</p>
      <h2>Come back every season</h2>
      <p>Run it monthly to watch your personality and numbers evolve. A ritual users return to — and share every single time — is the strongest growth loop there is.</p>
    </SimpleToolLanding>
  );
}
