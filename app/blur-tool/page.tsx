import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import BlurTool from "@/components/BlurTool";

export const metadata: Metadata = {
  title: "Blur / Pixelate Tool — Hide Faces & Info in Screenshots | InstaGrab",
  description:
    "Blur or pixelate parts of any image free: rub over faces, names, numbers or chats to hide them before sharing. Runs entirely in your browser — nothing is uploaded.",
  alternates: { canonical: "/blur-tool" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Blur & pixelate tool"
      h1={<>Hide what shouldn&apos;t be <em className="gilded">shared</em>.</>}
      lead="Rub over faces, usernames, numbers or chat bubbles — pixelate or blur them out, then download. All on-device."
      tool={<BlurTool />}
      wide
      faq={[
        { q: "Pixelate or blur — which is safer?", a: "Pixelate. Heavy mosaic destroys the underlying pixels irreversibly; a light blur on text can sometimes be partially reversed. For names and numbers, always use pixelate." },
        { q: "What do people censor?", a: "Faces of bystanders and kids, usernames in screenshots, phone numbers, addresses, order IDs, prices in DMs — anything you'd rather the whole internet didn't index." },
        { q: "Is the image uploaded to a server?", a: "No — the censoring happens on your device with canvas. That matters precisely because these images are the sensitive ones." },
      ]}
    >
      <h2>Screenshot first, think second — then censor here</h2>
      <p>Every &ldquo;look at this DM&rdquo; story is one un-blurred username away from drama. Before a screenshot goes to your story or the group chat, rub out what identifies people who didn&apos;t agree to be posted.</p>
      <h2>Made for finger-precision</h2>
      <p>The brush follows your finger or mouse with adjustable size — big strokes for whole faces, small ones for a single line of text. Overdid it? Reset restores the original instantly.</p>
    </SimpleToolLanding>
  );
}
