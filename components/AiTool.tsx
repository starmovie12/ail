"use client";
import { useState } from "react";
import { Sparkles, Copy, Check, RefreshCw, AlertTriangle } from "lucide-react";
import type { AiToolDef } from "@/lib/ai-tools";

const LANGS: [string, string][] = [["english", "English"], ["hinglish", "Hinglish 🇮🇳"], ["hindi", "हिन्दी"]];

export default function AiTool({ def }: { def: AiToolDef }) {
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of def.fields) if (f.type === "select" && f.options?.length) init[f.id] = f.options[0][0];
    return init;
  });
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  function set(id: string, v: string) { setInputs((p) => ({ ...p, [id]: v })); }

  async function go() {
    if (loading) return;
    const missing = def.fields.some((f) => !f.optional && f.type !== "select" && !(inputs[f.id] ?? "").trim());
    if (missing) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: def.tool, inputs, language }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.text) setError(json?.error ?? "Something went wrong — please try again.");
      else setResult(json.text);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally { setLoading(false); }
  }

  async function copy() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`card ${invalid ? "shake" : ""}`} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {def.langAware && (
          <div>
            <span className="label" style={{ display: "block", marginBottom: 8 }}>Output language</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LANGS.map(([v, label]) => (
                <button key={v} className="chip" onClick={() => setLanguage(v)}
                  style={{ cursor: "pointer", borderColor: language === v ? "var(--gold-400)" : undefined, color: language === v ? "var(--gold-ink)" : undefined, fontWeight: language === v ? 600 : 400 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {def.fields.map((f) => (
          <div key={f.id}>
            <span className="label" style={{ display: "block", marginBottom: 8 }}>{f.label}</span>
            {f.type === "textarea" ? (
              <textarea value={inputs[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)}
                placeholder={f.placeholder} aria-label={f.label} rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
            ) : f.type === "select" ? (
              <select value={inputs[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)} aria-label={f.label}
                style={{ ...inputStyle, appearance: "auto" }}>
                {f.options?.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
              </select>
            ) : (
              <input value={inputs[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)}
                placeholder={f.placeholder} aria-label={f.label} style={inputStyle} />
            )}
          </div>
        ))}

        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 50, justifyContent: "center" }}>
          <Sparkles size={18} strokeWidth={1.5} className={loading ? "coin-in" : undefined} />
          <span>{loading ? "Thinking…" : def.button}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {result && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
            <span className="label" style={{ color: "var(--gold-ink)" }}>Your result</span>
            <span style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" onClick={go} disabled={loading} style={{ fontSize: 13 }}>
                <RefreshCw size={14} strokeWidth={1.5} /> Regenerate
              </button>
              <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13 }}>
                {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
                {copied ? "Copied" : "Copy all"}
              </button>
            </span>
          </div>
          <div className="well" style={{ padding: 18, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)", lineHeight: 1.7, maxHeight: 460, overflowY: "auto" }}>
            {result}
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Powered by AI — results are a starting point, add your own voice. Nothing you type is stored.
      </p>
    </div>
  );
}
