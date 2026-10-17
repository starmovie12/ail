import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import KundliTool from "@/components/KundliTool";

export const metadata: Metadata = {
  title: "Insta Kundli — AI Instagram Horoscope & Compatibility | InstaGrab",
  description:
    "Enter any Instagram @username and get a fun AI 'Insta Kundli' — your posting rashi, this week's bhavishya, lucky hashtag, plus couple compatibility %. Hinglish, free.",
  alternates: { canonical: "/insta-kundli" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Insta Kundli · AI"
      h1={<>Tumhari Instagram <em className="gilded">Kundli</em> 🪔</>}
      lead="Username daalo — AI banayega tumhari Insta-Rashi, is hafte ka bhavishya aur lucky hashtag. Do usernames? Compatibility % check karo!"
      tool={<KundliTool />}
      faq={[
        { q: "Yeh kaam kaise karta hai?", a: "AI public profile ka posting pattern, bio aur stats padh kar ek mazedaar 'kundli' banata hai — bilkul entertainment ke liye, koi asli jyotish nahi." },
        { q: "Compatibility check kya hai?", a: "Do usernames daalo → AI dono ke Instagram vibe ki compatibility % nikalta hai, couples aur doston ke liye. WhatsApp group mein aag lag jayegi. 😄" },
        { q: "Kya yeh private accounts par chalega?", a: "Nahi — sirf public accounts. Aur kuch store nahi hota." },
        { q: "Hinglish mein aata hai?", a: "Haan — Hinglish default hai, Hindi aur English bhi available hain." },
      ]}
    >
      <h2>Instagram + astrology + India = viral</h2>
      <p>Kundli aur rashifal humesse se India ka favourite hai. Isse Instagram ke saath jodo — ek mazedaar, share-worthy card jo aapke posting behaviour ko ek &ldquo;Insta-Rashi&rdquo; deta hai. Sirf masti, par ruk nahi paoge share kiye bina.</p>
      <h2>Couple compatibility — dosti ka asli test</h2>
      <p>Do handles daalo aur dekho aapki Instagram compatibility kitni % hai. Crush, best friend, ya competitor — sabke saath check karo. Har dost ke saath dobara khelne aaoge — yahi iska retention hook hai.</p>
    </SimpleToolLanding>
  );
}
