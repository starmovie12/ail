"use client";
import { useState } from "react";
import { AtSign, Activity, AlertTriangle, BadgeCheck, CheckCircle2, AlertCircle, Info } from "lucide-react";
import AdFrame from "./AdFrame";
import { fmt, dl, type ProfileFeed } from "@/lib/media";
import { useI18n } from "@/lib/i18n";

type Mode = "engagement" | "audit";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function avg(ns: number[]) { return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0; }
function mode<T>(items: T[]): T | null {
  const m = new Map<T, number>(); let best: T | null = null, n = 0;
  for (const it of items) { const c = (m.get(it) ?? 0) + 1; m.set(it, c); if (c > n) { n = c; best = it; } }
  return best;
}

type Metrics = {
  followers: number; following: number;
  erPct: number; avgLikes: number; avgComments: number;
  postCount: number; avgHashtags: number; avgCaptionLen: number;
  bestHour: number | null; bestDay: string | null; avgGapDays: number | null;
  followRatio: number | null;
};

function compute(d: ProfileFeed): Metrics {
  const posts = d.postsList ?? [];
  const likes = posts.map((p) => p.likes);
  const comments = posts.map((p) => p.comments);
  const avgLikes = avg(likes), avgComments = avg(comments);
  const erPct = d.followers > 0 ? ((avgLikes + avgComments) / d.followers) * 100 : 0;
  const hashtags = posts.map((p) => (p.caption.match(/#[\p{L}\p{N}_]+/gu) ?? []).length);
  const capLens = posts.map((p) => p.caption.length);
  const times = posts.map((p) => p.takenAt).filter(Boolean).map((t) => new Date(t * 1000));
  const bestHour = times.length ? mode(times.map((t) => t.getHours())) : null;
  const bestDayIdx = times.length ? mode(times.map((t) => t.getDay())) : null;
  let avgGapDays: number | null = null;
  if (times.length > 1) {
    const sorted = times.map((t) => t.getTime()).sort((a, b) => b - a);
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) gaps.push((sorted[i] - sorted[i + 1]) / 86400000);
    avgGapDays = avg(gaps);
  }
  return {
    followers: d.followers, following: d.following,
    erPct, avgLikes, avgComments, postCount: posts.length,
    avgHashtags: avg(hashtags), avgCaptionLen: avg(capLens),
    bestHour, bestDay: bestDayIdx === null ? null : DAYS[bestDayIdx],
    avgGapDays, followRatio: d.following > 0 ? d.followers / d.following : null,
  };
}

function erVerdict(er: number, followers: number) {
  // Rough industry bands; smaller accounts naturally run higher.
  const good = followers < 10000 ? 3.5 : followers < 100000 ? 2.5 : 1.5;
  const ok = followers < 10000 ? 1.5 : followers < 100000 ? 1 : 0.7;
  if (er >= good) return { label: "Excellent", tone: "ok" as const };
  if (er >= ok) return { label: "Healthy", tone: "ok" as const };
  if (er > 0) return { label: "Below average", tone: "warn" as const };
  return { label: "No recent posts", tone: "warn" as const };
}

type Finding = { tone: "ok" | "warn" | "info"; text: string };
function audit(m: Metrics): Finding[] {
  const f: Finding[] = [];
  const v = erVerdict(m.erPct, m.followers);
  f.push({ tone: v.tone === "ok" ? "ok" : "warn", text: `Engagement rate ${m.erPct.toFixed(2)}% — ${v.label.toLowerCase()} for an account this size.` });
  if (m.avgComments > 0 && m.avgLikes > 0) {
    const ratio = m.avgComments / m.avgLikes;
    f.push(ratio >= 0.01
      ? { tone: "ok", text: `Strong conversation — about ${(ratio * 100).toFixed(1)} comments per 100 likes.` }
      : { tone: "warn", text: `Few comments relative to likes — ask a question in your caption to spark replies.` });
  }
  if (m.avgGapDays !== null) {
    f.push(m.avgGapDays <= 2.5
      ? { tone: "ok", text: `Consistent cadence — roughly a post every ${m.avgGapDays.toFixed(1)} days.` }
      : { tone: "warn", text: `Posting gap is ${m.avgGapDays.toFixed(1)} days on average — more consistency usually lifts reach.` });
  }
  if (m.bestDay && m.bestHour !== null) {
    f.push({ tone: "info", text: `Your recent posts cluster around ${m.bestDay}, ~${String(m.bestHour).padStart(2, "0")}:00 — a reasonable window to test.` });
  }
  f.push(m.avgHashtags >= 3 && m.avgHashtags <= 15
    ? { tone: "ok", text: `Hashtag count looks right — about ${Math.round(m.avgHashtags)} per post.` }
    : m.avgHashtags < 3
      ? { tone: "warn", text: `Only ~${Math.round(m.avgHashtags)} hashtags per post — 5–15 relevant tags help discovery.` }
      : { tone: "warn", text: `~${Math.round(m.avgHashtags)} hashtags per post — trim to 5–15 relevant ones to avoid looking spammy.` });
  f.push(m.avgCaptionLen >= 60
    ? { tone: "ok", text: `Captions have substance (~${Math.round(m.avgCaptionLen)} characters) — good for saves and dwell time.` }
    : { tone: "warn", text: `Captions are short (~${Math.round(m.avgCaptionLen)} chars) — a hook + context earns more saves.` });
  return f;
}

const TONE = {
  ok: { Icon: CheckCircle2, color: "var(--ok)" },
  warn: { Icon: AlertCircle, color: "var(--warn)" },
  info: { Icon: Info, color: "var(--gold-ink)" },
};

export default function ProfileStatsTool({ mode: toolMode }: { mode: Mode }) {
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

  const m = data ? compute(data) : null;
  const verdict = m ? erVerdict(m.erPct, m.followers) : null;

  return (
    <div style={{ width: "100%" }}>
      <div className={`bar ubar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><AtSign size={20} strokeWidth={1.5} /></span>
        <input
          value={username} disabled={loading}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Enter @username or profile URL"
          aria-label="Instagram username"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Activity size={18} strokeWidth={1.5} /> <span>{loading ? t("fetching") : "Analyze"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 20, maxWidth: 720, margin: "24px auto 0", textAlign: "left", borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span className="medallion" style={{ flexShrink: 0, color: "var(--err)" }}><AlertTriangle size={24} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {data && m && (
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card intro-rise" style={{ padding: 24, maxWidth: 720, margin: "0 auto", width: "100%", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--gold-300)", flexShrink: 0, background: "var(--surface-2)" }}>
                {data.profilePicHd && /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={dl(data.profilePicHd, "avatar")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </span>
              <b style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                @{data.username}
                {data.isVerified && <BadgeCheck size={16} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} />}
              </b>
            </div>

            {/* Headline engagement number */}
            <div style={{ textAlign: "center", padding: "12px 0 20px" }}>
              <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: verdict?.tone === "ok" ? "var(--ok)" : "var(--warn)" }}>
                {m.erPct.toFixed(2)}%
              </div>
              <div className="label" style={{ marginTop: 4 }}>Engagement rate · {verdict?.label}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
              {[
                ["Followers", fmt(m.followers)],
                ["Avg likes", fmt(Math.round(m.avgLikes))],
                ["Avg comments", fmt(Math.round(m.avgComments))],
                ["Posts sampled", String(m.postCount)],
                ...(m.followRatio !== null ? [["Follower / following", m.followRatio.toFixed(1)] as [string, string]] : []),
                ...(toolMode === "engagement" && m.followers > 0 ? [["Likes / followers", `${((m.avgLikes / m.followers) * 100).toFixed(2)}%`] as [string, string]] : []),
              ].map(([k, v]) => (
                <div key={k} className="well" style={{ padding: 14, textAlign: "center" }}>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>

            {toolMode === "audit" && (
              <div style={{ marginTop: 24 }}>
                <span className="label" style={{ display: "block", marginBottom: 12 }}>Audit report</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {audit(m).map((f, i) => {
                    const T = TONE[f.tone];
                    return (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: T.color, flexShrink: 0, marginTop: 2 }}><T.Icon size={16} strokeWidth={1.75} /></span>
                        <span style={{ fontSize: "var(--t-small)", color: "var(--ink-2)" }}>{f.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 20, lineHeight: 1.6 }}>
              Calculated from public numbers on the profile&apos;s {m.postCount} most recent posts. Estimates only —
              engagement varies by niche, content type and time.
            </p>
          </div>
          <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}><AdFrame slotH={280} /></div>
        </div>
      )}

      <style jsx>{`
        .ubar-input::placeholder{ color:var(--ink-3); }
        .ubar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .ubar.loading:focus-within{ box-shadow:none; }
      `}</style>
    </div>
  );
}
