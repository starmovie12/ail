import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ShadowbanLab from "@/components/ShadowbanLab";

export const metadata: Metadata = {
  title: "Shadowban Lab — Honest Instagram Reach Checker | InstaGrab",
  description:
    "Check any public account for shadowban signals — engagement drop, risky hashtags, reach health — with an honest, no-hype report of what you can actually fix. Free.",
  alternates: { canonical: "/shadowban-lab" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Shadowban Lab"
      h1={<>Are you <em className="gilded">shadowbanned?</em></>}
      lead="An honest reach check. We read your public engagement patterns and recent hashtags, then flag the real, fixable signals — no scare tactics."
      tool={<ShadowbanLab />}
      faq={[
        { q: "Can any tool detect a shadowban for sure?", a: "No — and any tool that claims a definitive yes/no is lying, because Instagram never confirms shadowbans. What we can do is check the honest, observable signals: engagement drop, risky hashtags and reach health." },
        { q: "What does it check?", a: "Your engagement rate, whether recent posts dropped sharply versus earlier ones, whether your recent captions use banned or restricted hashtags, and your comment-to-like ratio — each explained plainly." },
        { q: "What do I do with the result?", a: "Fix the flags. Remove risky hashtags, vary your content, and give it a couple of weeks — the report tells you exactly which lever to pull." },
        { q: "Does it work on any account?", a: "Any public account with a few recent posts. Nothing is stored." },
      ]}
    >
      <h2>Honesty is the whole product</h2>
      <p>The internet is full of &ldquo;shadowban testers&rdquo; that fabricate a scary verdict to farm clicks. Shadowban Lab does the opposite: it tells you the truth — that no one can be 100% certain — and then shows you the signals you <em>can</em> check and fix yourself.</p>
      <h2>Fix what actually moves reach</h2>
      <p>Most reach problems aren&apos;t a mysterious ban — they&apos;re a restricted hashtag, a content change, or a natural dip. The lab separates the fixable from the imagined so you stop guessing and start posting with confidence.</p>
    </SimpleToolLanding>
  );
}
