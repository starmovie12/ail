"use client";
import { useState } from "react";
import { Link2, Recycle, Copy, Check, AlertTriangle } from "lucide-react";

const LANGS: [string, string][] = [["english", "English"], ["hinglish", "Hinglish 🇮🇳"], ["hindi", "हिन्दी"]];

export default function ReelRepurposer() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("english");
  const [phase, setPhase] = useState<"idle" | "transcribing" | "repurposing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const busy = phase !== "idle";

  async function go() {
    if (busy) return;
    if (!/instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\//i.test(url.trim())) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300); return;
    }
    setError(null); setResult(null); setPhase("transcribing");
    try {
      const tRes = await fetch("/api/transcribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const tJson = await tRes.json().catch(() => null);
      if (!tRes.ok || !tJson?.transcript) { setError(tJson?.error ?? "Couldn't transcribe this reel."); setPhase("idle"); return; }

      setPhase("repurposing");
      const rRes = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "repurpose", language, inputs: { transcript: tJson.transcript } }),
      });
      const rJson = await rRes.json().catch(() => null);
      if (!rRes.ok || !rJson?.text) setError(rJson?.error ?? "Couldn't repurpose — try again.");
      else setResult(rJson.text);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPhase("idle");
    }
  }

  async function copy() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar rpbar ${busy ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <Link2 size={20} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
        <input value={url} disabled={busy} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Paste a reel link to repurpose into 6 pieces"
          aria-label="Reel link" style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }} />
        <button className="btn btn-molten" onClick={go} disabled={busy} style={{ height: 48 }}>
          <Recycle size={18} strokeWidth={1.5} /> <span>{phase === "transcribing" ? "Reading…" : phase === "repurposing" ? "Repurposing…" : "Repurpose"}</span>
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

      {busy && (
        <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
          {phase === "transcribing" ? "Reel ka script nikaal rahe hain…" : "6 content pieces bana rahe hain…"}
        </p>
      )}

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <AlertTriangle size={20} strokeWidth={1.5} style={{ color: "var(--err)", flexShrink: 0 }} />
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {result && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="label" style={{ color: "var(--gold-ink)" }}>1 reel → 6 pieces</span>
            <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13 }}>
              {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? "Copied" : "Copy all"}
            </button>
          </div>
          <div className="well" style={{ padding: 18, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)", lineHeight: 1.7, maxHeight: 520, overflowY: "auto" }}>{result}</div>
        </div>
      )}

      <style jsx>{`
        .rpbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .rpbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){ .rpbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; } }
      `}</style>
    </div>
  );
}
