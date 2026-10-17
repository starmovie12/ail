"use client";
import { useState } from "react";
import { AtSign, Flame, Copy, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { dl, fmt, type ProfileFeed } from "@/lib/media";

const LANGS: [string, string][] = [["hinglish", "Hinglish 🇮🇳"], ["english", "English"], ["hindi", "हिन्दी"]];

function avg(ns: number[]) { return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0; }

export default function ProfileRoaster() {
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("hinglish");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileFeed | null>(null);
  const [roast, setRoast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!username.trim()) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    setLoading(true); setError(null); setProfile(null); setRoast(null);
    try {
      const pRes = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "feed", username }),
      });
      const p = await pRes.json().catch(() => null);
      if (!pRes.ok) { setError(p?.error ?? "Couldn't load that profile."); return; }
      const feed = p as ProfileFeed;
      setProfile(feed);

      const posts = feed.postsList ?? [];
      const er = feed.followers > 0
        ? (((avg(posts.map((x) => x.likes)) + avg(posts.map((x) => x.comments))) / feed.followers) * 100).toFixed(2)
        : "0";
      const aRes = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "roast", language,
          inputs: {
            username: feed.username, bio: feed.biography || "(empty bio)",
            followers: String(feed.followers), following: String(feed.following),
            posts: String(feed.posts), er,
          },
        }),
      });
      const a = await aRes.json().catch(() => null);
      if (!aRes.ok || !a?.text) setError(a?.error ?? "The roast machine jammed — try again.");
      else setRoast(a.text);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally { setLoading(false); }
  }

  async function copy() {
    if (!roast) return;
    const text = `🔥 @${profile?.username} just got roasted on InstaGrab:\n\n${roast}\n\nRoast your friends → instagrab`;
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {LANGS.map(([v, label]) => (
          <button key={v} className="chip" onClick={() => setLanguage(v)}
            style={{ cursor: "pointer", borderColor: language === v ? "var(--gold-400)" : undefined, color: language === v ? "var(--gold-ink)" : undefined, fontWeight: language === v ? 600 : 400 }}>
            {label}
          </button>
        ))}
      </div>

      <div className={`bar rbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><AtSign size={20} strokeWidth={1.5} /></span>
        <input
          value={username} disabled={loading}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Whose profile are we roasting today? 😈"
          aria-label="Instagram username"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Flame size={18} strokeWidth={1.5} />
          <span>{loading ? "Cooking…" : "Roast it"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {roast && profile && (
        <div className="card intro-rise" style={{ padding: 24, borderColor: "var(--gold-300)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--molten)", flexShrink: 0, background: "var(--surface-2)" }}>
              {profile.profilePicHd && /* eslint-disable-next-line @next/next/no-img-element */
                <img src={dl(profile.profilePicHd, "avatar")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </span>
            <span>
              <b>@{profile.username}</b>
              <span className="mono" style={{ display: "block", fontSize: 12, color: "var(--ink-3)" }}>
                {fmt(profile.followers)} followers · {profile.posts} posts · officially roasted 🔥
              </span>
            </span>
          </div>
          <div className="well" style={{ padding: 20, whiteSpace: "pre-wrap", fontSize: 15, color: "var(--ink)", lineHeight: 1.8, fontStyle: "italic" }}>
            {roast}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13 }}>
              {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? "Copied — send it!" : "Copy roast to share"}
            </button>
            <button className="btn btn-secondary" onClick={go} disabled={loading} style={{ fontSize: 13 }}>
              <RefreshCw size={14} strokeWidth={1.5} /> Roast again
            </button>
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        All love, no venom — the AI is told to keep it playful, PG-13 and end with a genuine compliment.
        Works on public profiles only.
      </p>

      <style jsx>{`
        .rbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .rbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .rbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
