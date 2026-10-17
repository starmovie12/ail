"use client";
import { useState } from "react";
import { AtSign, ShieldCheck, AlertTriangle, BadgeCheck, CheckCircle2, AlertCircle } from "lucide-react";
import AdFrame from "./AdFrame";
import { fmt, dl, type ProfileFeed } from "@/lib/media";
import { useI18n } from "@/lib/i18n";

type Signal = { tone: "ok" | "warn"; text: string; penalty: number };

function avg(ns: number[]) { return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0; }

/**
 * Audience-quality heuristics from public numbers only. Each red flag carries
 * a penalty; the score starts at 100 and the grade maps from what's left.
 */
function analyze(d: ProfileFeed): { score: number; grade: string; signals: Signal[] } {
  const signals: Signal[] = [];
  const posts = d.postsList ?? [];
  const avgLikes = avg(posts.map((p) => p.likes));
  const avgComments = avg(posts.map((p) => p.comments));
  const er = d.followers > 0 ? ((avgLikes + avgComments) / d.followers) * 100 : 0;

  // 1. Engagement rate vs size — the strongest fake-follower tell.
  const erFloor = d.followers < 10000 ? 1.2 : d.followers < 100000 ? 0.8 : 0.5;
  if (posts.length === 0) {
    signals.push({ tone: "warn", text: "No public posts to sample — engagement can't be verified.", penalty: 25 });
  } else if (er < erFloor * 0.4) {
    signals.push({ tone: "warn", text: `Engagement rate ${er.toFixed(2)}% is far below the ~${erFloor}% floor for this size — a classic bought-followers pattern.`, penalty: 40 });
  } else if (er < erFloor) {
    signals.push({ tone: "warn", text: `Engagement rate ${er.toFixed(2)}% sits below the healthy floor (~${erFloor}%) for an account this size.`, penalty: 20 });
  } else {
    signals.push({ tone: "ok", text: `Engagement rate ${er.toFixed(2)}% is healthy for ${fmt(d.followers)} followers.`, penalty: 0 });
  }

  // 2. Comments-to-likes — bots like, humans talk.
  if (avgLikes > 100) {
    const ratio = avgComments / avgLikes;
    if (ratio < 0.003) signals.push({ tone: "warn", text: `Almost no comments (~${(ratio * 100).toFixed(2)} per 100 likes) — likes may be inflated.`, penalty: 15 });
    else signals.push({ tone: "ok", text: `Real conversation — about ${(ratio * 100).toFixed(1)} comments per 100 likes.`, penalty: 0 });
  }

  // 3. Following/follower balance.
  if (d.following > 3000 && d.following > d.followers) {
    signals.push({ tone: "warn", text: `Following ${fmt(d.following)} accounts vs ${fmt(d.followers)} followers — follow-for-follow growth leaves low-quality audiences.`, penalty: 15 });
  } else {
    signals.push({ tone: "ok", text: "Follower-to-following balance looks organic.", penalty: 0 });
  }

  // 4. Output vs audience — big audiences with almost no content are usually bought.
  if (d.followers > 10000 && d.posts < 10) {
    signals.push({ tone: "warn", text: `${fmt(d.followers)} followers on only ${d.posts} posts — audiences this size rarely grow from so little content.`, penalty: 20 });
  }

  // 5. Like-count volatility — bot drops show as wild swings between posts.
  const likes = posts.map((p) => p.likes).filter((n) => n > 0);
  if (likes.length >= 6) {
    const m = avg(likes);
    const sd = Math.sqrt(avg(likes.map((n) => (n - m) ** 2)));
    if (m > 50 && sd / m > 1.6) {
      signals.push({ tone: "warn", text: "Like counts swing wildly between posts — a pattern common with purchased engagement drops.", penalty: 10 });
    } else {
      signals.push({ tone: "ok", text: "Like counts are consistent across recent posts.", penalty: 0 });
    }
  }

  const score = Math.max(0, Math.min(100, 100 - signals.reduce((s, x) => s + x.penalty, 0)));
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";
  return { score, grade, signals };
}

export default function FakeFollowerChecker() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProfileFeed | null>(null);
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
  const scoreColor = report && report.score >= 70 ? "var(--ok)" : report && report.score >= 45 ? "var(--warn)" : "var(--err)";

  return (
    <div style={{ width: "100%" }}>
      <div className={`bar fbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><AtSign size={20} strokeWidth={1.5} /></span>
        <input
          value={username} disabled={loading}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Enter @username to check audience quality"
          aria-label="Instagram username"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <ShieldCheck size={18} strokeWidth={1.5} /> <span>{loading ? t("fetching") : "Check"}</span>
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
            </div>

            <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
              <div className="mono" style={{ fontSize: 52, fontWeight: 700, color: scoreColor }}>{report.grade}</div>
              <div className="label" style={{ marginTop: 4 }}>Audience quality score · {report.score}/100</div>
              <div aria-hidden="true" style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--line)", marginTop: 14, overflow: "hidden", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
                <div style={{ width: `${report.score}%`, height: "100%", background: scoreColor, borderRadius: 99, transition: "width 600ms var(--ease-silk)" }} />
              </div>
            </div>

            <span className="label" style={{ display: "block", marginBottom: 12 }}>Signals we checked</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.signals.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: s.tone === "ok" ? "var(--ok)" : "var(--warn)", flexShrink: 0, marginTop: 2 }}>
                    {s.tone === "ok" ? <CheckCircle2 size={16} strokeWidth={1.75} /> : <AlertCircle size={16} strokeWidth={1.75} />}
                  </span>
                  <span style={{ fontSize: "var(--t-small)", color: "var(--ink-2)" }}>{s.text}</span>
                </div>
              ))}
            </div>

            <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 20, lineHeight: 1.6 }}>
              Heuristics from public numbers on the {data.postsList?.length ?? 0} most recent posts — we can&apos;t see
              individual followers, so this estimates audience <em>quality</em>, not an exact fake count.
            </p>
          </div>
          <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}><AdFrame slotH={280} /></div>
        </div>
      )}

      <style jsx>{`
        .fbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .fbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .fbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
