import Reveal from "./Reveal";

const STEPS = [
  { n: "01", t: "Paste the link", d: "Any public reel, post, carousel or story URL." },
  { n: "02", t: "We fetch it", d: "Media, caption, hashtags and mentions — together." },
  { n: "03", t: "Download & copy", d: "Pick a quality, copy the text. Done." },
];

export default function HowItWorks() {
  return (
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
  );
}
