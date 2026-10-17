import LegalFoot from "@/components/LegalFoot";
import GoldenBar from "./GoldenBar";
import TrustLine from "./TrustLine";
import HowItWorks from "./HowItWorks";
import FAQ from "./FAQ";
import Reveal from "./Reveal";
import JsonLd from "./JsonLd";
import { DEFAULT_FAQ, faqJsonLd, type QA } from "@/lib/seo";

/** Shared shell for the five tool landing pages: hero + bar above the fold, SEO prose below. */
export default function ToolLanding({
  eyebrow, h1, lead, children, faq,
}: {
  eyebrow: string;
  h1: React.ReactNode;      // pass spans with .gilded on one word
  lead: string;
  children: React.ReactNode; // SEO article prose
  faq?: QA[];
}) {
  return (
    <>
      <JsonLd data={faqJsonLd(faq ?? DEFAULT_FAQ)} />
      <main>
        <section style={{ position: "relative", padding: "20px 0 56px", textAlign: "center", overflow: "hidden" }}>
          <div aria-hidden="true" style={{
            position: "absolute", top: "-25%", left: "50%", transform: "translateX(-50%)",
            width: 800, height: 500, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, rgb(var(--c-violet-2-rgb) / .14), transparent 65%)",
          }} />
          <div className="container" style={{ position: "relative" }}>
            <p className="label intro-rise" style={{ color: "var(--gold-ink)" }}>{eyebrow}</p>
            <h1 className="intro-rise" style={{ margin: "20px auto 0", maxWidth: "18ch", fontSize: "var(--t-h2)", ["--dl" as string]: "100ms" }}>
              {h1}
            </h1>
            <p className="lead intro-rise" style={{ margin: "20px auto 0", ["--dl" as string]: "200ms" }}>{lead}</p>
            <div className="intro-rise" style={{ marginTop: 36, ["--dl" as string]: "300ms" }}>
              <GoldenBar />
            </div>
            <div className="intro-rise" style={{ marginTop: 18, ["--dl" as string]: "400ms" }}>
              <TrustLine />
            </div>
          </div>
        </section>

        <HowItWorks />

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <div className="article">{children}</div>
            </Reveal>
          </div>
        </section>

        <FAQ items={faq} />
      </main>
      <LegalFoot />
    </>
  );
}
