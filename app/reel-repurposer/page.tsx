import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import ReelRepurposer from "@/components/ReelRepurposer";

export const metadata: Metadata = {
  title: "Reel Repurposer — 1 Reel into 6 Content Pieces (AI) | InstaGrab",
  description:
    "Paste an Instagram reel and get 6 ready-to-post pieces: blog post, X thread, LinkedIn post, YouTube Shorts, WhatsApp status and newsletter snippet. Hinglish, free.",
  alternates: { canonical: "/reel-repurposer" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Reel repurposer · AI"
      h1={<>One reel → <em className="gilded">six content pieces</em>.</>}
      lead="Paste a reel — we pull its script and turn it into a blog post, X thread, LinkedIn post, Shorts, WhatsApp status and newsletter snippet."
      tool={<ReelRepurposer />}
      faq={[
        { q: "How does it work?", a: "It extracts the reel's spoken script (our transcript engine), then rewrites that idea into 6 platform-native formats — each one copy-ready." },
        { q: "Who is this for?", a: "Anyone repurposing content across platforms. A 2-hour manual job becomes 10 seconds — that's a creator's whole weekly workflow, automated." },
        { q: "Which reels work?", a: "Talking reels with actual speech. Music-only reels have no script to repurpose." },
        { q: "Can I get it in Hinglish?", a: "Yes — pick the language and every piece comes back in it." },
      ]}
    >
      <h2>Stop making content — start multiplying it</h2>
      <p>The smartest creators don&apos;t make new content for every platform; they make one thing and reshape it. This tool does the reshaping: your reel&apos;s idea, rewritten for the blog, the thread, the newsletter — automatically.</p>
      <h2>A week of content from one reel</h2>
      <p>Film once, publish everywhere. The repurposer turns a single reel into a content calendar across six channels — the highest-leverage move in the whole creator playbook.</p>
    </SimpleToolLanding>
  );
}
