"use client";
import { useMemo, useState } from "react";
import { BadgeDollarSign, IndianRupee, Info } from "lucide-react";

type Niche = { id: string; label: string; rate: number }; // USD per 1K followers, per post
const NICHES: Niche[] = [
  { id: "fashion", label: "Fashion & Beauty", rate: 13 },
  { id: "fitness", label: "Fitness & Health", rate: 11 },
  { id: "tech", label: "Tech & Gadgets", rate: 15 },
  { id: "finance", label: "Finance & Business", rate: 20 },
  { id: "food", label: "Food & Cooking", rate: 10 },
  { id: "travel", label: "Travel", rate: 12 },
  { id: "gaming", label: "Gaming", rate: 10 },
  { id: "entertainment", label: "Entertainment & Memes", rate: 8 },
  { id: "education", label: "Education", rate: 10 },
  { id: "lifestyle", label: "Lifestyle / Other", rate: 10 },
];

const USD_TO_INR = 86;
// Indian domestic brand budgets run well below US CPMs.
const INDIA_MARKET_FACTOR = 0.45;

function money(n: number, inr: boolean): string {
  const v = Math.max(0, Math.round(n));
  if (inr) return "₹" + v.toLocaleString("en-IN");
  return "$" + v.toLocaleString("en-US");
}

export default function MoneyCalculator() {
  const [followers, setFollowers] = useState("");
  const [er, setEr] = useState("");
  const [niche, setNiche] = useState("lifestyle");
  const [inr, setInr] = useState(true);

  const result = useMemo(() => {
    const f = parseFloat(followers.replace(/[,\s]/g, ""));
    const e = parseFloat(er);
    if (!isFinite(f) || f <= 0) return null;
    const nicheRate = NICHES.find((n) => n.id === niche)?.rate ?? 10;
    // Engagement multiplier vs a 2% benchmark, clamped so outliers stay sane.
    const erFactor = isFinite(e) && e > 0 ? Math.min(2.5, Math.max(0.4, e / 2)) : 1;
    const baseUsd = (f / 1000) * nicheRate * erFactor;
    const factor = inr ? USD_TO_INR * INDIA_MARKET_FACTOR : 1;
    const post = baseUsd * factor;
    return {
      postLow: post * 0.75,
      postHigh: post * 1.4,
      story: post * 0.4,
      reel: post * 1.25,
      // What you should quote a brand: post rate + usage/exclusivity margin.
      quote: post * 1.15,
    };
  }, [followers, er, niche, inr]);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div>
            <span className="label" style={{ display: "block", marginBottom: 8 }}>Followers</span>
            <input value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="e.g. 25000"
              inputMode="numeric" aria-label="Follower count" style={inputStyle} />
          </div>
          <div>
            <span className="label" style={{ display: "block", marginBottom: 8 }}>Engagement rate %</span>
            <input value={er} onChange={(e) => setEr(e.target.value)} placeholder="e.g. 3.5 (optional)"
              inputMode="decimal" aria-label="Engagement rate percent" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div>
            <span className="label" style={{ display: "block", marginBottom: 8 }}>Niche</span>
            <select value={niche} onChange={(e) => setNiche(e.target.value)} aria-label="Content niche" style={{ ...inputStyle, appearance: "auto" as const }}>
              {NICHES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
          <div>
            <span className="label" style={{ display: "block", marginBottom: 8 }}>Market</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`btn ${inr ? "btn-molten" : "btn-secondary"}`} onClick={() => setInr(true)} style={{ flex: 1 }}>
                <IndianRupee size={15} strokeWidth={1.75} /> India ₹
              </button>
              <button className={`btn ${!inr ? "btn-molten" : "btn-secondary"}`} onClick={() => setInr(false)} style={{ flex: 1 }}>
                <BadgeDollarSign size={15} strokeWidth={1.75} /> Global $
              </button>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="card intro-rise" style={{ padding: 24 }}>
          <div style={{ textAlign: "center", paddingBottom: 20 }}>
            <div className="label" style={{ marginBottom: 6 }}>Estimated earnings per sponsored post</div>
            <div className="mono" style={{ fontSize: 40, fontWeight: 700, color: "var(--gold-ink)" }}>
              {money(result.postLow, inr)} – {money(result.postHigh, inr)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {([
              ["Per story", result.story],
              ["Per reel", result.reel],
              ["Quote brands this", result.quote],
            ] as [string, number][]).map(([k, v]) => (
              <div key={k} className="well" style={{ padding: 14, textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{money(v, inr)}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 18, lineHeight: 1.6, display: "flex", gap: 8 }}>
            <Info size={13} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 1 }} />
            Estimates from industry rate cards ({inr ? "Indian domestic brand budgets" : "US/global CPMs"}), scaled by niche and engagement.
            Real deals vary with content quality, audience location and exclusivity — treat this as a starting point for negotiation, not a promise.
          </p>
        </div>
      )}
    </div>
  );
}
