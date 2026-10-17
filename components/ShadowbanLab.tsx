"use client";
import { useState } from "react";
import { AtSign, Radar, AlertTriangle, ShieldCheck, ShieldAlert, ShieldX, CheckCircle2, XCircle } from "lucide-react";
import { isBannedHashtag } from "@/lib/banned-hashtags";

type Signal = { ok: boolean; label: string; detail: string };
type Report = {
  username: string;
  verdict: "clear" | "watch" | "risk";
  score: number;          // 0-100 reach-health
  erPct: number;
  signals: Signal[];
};

type FeedPost = { caption: string; likes: number; comments: number; takenAt: number; isPinned?: boolean };

function analyse(j: { username: string; followers: number; postsList: FeedPost[] }): Report {
  const posts = (j.postsList ?? []).filter((p) => !p.isPinned).sort((a, b) => b.takenAt - a.takenAt);
  const eng = (p: FeedPost) => p.likes + p.comments;
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const followers = j.followers || 0;
  const overallEng = avg(posts.map(eng));
  const erPct = followers > 0 ? (overallEng / followers) * 100 : 0;

  const signals: Signal[] = [];

  // 1) Engagement rate health
  if (followers > 0) {
    const good = erPct >= 1;
    signals.push({
      ok: good,
      label: good ? "Engagement rate looks healthy" : "Engagement rate is low",
      detail: `${erPct.toFixed(2)}% (likes + comments ÷ followers). Under ~1% can mean throttled reach — but small and very large accounts naturally sit lower.`,
    });
  }

  // 2) Recent vs older drop
  if (posts.length >= 6) {
    const recent = avg(posts.slice(0, 3).map(eng));
    const older = avg(posts.slice(3, 9).map(eng));
    const drop = older > 0 ? (1 - recent / older) * 100 : 0;
    const bad = drop >= 45;
    signals.push({
      ok: !bad,
      label: bad ? `Recent posts down ~${Math.round(drop)}% vs earlier` : "No sudden engagement cliff",
      detail: bad
        ? "A sharp, sustained drop across your latest posts is the clearest self-checkable shadowban signal. Compare with any change in what/when you posted."
        : "Your latest posts are performing in line with the ones before them — a good sign.",
    });
  } else {
    signals.push({ ok: true, label: "Not enough recent posts to spot a trend", detail: "We need ~6 public posts to compare recent vs older reach. Post a few more and re-check." });
  }

  // 3) Risky hashtags in recent captions
  const tags = new Set<string>();
  for (const p of posts.slice(0, 6)) for (const m of p.caption.match(/#[\p{L}\p{N}_]+/gu) ?? []) if (isBannedHashtag(m)) tags.add(m.toLowerCase());
  const risky = [...tags];
  signals.push({
    ok: risky.length === 0,
    label: risky.length ? `${risky.length} risky hashtag${risky.length > 1 ? "s" : ""} found in recent posts` : "No banned/risky hashtags spotted",
    detail: risky.length
      ? `Even one restricted tag can hide a whole post from Explore: ${risky.slice(0, 6).join(", ")}. Remove them and use our Banned Hashtag Checker before posting.`
      : "Your recent captions don't use hashtags widely documented as banned or restricted.",
  });

  // 4) Comment ratio (bot-suppression heuristic)
  const totalLikes = posts.reduce((a, p) => a + p.likes, 0);
  const totalComments = posts.reduce((a, p) => a + p.comments, 0);
  if (totalLikes > 0 && posts.length >= 3) {
    const ratio = totalComments / totalLikes;
    const healthy = ratio >= 0.004;
    signals.push({
      ok: healthy,
      label: healthy ? "Comment-to-like ratio looks natural" : "Very few comments for the likes",
      detail: healthy
        ? "A normal share of comments suggests real, reachable engagement."
        : "Almost no comments relative to likes can hint at suppressed distribution — but it can also just be your content style.",
    });
  }

  const fails = signals.filter((s) => !s.ok).length;
  const score = Math.max(0, Math.round(100 - (fails / Math.max(1, signals.length)) * 100));
  const verdict: Report["verdict"] = fails === 0 ? "clear" : fails <= 1 ? "watch" : "risk";
  return { username: j.username, verdict, score, erPct, signals };
}

const VERDICT = {
  clear: { icon: ShieldCheck, color: "var(--gold-ink)", title: "No strong signs of a shadowban", sub: "Your reach signals look healthy. Keep it up." },
  watch: { icon: ShieldAlert, color: "var(--warn)", title: "One thing worth watching", sub: "Not a shadowban, but fix the flag below to protect your reach." },
  risk: { icon: ShieldX, color: "var(--err)", title: "Possible reach issues detected", sub: "Multiple signals are off — work through the flags below." },
} as const;

export default function ShadowbanLab() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!username.trim()) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    setLoading(true); setError(null); setReport(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "feed", username: username.trim() }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.username) { setError(j?.error ?? "Couldn't analyse that account — try again."); return; }
      if (!j.postsList?.length) { setError("No public posts found to analyse."); return; }
      setReport(analyse(j));
    } catch {
      setError("Network error — please try again.");
    } finally { setLoading(false); }
  }

  const V = report ? VERDICT[report.verdict] : null;

  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar sbbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <AtSign size={20} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
        <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="@username — check for shadowban signals" aria-label="Username"
          autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={loading}
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }} />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Radar size={18} strokeWidth={1.5} /> <span>{loading ? "Scanning…" : "Run lab"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <AlertTriangle size={20} strokeWidth={1.5} style={{ color: "var(--err)", flexShrink: 0 }} />
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {report && V && (
        <div className="card intro-rise" style={{ padding: 0, overflow: "hidden", borderColor: report.verdict === "clear" ? "var(--gold-300)" : "var(--line)" }}>
          <div style={{ padding: 22, display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--line)" }}>
            <span className="medallion" style={{ width: 52, height: 52, color: V.color }}><V.icon size={26} strokeWidth={1.5} /></span>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 17, color: V.color }}>{V.title}</b>
              <p style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 3 }}>@{report.username} · {V.sub}</p>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: V.color, lineHeight: 1 }}>{report.score}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 3 }}>REACH /100</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 1, background: "var(--line)" }}>
            {report.signals.map((s, i) => (
              <div key={i} style={{ background: "var(--surface)", padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
                {s.ok ? <CheckCircle2 size={18} strokeWidth={1.75} style={{ color: "var(--gold-ink)", flexShrink: 0, marginTop: 1 }} />
                       : <XCircle size={18} strokeWidth={1.75} style={{ color: "var(--err)", flexShrink: 0, marginTop: 1 }} />}
                <div>
                  <b style={{ fontSize: 14, color: "var(--ink)" }}>{s.label}</b>
                  <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.6 }}>{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        An honest heuristic, not an official test — Instagram never confirms shadowbans. We read public engagement patterns and recent hashtags to flag the things you can actually fix. Public accounts only.
      </p>

      <style jsx>{`
        .sbbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .sbbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){ .sbbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; } }
      `}</style>
    </div>
  );
}
