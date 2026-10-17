import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import AltTextTool from "@/components/AltTextTool";

export const metadata: Metadata = {
  title: "AI Alt Text Generator for Instagram — Free Image Descriptions | InstaGrab",
  description:
    "Upload a photo and get 3 AI-written alt text options — concise, descriptive and keyword-rich — for Instagram accessibility and SEO reach. Free, image never stored.",
  alternates: { canonical: "/ai-alt-text" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="AI alt text generator"
      h1={<>Alt text that works for <em className="gilded">everyone</em>.</>}
      lead="Upload your photo — the AI writes 3 alt text options: concise, descriptive, and keyword-rich for reach."
      tool={<AltTextTool />}
      faq={[
        { q: "What is alt text and why bother?", a: "Alt text describes your image for screen-reader users — and Instagram also uses it to understand what your photo shows, which feeds Explore and search ranking. Accessibility and reach, one field." },
        { q: "Where do I paste it on Instagram?", a: "When creating a post: Advanced settings → Accessibility → Write alt text. You can also add it to old posts via Edit." },
        { q: "Is my photo stored?", a: "No — it's resized on your device, sent once for the AI to look at, and never saved. We keep nothing." },
        { q: "Which of the 3 options should I use?", a: "Descriptive is the best default. Use keyword-rich when the post targets search terms (recipes, products, how-tos), concise for simple visuals." },
      ]}
    >
      <h2>The most ignored field on Instagram</h2>
      <p>Almost nobody fills in alt text — which means the accounts that do get an edge twice: their content is usable by millions of screen-reader users, and Instagram&apos;s systems understand their images better when ranking Explore and search.</p>
      <h2>Three styles, because context differs</h2>
      <p>A meme needs a quick description; a product shot wants searchable keywords; a photo essay deserves a full sentence. The generator writes all three from one upload — pick per post.</p>
    </SimpleToolLanding>
  );
}
