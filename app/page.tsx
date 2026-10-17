import type { Metadata } from "next";
import HowToButton from "@/components/HowToButton";
import HeroBanner from "@/components/HeroBanner";
import SmartLinkBox from "@/components/SmartLinkBox";
import HomeToolsGrid from "@/components/HomeToolsGrid";
import TrustFootBar from "@/components/TrustFootBar";
import { ToolsAutoSupported } from "@/components/PlatformIcons";
import JsonLd from "@/components/JsonLd";
import { TOOL_COUNT } from "@/lib/registry";
import { webAppJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "InstaGrab — Instagram Reels, Story, Caption & Hashtag Downloader",
  description:
    "Free Instagram downloader for reels, photos, stories and carousels in HD — plus the full caption and every hashtag. No login. Links never stored.",
  alternates: { canonical: "/" },
};

/**
 * Home (PRD §7) — sirf: Header → Banner → Smart Link Box → How to Download → Tools & Platforms.
 * Header + Bottom Nav AppShell se. Uske baad kuch nahi (na footer, na FAQ, na ad, na result).
 * Banner + neon card ka design jaisa tha waisa (count ab registry se: A9).
 */
export default function Home() {
  return (
    <>
      <JsonLd data={webAppJsonLd()} />
      <main>
        <section style={{ position: "relative", padding: "0 0 clamp(20px, 4vw, 32px)", overflow: "hidden" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 900, maxWidth: "100%", height: 600,
              pointerEvents: "none", background: "radial-gradient(ellipse at center, rgb(var(--c-violet-2-rgb) / .16), transparent 65%)",
            }}
          />
          <div className="container" style={{ position: "relative", maxWidth: 800 }}>
            <div style={{ paddingTop: "clamp(10px, 2vw, 16px)" }}>
              <HeroBanner />
            </div>
            <div style={{ marginTop: "clamp(10px, 6px + 1vw, 16px)" }}>
              <SmartLinkBox footer={<><ToolsAutoSupported count={TOOL_COUNT} href="/tools" /><TrustFootBar /></>} />
            </div>
            <HowToButton />
            <HomeToolsGrid />
          </div>
        </section>
      </main>
    </>
  );
}
