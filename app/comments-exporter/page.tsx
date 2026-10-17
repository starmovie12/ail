import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import CommentsExporter from "@/components/CommentsExporter";

export const metadata: Metadata = {
  title: "Instagram Comments Exporter — Download Comments as CSV | InstaGrab",
  description:
    "Export any public Instagram post's recent comments to CSV/Excel free — usernames, comment text and likes, one click. No login, honest limits.",
  alternates: { canonical: "/comments-exporter" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Comments exporter"
      h1={<>Comments, out of Instagram and into a <em className="gilded">spreadsheet</em>.</>}
      lead="Paste a post link — get its recent comments on screen and as a CSV that opens straight in Excel or Sheets."
      tool={<CommentsExporter />}
      faq={[
        { q: "How many comments can it export?", a: "Without login, Instagram exposes the most recent ~40-50 comments of a public post — that's what we export, and we say so honestly. Tools promising 'all comments free' either require your login (risky) or oversell." },
        { q: "What's in the CSV?", a: "Three columns: username, full comment text, and like count where available. UTF-8 encoded, so Hindi, emoji and every language open correctly in Excel." },
        { q: "What do people use this for?", a: "Giveaway record-keeping, testimonial collection, sentiment analysis, community research, and archiving reactions before a post is deleted." },
        { q: "Is this allowed?", a: "It reads only public data — the same comments anyone sees on the post. No login, no private content, nothing stored on our servers." },
      ]}
    >
      <h2>Comments are data — treat them like it</h2>
      <p>The comment section is raw customer research: objections, praise, questions, feature requests. Locked inside Instagram it&apos;s unusable; exported to a spreadsheet it becomes something you can sort, filter, count and quote.</p>
      <h2>Built for the paid-tool gap</h2>
      <p>Simpliers and CommentPicker charge for comment exports. InstaGrab does the free-tier honestly: the recent comments Instagram publicly exposes, exported cleanly, no login required — enough for testimonials, small giveaways and quick research.</p>
    </SimpleToolLanding>
  );
}
