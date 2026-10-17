import type { Metadata } from "next";
import UsernameLanding from "@/components/UsernameLanding";

export const metadata: Metadata = {
  title: "Instagram Story Download Kaise Kare — स्टोरी डाउनलोडर (फ्री) | InstaGrab",
  description:
    "Instagram story download karni hai bina dekhe? Username daalo — active stories anonymously dekho aur HD mein save karo. Free, bina login — hindi mein samjhaya gaya.",
  alternates: { canonical: "/story-downloader-hindi" },
};

export default function Page() {
  return (
    <UsernameLanding
      mode="stories"
      eyebrow="स्टोरी डाउनलोडर · हिन्दी"
      h1={<>Story <em className="gilded">download</em> karo — bina seen kiye.</>}
      lead="@username daalo — uski saari active stories dikh jayengi, download button ke saath. Anonymous, free."
      placeholder="@username daalo — stories dekho aur save karo"
      faq={[
        { q: "Story download karne se saamne wale ko pata chalega?", a: "Nahi — InstaGrab se story dekhne par 'seen' register nahi hota. Aap poori tarah anonymous rehte ho." },
        { q: "Story download kaise kare?", a: "Upar wale box mein username daalo (jaise @virat.kohli) → Search dabao → saari active stories dikhengi → jo chahiye uske neeche Download button dabao. Photo JPG mein, video MP4 mein save hogi." },
        { q: "24 ghante purani story download hogi?", a: "Stories 24 ghante baad Instagram se hat jaati hain — expired story koi nahi nikal sakta. Haan, agar account ne use Highlights mein daala hai to hamara highlights downloader use nikal dega." },
        { q: "Private account ki story?", a: "Nahi — sirf public accounts. Yeh privacy ka sawal hai aur hum ispar samjhauta nahi karte." },
      ]}
    >
      <h2>Story bachao, 24 ghante ki deadline se pehle</h2>
      <p>Stories gayab hone ke liye bani hain — 24 ghante aur khatam. Koi recipe, koi discount code, koi yaadgar moment jo save karna ho, to deadline se pehle yahan se HD mein utaar lo. Username daalo, story chuno, download.</p>
      <h2>Anonymous dekhne ka faayda</h2>
      <p>Kabhi kabhi aap dekhna chahte ho par seen list mein nahi aana chahte — competitor research, purane dost, ya bas curiosity. InstaGrab se dekhi gayi story par aapka naam kabhi nahi aata.</p>
      <h2>Aur bhi bahut kuch — sab hindi-friendly</h2>
      <p>Story ke alawa reels, photos, highlights, DP — sab download hota hai. Upar se AI tools jo <strong>Hinglish mein caption aur bio</strong> likhte hain. 80+ tools, ek website, sab free.</p>
    </UsernameLanding>
  );
}
