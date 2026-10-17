"use client";
import { useState } from "react";
import { AtSign, Swords, Trophy, AlertTriangle, BadgeCheck } from "lucide-react";
import { dl, fmt, type ProfileFeed } from "@/lib/media";

function avg(ns: number[]) { return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0; }

type Fighter = {
  feed: ProfileFeed;
  er: number; avgLikes: number; avgComments: number;
  ratio: number; score: number;
};

function measure(feed: ProfileFeed): Fighter {
  const posts = feed.postsList ?? [];
  const avgLikes = avg(posts.map((p) => p.likes));
  const avgComments = avg(posts.map((p) => p.comments));
  const er = feed.followers > 0 ? ((avgLikes + avgComments) / feed.followers) * 100 : 0;
  const ratio = feed.following > 0 ? feed.followers / feed.following : feed.followers;
  // Composite battle score: engagement dominates, audience size and balance help.
  const score =
    Math.min(50, er * 12) +
    Math.min(30, Math.log10(Math.max(1, feed.followers)) * 5) +
    Math.min(10, Math.log10(Math.max(1, ratio)) * 5) +
    Math.min(10, posts.length);
  return { feed, er, avgLikes, avgComments, ratio, score: Math.round(score) };
}

const ROWS: { label: string; get: (f: Fighter) => number; show: (f: Fighter) => string }[] = [
  { label: "Followers", get: (f) => f.feed.followers, show: (f) => fmt(f.feed.followers) },
  { label: "Engagement rate", get: (f) => f.er, show: (f) => f.er.toFixed(2) + "%" },
  { label: "Avg likes", get: (f) => f.avgLikes, show: (f) => fmt(Math.round(f.avgLikes)) },
  { label: "Avg comments", get: (f) => f.avgComments, show: (f) => fmt(Math.round(f.avgComments)) },
  { label: "Follower/following", get: (f) => f.ratio, show: (f) => f.ratio.toFixed(1) },
  { label: "Total posts", get: (f) => f.feed.posts, show: (f) => fmt(f.feed.posts) },
];

function Avatar({ f, winner }: { f: Fighter; winner: boolean }) {
  return (
    <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <span style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", display: "inline-block", border: winner ? "3px solid var(--molten)" : "2px solid var(--line)", background: "var(--surface-2)" }}>
          {f.feed.profilePicHd && /* eslint-disable-next-line @next/next/no-img-element */
            <img src={dl(f.feed.profilePicHd, "avatar")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </span>
        {winner && (
          <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", color: "var(--gold-ink)" }}>
            <Trophy size={18} strokeWidth={2} />
          </span>
        )}
      </div>
      <div style={{ marginTop: 8, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 0 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{f.feed.username}</span>
        {f.feed.isVerified && <BadgeCheck size={14} strokeWidth={1.5} style={{ color: "var(--gold-ink)", flexShrink: 0 }} />}
      </div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: winner ? "var(--gold-ink)" : "var(--ink-2)", marginTop: 4 }}>
        {f.score}
      </div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>battle score</div>
    </div>
  );
}

export default function ProfileBattle() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fight, setFight] = useState<[Fighter, Fighter] | null>(null);
  const [invalid, setInvalid] = useState(false);

  async function fetchProfile(username: string): Promise<ProfileFeed> {
    const res = await fetch("/api/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "feed", username }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error ?? `Couldn't load @${username.replace(/^@/, "")}.`);
    return json as ProfileFeed;
  }

  async function go() {
    if (loading) return;
    if (!a.trim() || !b.trim()) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    setLoading(true); setError(null); setFight(null);
    try {
      const [fa, fb] = await Promise.all([fetchProfile(a), fetchProfile(b)]);
      setFight([measure(fa), measure(fb)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong — please try again.");
    } finally { setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "var(--ink)",
  };

  const winnerIdx = fight ? (fight[0].score >= fight[1].score ? 0 : 1) : -1;
  const winner = fight ? (winnerIdx === 0 ? fight[0] : fight[1]) : null;

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`card ${invalid ? "shake" : ""}`} style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 200px" }}>
            <AtSign size={16} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
            <input value={a} onChange={(e) => setA(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="first username" aria-label="First username"
              autoCapitalize="none" autoCorrect="off" spellCheck={false} style={inputStyle} />
          </div>
          <span className="label" style={{ color: "var(--gold-ink)", flexShrink: 0 }}>VS</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 200px" }}>
            <AtSign size={16} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
            <input value={b} onChange={(e) => setB(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="second username" aria-label="Second username"
              autoCapitalize="none" autoCorrect="off" spellCheck={false} style={inputStyle} />
          </div>
        </div>
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 50, justifyContent: "center", width: "100%", marginTop: 14 }}>
          <Swords size={18} strokeWidth={1.5} />
          <span>{loading ? "Fighting…" : "Start the battle"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {fight && (
        <div className="card intro-rise" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
            <Avatar f={fight[0]} winner={winnerIdx === 0} />
            <span style={{ alignSelf: "center", color: "var(--ink-3)" }}><Swords size={22} strokeWidth={1.5} /></span>
            <Avatar f={fight[1]} winner={winnerIdx === 1} />
          </div>

          <div style={{ textAlign: "center", margin: "12px 0 20px" }}>
            <span className="label" style={{ color: "var(--gold-ink)" }}>
              🏆 @{winner?.feed.username} wins the battle
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {ROWS.map((row) => {
              const va = row.get(fight[0]), vb = row.get(fight[1]);
              const aWins = va > vb, bWins = vb > va;
              return (
                <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10, padding: "9px 4px", borderBottom: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: 14, fontWeight: aWins ? 700 : 400, color: aWins ? "var(--gold-ink)" : "var(--ink-2)", textAlign: "right" }}>
                    {row.show(fight[0])}{aWins ? " ●" : ""}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "center", minWidth: 110 }}>{row.label}</span>
                  <span className="mono" style={{ fontSize: 14, fontWeight: bWins ? 700 : 400, color: bWins ? "var(--gold-ink)" : "var(--ink-2)" }}>
                    {bWins ? "● " : ""}{row.show(fight[1])}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 16, lineHeight: 1.6 }}>
            Battle score = engagement (biggest weight) + audience size + follower balance + recent activity,
            computed from public data on each profile&apos;s recent posts. For fun — not a verdict on anyone&apos;s worth. 😄
          </p>
        </div>
      )}
    </div>
  );
}
