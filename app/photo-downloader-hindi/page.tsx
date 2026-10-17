import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import GoldenBar from "@/components/GoldenBar";

export const metadata: Metadata = {
  title: "Instagram Photo Download Kaise Kare — फोटो डाउनलोडर (HD, फ्री) | InstaGrab",
  description:
    "Instagram se photo download karni hai full HD mein? Post ka link paste karo — original quality photo, carousel ki saari slides, caption ke saath. Free, bina login.",
  alternates: { canonical: "/photo-downloader-hindi" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="फोटो डाउनलोडर · हिन्दी"
      h1={<>Instagram Photo <em className="gilded">HD mein</em> download karo.</>}
      lead="Post ka link paste karo — original quality photo milegi, screenshot se kahin behtar. Carousel ki saari slides bhi."
      tool={<GoldenBar />}
      faq={[
        { q: "Instagram se photo kaise download kare?", a: "Post kholo → Share (➤) → Copy Link → yahan paste karo → Download. Original resolution wali photo save hogi — woh compressed version nahi jo screenshot mein aata hai." },
        { q: "Screenshot se kya fark hai?", a: "Bahut bada. Screenshot aapki screen ki resolution par hota hai, UI ke saath aur compressed. Yahan se aapko Instagram ke server wali original HD file milti hai — print karne layak quality." },
        { q: "Carousel (multiple photos) download hoga?", a: "Haan — saari slides ek saath dikhti hain, har ek ka apna download button. 10 slides ho to 10 downloads." },
        { q: "Kya yeh free hai?", a: "Poori tarah — na login, na watermark, na limit. Photo ke saath caption aur hashtags bhi copy kar sakte ho." },
      ]}
    >
      <h2>Screenshot chhodo, original lo</h2>
      <p>Instagram photo par zoom karo, screenshot lo — result: dhundhli, kati hui, UI ke buttons ke saath. InstaGrab seedha Instagram ke server se <strong>original HD file</strong> nikalta hai. Wallpaper banao, print karo, edit karo — quality poori milegi.</p>
      <h2>Carousel ka poora album, ek baar mein</h2>
      <p>10-slide wali post mein se sirf 5th photo chahiye? Link paste karo — saari slides thumbnail mein dikhengi, jo chahiye download karo. Poore album ka ZIP chahiye to Creator Pack button hai.</p>
      <h2>Apni photos ka backup bhi</h2>
      <p>Kai log apni hi purani posts ki original files kho chuke hote hain. Apne public account ki photos yahan se full quality mein wapas utaar lo — bulk downloader se poori profile ek ZIP mein.</p>
    </SimpleToolLanding>
  );
}
