"use client";
import { useState } from "react";
import { AtSign, Sparkles, AlertTriangle, Copy, Check, BadgeCheck, Heart, MessageCircle } from "lucide-react";
import { dl, fmt } from "@/lib/media";

type Wrapped = {
  username: string;
  fullName: string;
  profilePicHd?: string;
  isVerified: boolean;
  stats: {
    followers: number; following: number; posts: number;
    avgLikes: number; avgComments: number; erPct: number;
    captionStyle: string; nightScore: number;
  };
  bestPost: { shortcode: string; thumbnail: string; likes: number; comments: number } | null;
  personality: { title: string; line: string };
};

function postingTime(night: number) {
  return night > 0.5 ? "Late night 🌙" : night > 0.25 ? "Golden hour 🌇" : "Daytime ☀️";
}

export default function WrappedTool() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Wrapped | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!username.trim()) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetch("/api/invent/wrapped", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), language: "hinglish" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.username) setError(json?.error ?? "Couldn't build your Wrapped — try again.");
      else setData(json as Wrapped);
    } catch {
      setError("Network error — please try again.");
    } finally { setLoading(false); }
  }

  async function copy() {
    if (!data) return;
    const s = data.stats;
    const text =
      `✨ @${data.username} — Insta Wrapped ✨\n` +
      `${data.personality.title}\n${data.personality.line}\n\n` +
      `👥 ${fmt(s.followers)} followers\n📸 ${s.posts} posts\n` +
      `❤️ ${fmt(s.avgLikes)} avg likes · 💬 ${fmt(s.avgComments)} avg comments\n` +
      `📊 ${s.erPct}% engagement\n⏰ ${postingTime(s.nightScore)}\n\n` +
      `Make yours → InstaGrab`;
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  const s = data?.stats;
  const cells: [string, string][] = s ? [
    ["Followers", fmt(s.followers)],
    ["Posts", String(s.posts)],
    ["Avg likes", fmt(s.avgLikes)],
    ["Avg comments", fmt(s.avgComments)],
    ["Engagement", `${s.erPct}%`],
    ["Posting vibe", postingTime(s.nightScore)],
  ] : [];

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar wbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <AtSign size={20} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
        <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="@username daalo — Wrapped bana do" aria-label="Username"
          autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={loading}
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }} />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Sparkles size={18} strokeWidth={1.5} /> <span>{loading ? "Banaya…" : "Wrapped"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <AlertTriangle size={20} strokeWidth={1.5} style={{ color: "var(--err)", flexShrink: 0 }} />
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {data && s && (
        <div className="card intro-rise" style={{ padding: 0, overflow: "hidden", borderColor: "var(--gold-300)" }}>
          <div style={{ padding: "28px 24px", textAlign: "center", background: "linear-gradient(160deg, color-mix(in srgb, var(--gold-300) 22%, var(--surface)), var(--surface))" }}>
            <span style={{ width: 88, height: 88, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--gold-300)", background: "var(--surface-2)", display: "inline-block" }}>
              {data.profilePicHd && /* eslint-disable-next-line @next/next/no-img-element */
                <img src={dl(data.profilePicHd, "avatar")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
              <b style={{ fontSize: 17 }}>@{data.username}</b>
              {data.isVerified && <BadgeCheck size={16} strokeWidth={2} style={{ color: "var(--gold-ink)" }} />}
            </div>
            <p className="gilded" style={{ fontSize: 22, fontWeight: 700, margin: "14px 0 6px", lineHeight: 1.2 }}>{data.personality.title}</p>
            {data.personality.line && <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)", maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>{data.personality.line}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--line)" }}>
            {cells.map(([label, value]) => (
              <div key={label} style={{ background: "var(--surface)", padding: "16px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{value}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
              </div>
            ))}
          </div>

          {data.bestPost && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 18, borderTop: "1px solid var(--line)" }}>
              <a href={`https://www.instagram.com/p/${data.bestPost.shortcode}/`} target="_blank" rel="noopener noreferrer"
                style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", flexShrink: 0, background: "var(--surface-2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dl(data.bestPost.thumbnail, "best")} alt="Top post" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </a>
              <div>
                <span className="label" style={{ color: "var(--gold-ink)", display: "block", marginBottom: 6 }}>Top post of the year</span>
                <span style={{ display: "inline-flex", gap: 14, fontSize: 13, color: "var(--ink-2)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Heart size={13} strokeWidth={1.5} /> {fmt(data.bestPost.likes)}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MessageCircle size={13} strokeWidth={1.5} /> {fmt(data.bestPost.comments)}</span>
                </span>
              </div>
            </div>
          )}

          <div style={{ padding: 16, borderTop: "1px solid var(--line)" }}>
            <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13, width: "100%", justifyContent: "center" }}>
              {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? "Copied — ab share karo!" : "Copy my Wrapped"}
            </button>
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Built from public data on recent posts — a fun year-in-review card, not official Instagram stats. Nothing stored.
      </p>

      <style jsx>{`
        .wbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .wbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){ .wbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; } }
      `}</style>
    </div>
  );
}
