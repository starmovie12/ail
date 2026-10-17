"use client";
import { useMemo, useState } from "react";
import { Flame, CheckCircle2, AlertCircle } from "lucide-react";

type Tip = { tone: "ok" | "warn"; text: string };

function compute(views: number, likes: number, comments: number, shares: number, followers: number) {
  if (!views || !followers) return null;
  const likeRate = (likes / views) * 100;        // healthy ≥ 5%
  const commentRate = (comments / views) * 100;  // healthy ≥ 0.3%
  const shareRate = (shares / views) * 100;      // healthy ≥ 0.5% — the virality signal
  const reachMult = views / followers;           // >1 = escaped your followers

  let score = 0;
  score += Math.min(30, likeRate * 5);
  score += Math.min(20, commentRate * 40);
  score += Math.min(25, shareRate * 30);
  score += Math.min(25, reachMult * 8);
  score = Math.round(Math.min(100, score));

  const tips: Tip[] = [];
  tips.push(reachMult >= 2
    ? { tone: "ok", text: `Reached ${reachMult.toFixed(1)}× your followers — the algorithm pushed it beyond your audience.` }
    : reachMult >= 1
      ? { tone: "ok", text: `Reached ${reachMult.toFixed(1)}× your followers — it escaped your bubble, just.` }
      : { tone: "warn", text: `Views are only ${(reachMult * 100).toFixed(0)}% of your followers — the hook likely lost people in the first 2 seconds. Test stronger opening lines.` });
  tips.push(likeRate >= 5
    ? { tone: "ok", text: `Like rate ${likeRate.toFixed(1)}% — viewers who watched, approved.` }
    : { tone: "warn", text: `Like rate ${likeRate.toFixed(1)}% (healthy is 5%+) — the content held attention but didn't hit emotionally. Sharper payoff or relatability helps.` });
  tips.push(shareRate >= 0.5
    ? { tone: "ok", text: `Share rate ${shareRate.toFixed(2)}% — shares are THE virality signal. This format deserves a repeat.` }
    : { tone: "warn", text: `Share rate ${shareRate.toFixed(2)}% — people liked it but didn't send it. "Tag someone who…" angles and save-worthy value raise shares.` });
  tips.push(commentRate >= 0.3
    ? { tone: "ok", text: `Comment rate ${commentRate.toFixed(2)}% — real conversation happening.` }
    : { tone: "warn", text: `Few comments — end with a question or a mild hot-take to spark replies.` });

  const verdict = score >= 80 ? "Viral DNA 🔥" : score >= 60 ? "Strong performer" : score >= 40 ? "Decent, improvable" : "Needs a rework";
  return { score, verdict, tips };
}

export default function ViralityScore() {
  const [views, setViews] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [followers, setFollowers] = useState("");

  const n = (s: string) => parseFloat(s.replace(/[,\s]/g, "")) || 0;
  const result = useMemo(
    () => compute(n(views), n(likes), n(comments), n(shares), n(followers)),
    [views, likes, comments, shares, followers] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--ink)",
  };
  const fields: [string, string, (v: string) => void, string][] = [
    ["Views / plays", views, setViews, "e.g. 45000"],
    ["Likes", likes, setLikes, "e.g. 3200"],
    ["Comments", comments, setComments, "e.g. 85"],
    ["Shares / sends", shares, setShares, "e.g. 210"],
    ["Your followers", followers, setFollowers, "e.g. 12000"],
  ];
  const color = result && result.score >= 60 ? "var(--ok)" : result && result.score >= 40 ? "var(--warn)" : "var(--err)";

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {fields.map(([label, val, set, ph]) => (
          <div key={label}>
            <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>{label}</span>
            <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
              inputMode="numeric" aria-label={label} style={inputStyle} />
          </div>
        ))}
      </div>
      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
        Find these numbers on your reel: tap the ··· menu → Insights (Professional accounts).
      </p>

      {result && (
        <div className="card intro-rise" style={{ padding: 24 }}>
          <div style={{ textAlign: "center", paddingBottom: 18 }}>
            <div className="mono" style={{ fontSize: 52, fontWeight: 700, color, display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Flame size={40} strokeWidth={1.5} /> {result.score}
            </div>
            <div className="label" style={{ marginTop: 4 }}>Virality score · {result.verdict}</div>
            <div aria-hidden="true" style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--line)", marginTop: 14, overflow: "hidden", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
              <div style={{ width: `${result.score}%`, height: "100%", background: color, borderRadius: 99, transition: "width 600ms var(--ease-silk)" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: tip.tone === "ok" ? "var(--ok)" : "var(--warn)", flexShrink: 0, marginTop: 2 }}>
                  {tip.tone === "ok" ? <CheckCircle2 size={16} strokeWidth={1.75} /> : <AlertCircle size={16} strokeWidth={1.75} />}
                </span>
                <span style={{ fontSize: "var(--t-small)", color: "var(--ink-2)" }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
