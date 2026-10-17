import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import GoldenBar from "@/components/GoldenBar";

export const metadata: Metadata = {
  title: "Instagram Reels Download Kaise Kare — रील्स डाउनलोडर (फ्री) | InstaGrab",
  description:
    "Instagram reels download karna hai? Link paste karo, HD MP4 video + poora caption + saare hashtags ek click mein. Free, bina login, bina watermark — hindi mein samjhaya gaya.",
  alternates: { canonical: "/reels-downloader-hindi" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="रील्स डाउनलोडर · हिन्दी"
      h1={<>Instagram Reels <em className="gilded">Download</em> — 1 क्लिक में।</>}
      lead="Reel ka link paste karo — HD video, poora caption aur saare hashtags turant mil jayenge. Free, bina login."
      tool={<GoldenBar />}
      faq={[
        { q: "Instagram se reel download kaise kare?", a: "Instagram app mein reel kholo → Share (➤) button dabao → 'Copy Link' → yahan upar wale box mein paste karo → Download dabao. HD MP4 video, caption aur hashtags — sab ek saath mil jayega." },
        { q: "Kya yeh bilkul free hai?", a: "Haan — na login chahiye, na app install, na koi limit (fair-use ke andar). Watermark bhi nahi lagta." },
        { q: "Private account ki reel download hogi?", a: "Nahi — sirf public accounts ki reels download hoti hain. Private content private hi rehta hai, aur jo tool ulta dawa kare woh jhooth bol raha hai." },
        { q: "Kya reel download karna legal hai?", a: "Public content apne personal use (study, archive) ke liye save karna theek hai. Kisi aur ki reel bina permission ke dobara upload karna copyright violation ho sakta hai — repost karna ho to credit do aur permission lo." },
        { q: "Video ke saath caption bhi milega?", a: "Haan — yahi InstaGrab ki khaas baat hai. Video ke saath poora caption (copy button ke saath) aur har hashtag alag chip mein milta hai." },
      ]}
    >
      <h2>Reel download karne ka sabse aasan tarika</h2>
      <p>Instagram app mein download button sirf apni reels ke liye hai, aur woh bhi watermark ke saath. InstaGrab par tarika seedha hai: <strong>link copy karo → paste karo → download</strong>. HD quality, bina watermark, aur caption + hashtags bonus mein.</p>
      <h2>Sirf video nahi, poora post</h2>
      <p>Doosre downloader sirf MP4 dete hain. Creators ke liye asli value caption mein hoti hai — hook, structure, CTA aur hashtag strategy. InstaGrab dono deta hai: file bhi, text bhi. Isliye yeh sirf downloader nahi, poori creator toolkit hai — 80+ tools, sab free.</p>
      <h2>Phone ho ya laptop — sab jagah chalta hai</h2>
      <p>Koi app install nahi karni. Browser mein kholo, chahe Android ho, iPhone ya computer. Roz use karte ho to PWA install kar lo — home screen se ek tap mein khulega.</p>
    </SimpleToolLanding>
  );
}
