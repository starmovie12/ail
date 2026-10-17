"use client";
import { useState } from "react";
import { AtSign, HeartPulse, AlertTriangle, BadgeCheck, Copy, Check } from "lucide-react";
import AdFrame from "./AdFrame";
import { fmt, dl, type ProfileFeed } from "@/lib/media";
import { useI18n } from "@/lib/i18n";

function avg(ns: number[]) { return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0; }

type Pillar = { name: string; score: number; note: string };

/** C9 — composite report card. Four pillars, 25 points each. */
function analyze(d: ProfileFeed): { total: number; grade: string; pillars: Pillar[] } {
  const posts = d.postsList ?? [];
  const avgLikes = avg(posts.map((p) => p.likes));
  const avgComments = avg(posts.map((p) => p.comments));
  const er = d.followers > 0 ? ((avgLikes + avgComments) / d.followers) * 100 : 0;

  // 1 — Engagement (25)
  const erGood = d.followers < 10000 ? 3.5 : d.followers < 100000 ? 2.5 : 1.5;
  const engagement = Math.round(Math.min(25, (er / erGood) * 20 + (avgComments / Math.max(1, avgLikes) > 0.008 ? 5 : 0)));

  // 2 — Consistency (25)
  const times = posts.map((p) => p.takenAt).filter(Boolean).sort((a, b) => b - a);
  let gapDays = 99;
  if (times.length > 1) {
    const gaps: number[] = [];
    for (let i = 0; i < times.length - 1; i++) gaps.push((times[i] - times[i + 1]) / 86400);
    gapDays = avg(gaps);
  }
  const consistency = Math.round(Math.min(25, Math.max(0, 25 - (gapDays - 2) * 4)));

  // 3 — Audience quality (25)
  const ratio = d.following > 0 ? d.followers / d.following : 10;
  const audience = Math.round(Math.min(25,
    (ratio >= 2 ? 12 : ratio >= 1 ? 9 : ratio >= 0.5 ? 5 : 2) +
    (er >= erGood * 0.4 ? 8 : 3) +
    (d.followers > 10000 && d.posts < 10 ? 0 : 5)));

  // 4 — Profile craft (25)
  const capLen = avg(posts.map((p) => p.caption.length));
  const tags = avg(posts.map((p) => (p.caption.match(/#[\p{L}\p{N}_]+/gu) ?? []).length));
  const craft = Math.round(Math.min(25,
    (d.biography ? 8 : 0) +
    (capLen >= 60 ? 8 : capLen >= 20 ? 4 : 0) +
    (tags >= 3 && tags <= 20 ? 9 : tags > 0 ? 4 : 0)));

  const total = engagement + consistency + audience + craft;
  const grade = total >= 88 ? "A+" : total >= 78 ? "A" : total >= 65 ? "B" : total >= 50 ? "C" : total >= 35 ? "D" : "F";

  return {
    total, grade,
    pillars: [
      { name: "Engagement", score: engagement, note: `${er.toFixed(2)}% rate vs ~${erGood}% benchmark for this size` },
      { name: "Consistency", score: consistency, note: gapDays > 90 ? "not enough dated posts to judge" : `a post every ~${gapDays.toFixed(1)} days` },
      { name: "Audience quality", score: audience, note: `${ratio.toFixed(1)}× follower/following balance` },
      { name: "Profile craft", score: craft, note: "bio, caption depth and hashtag usage" },
    ],
  };
}

export default function AccountHealth() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProfileFeed | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!username.trim()) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "feed", username }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) setError(json?.error ?? "Something went wrong. Please try again.");
      else setData(json as ProfileFeed);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally { setLoading(false); }
  }

  const report = data ? analyze(data) : null;
  const color = report && report.total >= 65 ? "var(--ok)" : report && report.total >= 45 ? "var(--warn)" : "var(--err)";

  async function share() {
    if (!report || !data) return;
    const text = `📋 Instagram Health Report — @${data.username}\n\nGrade: ${report.grade} (${report.total}/100)\n${report.pillars.map((p) => `${p.name}: ${p.score}/25`).join("\n")}\n\nCheck yours free → InstaGrab`;
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%" }}>
      <div className={`bar hbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><AtSign size={20} strokeWidth={1.5} /></span>
        <input
          value={username} disabled={loading}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Enter @username for a full report card"
          aria-label="Instagram username"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <HeartPulse size={18} strokeWidth={1.5} /> <span>{loading ? t("fetching") : "Check health"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 20, maxWidth: 720, margin: "24px auto 0", textAlign: "left", borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span className="medallion" style={{ flexShrink: 0, color: "var(--err)" }}><AlertTriangle size={24} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {data && report && (
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card intro-rise" style={{ padding: 24, maxWidth: 720, margin: "0 auto", width: "100%", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--gold-300)", flexShrink: 0, background: "var(--surface-2)" }}>
                {data.profilePicHd && /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={dl(data.profilePicHd, "avatar")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </span>
              <b style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                @{data.username}
                {data.isVerified && <BadgeCheck size={16} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} />}
              </b>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)" }}>{fmt(data.followers)} followers</span>
            </div>

            <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
              <div className="mono" style={{ fontSize: 56, fontWeight: 700, color }}>{report.grade}</div>
              <div className="label" style={{ marginTop: 4 }}>Account health · {report.total}/100</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {report.pillars.map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{p.score}/25 · {p.note}</span>
                  </div>
                  <div aria-hidden="true" style={{ height: 7, borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--line)", overflow: "hidden" }}>
                    <div style={{ width: `${(p.score / 25) * 100}%`, height: "100%", background: p.score >= 16 ? "var(--ok)" : p.score >= 10 ? "var(--warn)" : "var(--err)", borderRadius: 99, transition: "width 600ms var(--ease-silk)" }} />
                  </div>
                </div>
              ))}
            </div>

            <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={share} style={{ fontSize: 13, marginTop: 20 }}>
              {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? "Copied — share it!" : "Copy report to share"}
            </button>

            <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 16, lineHeight: 1.6 }}>
              Four pillars, 25 points each, from public data on recent posts. Dig deeper with the profile audit,
              fake follower checker and engagement calculator — all free here.
            </p>
          </div>
          <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}><AdFrame slotH={280} /></div>
        </div>
      )}

      <style jsx>{`
        .hbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .hbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .hbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
