import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import GhostFeed from "@/components/GhostFeed";

export const metadata: Metadata = {
  title: "Ghost Feed — See Which Accounts Stopped Posting | InstaGrab",
  description:
    "Add the accounts you follow and see who's gone quiet. Ranks everyone by days since their last post — the ghosts rise to the top. Anonymous, on-device, free.",
  alternates: { canonical: "/ghost-feed" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Ghost Feed"
      h1={<>Who stopped <em className="gilded">posting?</em> 👻</>}
      lead="Add the accounts you care about and see who's gone quiet — ranked by how long since their last post, ghosts on top."
      tool={<GhostFeed />}
      faq={[
        { q: "What does it show?", a: "For each account on your list, how many days since their last public post — then it ranks them from most active to most ghost, so you instantly see who fell off." },
        { q: "How is this useful?", a: "Feeds don't tell you who quietly stopped posting — you just slowly forget them. Ghost Feed surfaces it, so you can re-engage the ones you miss or unfollow the truly dead accounts." },
        { q: "Is it anonymous?", a: "Completely — reading public post dates never notifies anyone. Your list lives only in this browser." },
        { q: "Does it share the watchlist with other tools?", a: "Yes — it uses the same on-device list as Story Watch Mode, so accounts you add in one show up in the other." },
      ]}
    >
      <h2>The feed only shows who&apos;s loud</h2>
      <p>Instagram surfaces active accounts and buries the quiet ones — so creators who stop posting simply vanish from your attention. Ghost Feed flips that: it&apos;s a roll-call of everyone you follow, ordered by silence, so nobody disappears without you noticing.</p>
      <h2>A weekly check-in worth returning for</h2>
      <p>Run it every week to catch who&apos;s slowing down and who&apos;s back. It turns a vague feeling — &ldquo;haven&apos;t seen them in a while&rdquo; — into a clear, scannable list.</p>
    </SimpleToolLanding>
  );
}
