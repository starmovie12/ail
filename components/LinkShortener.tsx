"use client";
import { useState } from "react";
import { Link2, Scissors, Copy, Check, AlertTriangle } from "lucide-react";

export default function LinkShortener() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [short, setShort] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!url.trim().includes(".")) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    setLoading(true); setError(null); setShort(null);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.short) setError(json?.error ?? "Something went wrong — try again.");
      else setShort(`${location.origin}${json.short}`);
    } catch {
      setError("Network error — please try again.");
    } finally { setLoading(false); }
  }

  async function copy() {
    if (!short) return;
    try { await navigator.clipboard.writeText(short); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar lsbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><Link2 size={20} strokeWidth={1.5} /></span>
        <input
          value={url} disabled={loading}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Paste the long link you want to shorten"
          aria-label="Link to shorten"
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Scissors size={18} strokeWidth={1.5} />
          <span>{loading ? "Shortening…" : "Shorten"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--warn) 45%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--warn)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {short && (
        <div className="card intro-rise" style={{ padding: 20, borderColor: "var(--gold-300)" }}>
          <span className="label" style={{ color: "var(--gold-ink)", display: "block", marginBottom: 10 }}>Your short link ✂️</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <code className="well mono" style={{ padding: "12px 14px", fontSize: 14, color: "var(--gold-ink)", flex: "1 1 220px", overflowWrap: "anywhere" }}>{short}</code>
            <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13 }}>
              {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 12 }}>
            Valid for one year. Pair it with the UTM builder first so the clicks show up labelled in your analytics.
          </p>
        </div>
      )}
    </div>
  );
}
