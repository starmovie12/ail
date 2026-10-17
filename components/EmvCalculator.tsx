"use client";
import { useMemo, useState } from "react";
import { Coins, Info } from "lucide-react";

/**
 * Earned Media Value — what the organic engagement on a post would have cost
 * as paid media. Per-interaction values follow published EMV index
 * methodology (Ayzenberg-style), with an India-market variant.
 */
const VALUES = {
  usd: { impression: 0.008, like: 0.10, comment: 4.0, share: 1.5, save: 2.5 },
  inr: { impression: 0.25, like: 3.0, comment: 110, share: 45, save: 70 },
};

function money(n: number, inr: boolean) {
  const v = Math.round(n);
  return inr ? "₹" + v.toLocaleString("en-IN") : "$" + v.toLocaleString("en-US");
}

export default function EmvCalculator() {
  const [impressions, setImpressions] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [saves, setSaves] = useState("");
  const [inr, setInr] = useState(true);

  const n = (s: string) => parseFloat(s.replace(/[,\s]/g, "")) || 0;
  const result = useMemo(() => {
    const v = inr ? VALUES.inr : VALUES.usd;
    const parts = [
      ["Impressions", n(impressions) * v.impression],
      ["Likes", n(likes) * v.like],
      ["Comments", n(comments) * v.comment],
      ["Shares", n(shares) * v.share],
      ["Saves", n(saves) * v.save],
    ] as [string, number][];
    const total = parts.reduce((s, [, x]) => s + x, 0);
    return total > 0 ? { parts: parts.filter(([, x]) => x > 0), total } : null;
  }, [impressions, likes, comments, shares, saves, inr]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--ink)",
  };
  const fields: [string, string, (v: string) => void][] = [
    ["Impressions / reach", impressions, setImpressions],
    ["Likes", likes, setLikes],
    ["Comments", comments, setComments],
    ["Shares", shares, setShares],
    ["Saves", saves, setSaves],
  ];

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button className={`btn ${inr ? "btn-molten" : "btn-secondary"}`} onClick={() => setInr(true)} style={{ flex: 1 }}>India ₹</button>
          <button className={`btn ${!inr ? "btn-molten" : "btn-secondary"}`} onClick={() => setInr(false)} style={{ flex: 1 }}>Global $</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {fields.map(([label, val, set]) => (
            <div key={label}>
              <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>{label}</span>
              <input value={val} onChange={(e) => set(e.target.value)} placeholder="0"
                inputMode="numeric" aria-label={label} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className="card intro-rise" style={{ padding: 24 }}>
          <div style={{ textAlign: "center", paddingBottom: 18 }}>
            <div className="mono" style={{ fontSize: 44, fontWeight: 700, color: "var(--gold-ink)", display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Coins size={34} strokeWidth={1.5} /> {money(result.total, inr)}
            </div>
            <div className="label" style={{ marginTop: 4 }}>Earned media value of this post</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.parts.map(([label, v]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px", borderBottom: "1px solid var(--line)" }}>
                <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>{label}</span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{money(v, inr)}</span>
              </div>
            ))}
          </div>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 16, lineHeight: 1.6, display: "flex", gap: 8 }}>
            <Info size={13} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 1 }} />
            EMV estimates what this organic engagement would cost as paid media, using industry per-interaction
            values. Use it in brand pitches: &ldquo;my average post generates {money(result.total, inr)} in earned media.&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
