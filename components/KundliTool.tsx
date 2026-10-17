"use client";
import { useState } from "react";
import { AtSign, Sparkles, AlertTriangle, Copy, Check, Heart, Users } from "lucide-react";
import { dl } from "@/lib/media";

const LANGS: [string, string][] = [["hinglish", "Hinglish 🇮🇳"], ["hindi", "हिन्दी"], ["english", "English"]];

type Result = {
  mode: "single" | "compatibility";
  text: string;
  a: { username: string; profilePicHd?: string };
  b?: { username: string; profilePicHd?: string };
};

export default function KundliTool() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [couple, setCouple] = useState(false);
  const [language, setLanguage] = useState("hinglish");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!a.trim() || (couple && !b.trim())) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/invent/kundli", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: a.trim(), username2: couple ? b.trim() : "", language }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.text) setError(json?.error ?? "Kuch gadbad — phir try karo.");
      else setResult(json as Result);
    } catch {
      setError("Network error — phir try karo.");
    } finally { setLoading(false); }
  }

  async function copy() {
    if (!result) return;
    const head = result.mode === "compatibility" ? `💞 @${result.a.username} × @${result.b?.username} — Insta Kundli` : `🪔 @${result.a.username} ka Insta Kundli`;
    try { await navigator.clipboard.writeText(`${head}\n\n${result.text}\n\nApna banao → InstaGrab`); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="chip" onClick={() => setCouple(false)} style={{ cursor: "pointer", borderColor: !couple ? "var(--gold-400)" : undefined, color: !couple ? "var(--gold-ink)" : undefined, fontWeight: !couple ? 600 : 400 }}>
          <Sparkles size={13} strokeWidth={1.5} /> Solo Kundli
        </button>
        <button className="chip" onClick={() => setCouple(true)} style={{ cursor: "pointer", borderColor: couple ? "var(--gold-400)" : undefined, color: couple ? "var(--gold-ink)" : undefined, fontWeight: couple ? 600 : 400 }}>
          <Heart size={13} strokeWidth={1.5} /> Compatibility 💞
        </button>
      </div>

      <div className={`bar kbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <AtSign size={20} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
        <input value={a} onChange={(e) => setA(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder={couple ? "pehla @username" : "@username daalo"} aria-label="Username"
          autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={loading} style={inputStyle} />
        {couple && (
          <>
            <Heart size={15} strokeWidth={1.5} style={{ color: "var(--gold-ink)", flexShrink: 0 }} />
            <input value={b} onChange={(e) => setB(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="doosra @username" aria-label="Second username"
              autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={loading} style={inputStyle} />
          </>
        )}
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Sparkles size={18} strokeWidth={1.5} /> <span>{loading ? "Bana raha…" : "Kundli"}</span>
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {LANGS.map(([v, label]) => (
          <button key={v} className="chip" onClick={() => setLanguage(v)}
            style={{ cursor: "pointer", fontSize: 12, borderColor: language === v ? "var(--gold-400)" : undefined, color: language === v ? "var(--gold-ink)" : undefined, fontWeight: language === v ? 600 : 400 }}>
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <AlertTriangle size={20} strokeWidth={1.5} style={{ color: "var(--err)", flexShrink: 0 }} />
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {result && (
        <div className="card intro-rise" style={{ padding: 24, borderColor: "var(--gold-300)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            {[result.a, result.b].filter(Boolean).map((u, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                {i === 1 && <Heart size={18} strokeWidth={1.5} style={{ color: "var(--molten)" }} />}
                <span style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--gold-300)", background: "var(--surface-2)" }}>
                  {u!.profilePicHd && /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={dl(u!.profilePicHd, "avatar")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </span>
                <b>@{u!.username}</b>
              </span>
            ))}
          </div>
          <div className="well" style={{ padding: 20, whiteSpace: "pre-wrap", fontSize: 15, color: "var(--ink)", lineHeight: 1.8 }}>{result.text}</div>
          <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13, marginTop: 16 }}>
            {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
            {copied ? "Copied — share karo!" : "Copy to share"}
          </button>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6, display: "flex", gap: 6, alignItems: "center" }}>
        <Users size={12} strokeWidth={1.5} /> Sirf masti ke liye 😄 — public accounts par, AI se bana, kisi jyotish ki salah nahi.
      </p>

      <style jsx>{`
        .kbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .kbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){ .kbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; } }
      `}</style>
    </div>
  );
}
