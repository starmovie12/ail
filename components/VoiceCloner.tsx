"use client";
import { useState } from "react";
import { AtSign, Wand2, Copy, Check, AlertTriangle } from "lucide-react";

const LANGS: [string, string][] = [["english", "Their language"], ["hinglish", "Hinglish 🇮🇳"], ["hindi", "हिन्दी"]];

export default function VoiceCloner() {
  const [username, setUsername] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; username: string; samples: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!username.trim() || !topic.trim()) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/invent/voice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), topic: topic.trim(), language }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.text) setError(json?.error ?? "Something went wrong — try again.");
      else setResult(json);
    } catch {
      setError("Network error — please try again.");
    } finally { setLoading(false); }
  }

  async function copy() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.text); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`card ${invalid ? "shake" : ""}`} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Whose writing style to copy?</span>
          <div style={{ position: "relative" }}>
            <AtSign size={16} strokeWidth={1.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. a creator you admire"
              aria-label="Username to mimic" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={{ ...inputStyle, paddingLeft: 38 }} />
          </div>
        </div>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Your caption topic</span>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. my morning gym routine"
            aria-label="Caption topic" style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LANGS.map(([v, label]) => (
            <button key={v} className="chip" onClick={() => setLanguage(v)}
              style={{ cursor: "pointer", fontSize: 12, borderColor: language === v ? "var(--gold-400)" : undefined, color: language === v ? "var(--gold-ink)" : undefined, fontWeight: language === v ? 600 : 400 }}>
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 50, justifyContent: "center" }}>
          <Wand2 size={18} strokeWidth={1.5} /> {loading ? "Learning their voice…" : "Write in their voice"}
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <AlertTriangle size={20} strokeWidth={1.5} style={{ color: "var(--err)", flexShrink: 0 }} />
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {result && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="label" style={{ color: "var(--gold-ink)" }}>In @{result.username}&apos;s voice · learned from {result.samples} captions</span>
            <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13 }}>
              {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? "Copied" : "Copy all"}
            </button>
          </div>
          <div className="well" style={{ padding: 18, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)", lineHeight: 1.7 }}>{result.text}</div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Learns from public captions to match a writing style — write your own content, don&apos;t copy someone&apos;s posts word-for-word.
      </p>
    </div>
  );
}
