import Nav from "./Nav";
import Footer from "./Footer";
import UsernameTool from "./UsernameTool";
import TrustLine from "./TrustLine";
import FAQ from "./FAQ";
import Reveal from "./Reveal";
import JsonLd from "./JsonLd";
import { DEFAULT_FAQ, faqJsonLd, type QA } from "@/lib/seo";

const STEPS = [
  { n: "01", t: "Enter the username", d: "Type the public account's @handle or paste their profile URL." },
  { n: "02", t: "We fetch it", d: "Server-side and anonymous — no login, no view registered." },
  { n: "03", t: "Download in HD", d: "Save exactly what you need, in the best quality available." },
];

/** Shared shell for the username-based tools: hero + @bar above the fold, SEO prose below. */
export default function UsernameLanding({
  eyebrow, h1, lead, mode, placeholder, children, faq,
}: {
  eyebrow: string;
  h1: React.ReactNode; // pass spans with .gilded on one word
  lead: string;
  mode: "dp" | "stories" | "viewer" | "highlights" | "feed";
  placeholder?: string;
  children: React.ReactNode; // SEO article prose
  faq?: QA[];
}) {
  return (
    <>
      <JsonLd data={faqJsonLd(faq ?? DEFAULT_FAQ)} />
      <Nav />
      <main>
        <section style={{ position: "relative", padding: "88px 0 64px", textAlign: "center", overflow: "hidden" }}>
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
              <UsernameTool mode={mode} placeholder={placeholder} />
            </div>
            <div className="intro-rise" style={{ marginTop: 18, ["--dl" as string]: "400ms" }}>
              <TrustLine />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section">
          <div className="container">
            <Reveal>
              <span className="label">How it works</span>
              <h2 style={{ marginTop: 12, marginBottom: 48 }}>Three steps, no account.</h2>
            </Reveal>
            <Reveal>
              <div className="drawline" style={{ height: 1, background: "var(--line-strong)", marginBottom: 32 }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
                {STEPS.map(s => (
                  <div key={s.n}>
                    <span className="mono" style={{ color: "var(--gold-ink)", fontSize: 14 }}>{s.n}</span>
                    <h3 style={{ fontSize: 19, margin: "10px 0 6px" }}>{s.t}</h3>
                    <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{s.d}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
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
