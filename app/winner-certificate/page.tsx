import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import WinnerCertificate from "@/components/WinnerCertificate";

export const metadata: Metadata = {
  title: "Giveaway Winner Certificate Generator — Free, Verifiable | InstaGrab",
  description:
    "Create an official-looking giveaway winner certificate free: winner's name, prize, date and a unique certificate ID on a gold-framed PNG — ready for your story.",
  alternates: { canonical: "/winner-certificate" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Winner certificate"
      h1={<>Make the result <em className="gilded">official</em>.</>}
      lead="Winner's name + prize + date + a unique certificate ID, on a gold-framed PNG your story deserves."
      tool={<WinnerCertificate />}
      wide
      faq={[
        { q: "What's the certificate ID for?", a: "Each certificate gets a unique random ID stamped on the image. Post it with your result — it marks this exact draw, so a screenshot can't be quietly re-used for a different 'winner'." },
        { q: "When do I post it?", a: "Right after the draw, as a story and a comment on the giveaway post. A formal-looking result card ends the 'who won?' questions instantly." },
        { q: "Does it work with any picker?", a: "Yes — it's a standalone generator. But if you draw with our giveaway comment picker, the winner's name arrives pre-filled." },
      ]}
    >
      <h2>Results that look like results</h2>
      <p>A winner announced in a casual story text looks like an afterthought — or worse, an inside job. A gold-framed certificate with the winner&apos;s handle, the prize, the date and a unique ID looks like a process. Trust is the whole game in giveaways.</p>
      <h2>One certificate, every platform</h2>
      <p>The 1080×1080 PNG posts perfectly as a feed post, a story (with room for stickers), a WhatsApp status and a community announcement. Winners share it too — free reach for your next giveaway.</p>
    </SimpleToolLanding>
  );
}
