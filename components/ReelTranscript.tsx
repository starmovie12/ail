"use client";
import { useState } from "react";
import { Link2, Mic, Copy, Check, AlertTriangle, Repeat2, Sparkles } from "lucide-react";

type Mode = "transcript" | "remix";
const LANGS: [string, string][] = [["english", "English"], ["hinglish", "Hinglish 🇮🇳"], ["hindi", "हिन्दी"]];

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button className={`btn btn-secondary gold ${ok ? "tick" : ""}`} style={{ fontSize: 13 }}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { return; }
        setOk(true); setTimeout(() => setOk(false), 1400);
      }}>
      {ok ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
      {ok ? "Copied" : "Copy"}
    </button>
  );
}

export default function ReelTranscript({ mode }: { mode: Mode }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  // Remix step 2
  const [niche, setNiche] = useState("");
  const [language, setLanguage] = useState("hinglish");
  const [remixing, setRemixing] = useState(false);
  const [remix, setRemix] = useState<string | null>(null);
  const [remixError, setRemixError] = useState<string | null>(null);

  async function go() {
    if (loading) return;
    if (!/instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\//i.test(url.trim())) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300);
      return;
    }
    setLoading(true); setError(null); setTranscript(null); setRemix(null);
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.transcript) setError(json?.error ?? "Something went wrong — please try again.");
      else setTranscript(json.transcript);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally { setLoading(false); }
  }

  async function doRemix() {
    if (remixing || !transcript) return;
    if (!niche.trim()) { setRemixError("Tell us your niche first — that's what we remix for."); return; }
    setRemixing(true); setRemixError(null); setRemix(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "remix", language, inputs: { transcript, niche } }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.text) setRemixError(json?.error ?? "Something went wrong — please try again.");
      else setRemix(json.text);
    } catch {
      setRemixError("Network error — please try again.");
    } finally { setRemixing(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar tbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><Link2 size={20} strokeWidth={1.5} /></span>
        <input
          value={url} disabled={loading}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Paste a reel link to extract its script"
          aria-label="Instagram reel link"
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Mic size={18} strokeWidth={1.5} />
          <span>{loading ? "Listening…" : "Get transcript"}</span>
        </button>
      </div>
      {loading && (
        <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
          Extracting audio → transcribing with AI. Takes 10–30 seconds for a typical reel…
        </p>
      )}

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {transcript && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="label" style={{ color: "var(--gold-ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Mic size={13} strokeWidth={1.5} /> Full transcript
            </span>
            <CopyBtn text={transcript} />
          </div>
          <div className="well" style={{ padding: 18, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)", lineHeight: 1.7, maxHeight: 340, overflowY: "auto" }}>
            {transcript}
          </div>
        </div>
      )}

      {mode === "remix" && transcript && (
        <div className="card intro-rise" style={{ padding: 20, borderColor: "var(--gold-300)" }}>
          <span className="label" style={{ color: "var(--gold-ink)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <Repeat2 size={13} strokeWidth={1.5} /> Step 2 — remix it for your niche
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
            <input value={niche} onChange={(e) => setNiche(e.target.value)}
              placeholder="Your niche — e.g. home bakery in Pune"
              aria-label="Your niche" style={inputStyle} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LANGS.map(([v, label]) => (
                <button key={v} className="chip" onClick={() => setLanguage(v)}
                  style={{ cursor: "pointer", borderColor: language === v ? "var(--gold-400)" : undefined, color: language === v ? "var(--gold-ink)" : undefined, fontWeight: language === v ? 600 : 400 }}>
                  {label}
                </button>
              ))}
            </div>
            <button className="btn btn-molten" onClick={doRemix} disabled={remixing} style={{ height: 50, justifyContent: "center" }}>
              <Sparkles size={18} strokeWidth={1.5} />
              <span>{remixing ? "Remixing…" : "Remix this formula"}</span>
            </button>
            {remixError && <p className="mono" style={{ color: "var(--err)", fontSize: 13 }}>{remixError}</p>}
          </div>
        </div>
      )}

      {remix && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="label" style={{ color: "var(--gold-ink)" }}>Your remixed package</span>
            <CopyBtn text={remix} />
          </div>
          <div className="well" style={{ padding: 18, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)", lineHeight: 1.7, maxHeight: 460, overflowY: "auto" }}>
            {remix}
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Use transcripts to study formats and structure — republishing someone&apos;s content word-for-word isn&apos;t cool (or legal).
        Nothing is stored on our servers.
      </p>

      <style jsx>{`
        .tbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .tbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .tbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
