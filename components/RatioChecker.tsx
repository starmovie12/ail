"use client";
import { useMemo, useState } from "react";
import { Scale, CheckCircle2, AlertCircle } from "lucide-react";

function verdictFor(ratio: number) {
  if (ratio >= 10) return { label: "Authority account", tone: "ok" as const, note: "You're followed far more than you follow — classic creator/brand shape. Brands and new visitors read this as credibility." };
  if (ratio >= 2) return { label: "Healthy creator", tone: "ok" as const, note: "A solid follower surplus. Keep growing content-first and this ratio compounds." };
  if (ratio >= 1) return { label: "Balanced", tone: "ok" as const, note: "Roughly even. Normal for personal accounts; growing creators should aim to tip this above 2× over time." };
  if (ratio >= 0.5) return { label: "Follow-heavy", tone: "warn" as const, note: "You follow more than follow you. Fine for a personal account — but if you're building a brand, it can read as follow-for-follow growth." };
  return { label: "Very follow-heavy", tone: "warn" as const, note: "Following far exceeds followers — the classic follow-unfollow footprint. Consider unfollowing inactive accounts gradually and letting content drive growth." };
}

export default function RatioChecker() {
  const [followers, setFollowers] = useState("");
  const [following, setFollowing] = useState("");
  const [avgLikes, setAvgLikes] = useState("");

  const n = (s: string) => parseFloat(s.replace(/[,\s]/g, "")) || 0;
  const result = useMemo(() => {
    const f = n(followers), g = n(following), l = n(avgLikes);
    if (!f || !g) return null;
    const ratio = f / g;
    const likeRatio = l > 0 ? (l / f) * 100 : null;
    return { ratio, verdict: verdictFor(ratio), likeRatio };
  }, [followers, following, avgLikes]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {([["Followers", followers, setFollowers, "e.g. 8400"],
          ["Following", following, setFollowing, "e.g. 950"],
          ["Avg likes (optional)", avgLikes, setAvgLikes, "e.g. 320"]] as [string, string, (v: string) => void, string][]).map(([label, val, set, ph]) => (
          <div key={label}>
            <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>{label}</span>
            <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
              inputMode="numeric" aria-label={label} style={inputStyle} />
          </div>
        ))}
      </div>

      {result && (
        <div className="card intro-rise" style={{ padding: 24 }}>
          <div style={{ textAlign: "center", paddingBottom: 18 }}>
            <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: result.verdict.tone === "ok" ? "var(--ok)" : "var(--warn)", display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Scale size={36} strokeWidth={1.5} /> {result.ratio.toFixed(2)}×
            </div>
            <div className="label" style={{ marginTop: 4 }}>Follower-to-following ratio · {result.verdict.label}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: result.verdict.tone === "ok" ? "var(--ok)" : "var(--warn)", flexShrink: 0, marginTop: 2 }}>
              {result.verdict.tone === "ok" ? <CheckCircle2 size={16} strokeWidth={1.75} /> : <AlertCircle size={16} strokeWidth={1.75} />}
            </span>
            <span style={{ fontSize: "var(--t-small)", color: "var(--ink-2)" }}>{result.verdict.note}</span>
          </div>
          {result.likeRatio !== null && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 10 }}>
              <span style={{ color: result.likeRatio >= 2 ? "var(--ok)" : "var(--warn)", flexShrink: 0, marginTop: 2 }}>
                {result.likeRatio >= 2 ? <CheckCircle2 size={16} strokeWidth={1.75} /> : <AlertCircle size={16} strokeWidth={1.75} />}
              </span>
              <span style={{ fontSize: "var(--t-small)", color: "var(--ink-2)" }}>
                Likes-to-followers: {result.likeRatio.toFixed(1)}% — {result.likeRatio >= 4 ? "excellent; your audience is genuinely active." : result.likeRatio >= 2 ? "healthy; most accounts sit between 2–5%." : "below the 2% floor; inactive or low-quality followers may be diluting your reach."}
              </span>
            </div>
          )}
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 16, lineHeight: 1.6 }}>
            Benchmarks vary by account type — personal accounts naturally run lower ratios than creators and brands.
          </p>
        </div>
      )}
    </div>
  );
}
