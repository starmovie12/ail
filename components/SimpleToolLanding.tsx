import Nav from "./Nav";
import Footer from "./Footer";
import FAQ from "./FAQ";
import Reveal from "./Reveal";
import JsonLd from "./JsonLd";
import { DEFAULT_FAQ, faqJsonLd, type QA } from "@/lib/seo";

/**
 * Landing shell for tools that bring their own interactive UI (client-side
 * utilities, username tools) instead of the paste bar: hero + the tool +
 * SEO prose + FAQ. Same rhythm as ToolLanding.
 */
export default function SimpleToolLanding({
  eyebrow, h1, lead, tool, children, faq, wide = false,
}: {
  eyebrow: string;
  h1: React.ReactNode;
  lead: string;
  tool: React.ReactNode;         // the interactive tool
  children: React.ReactNode;     // SEO article prose
  faq?: QA[];
  wide?: boolean;
}) {
  return (
    <>
      <JsonLd data={faqJsonLd(faq ?? DEFAULT_FAQ)} />
      <Nav />
      <main>
        <section style={{ position: "relative", padding: "88px 0 56px", textAlign: "center", overflow: "hidden" }}>
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
            <div className="intro-rise" style={{ marginTop: 36, ["--dl" as string]: "300ms", maxWidth: wide ? 960 : 720, marginLeft: "auto", marginRight: "auto" }}>
              {tool}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 8 }}>
          <div className="container">
            <Reveal>
              <div className="article">{children}</div>
            </Reveal>
          </div>
        </section>

        <FAQ items={faq} />
      </main>
      <Footer />
    </>
  );
}
