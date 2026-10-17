"use client";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";

type Mode = { id: string; label: string; limit: number; hint: string };
const MODES: Mode[] = [
  { id: "caption", label: "Caption", limit: 2200, hint: "Only ~125 characters show before the “… more” fold — put your hook there." },
  { id: "bio", label: "Bio", limit: 150, hint: "Line breaks count too. Keep it scannable: who you are + what you post + CTA." },
  { id: "username", label: "Username", limit: 30, hint: "Lowercase letters, numbers, dots and underscores only." },
  { id: "comment", label: "Comment", limit: 2200, hint: "Same ceiling as captions — 2,200 characters." },
];

const FOLD = 125; // caption preview cutoff before "… more"

export default function CharCounter() {
  const [mode, setMode] = useState("caption");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const m = MODES.find((x) => x.id === mode) ?? MODES[0];

  const stats = useMemo(() => {
    const chars = [...text].length; // count code points, not UTF-16 units — emoji-safe
    const words = (text.trim().match(/\S+/g) ?? []).length;
    const lines = text ? text.split("\n").length : 0;
    const hashtags = (text.match(/#[\p{L}\p{N}_]+/gu) ?? []).length;
    const mentions = (text.match(/@[\w.]+/g) ?? []).length;
    return { chars, words, lines, hashtags, mentions };
  }, [text]);

  const over = stats.chars > m.limit;
  const pct = Math.min(100, (stats.chars / m.limit) * 100);
  const barColor = over ? "var(--err)" : pct > 90 ? "var(--warn)" : "var(--gold-ink)";

  async function copy() {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((x) => (
          <button key={x.id} className="chip" onClick={() => setMode(x.id)}
            style={{ cursor: "pointer", borderColor: mode === x.id ? "var(--gold-400)" : undefined, color: mode === x.id ? "var(--gold-ink)" : undefined, fontWeight: mode === x.id ? 600 : 400 }}>
            {x.label} · {x.limit.toLocaleString()}
          </button>
        ))}
      </div>

      <div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder={`Write or paste your ${m.label.toLowerCase()} here…`}
          aria-label={`${m.label} text`} rows={7}
          style={{ width: "100%", background: "var(--surface)", border: `1px solid ${over ? "color-mix(in srgb, var(--err) 50%, var(--line))" : "var(--line)"}`, borderRadius: 16, padding: 16, fontSize: 15, color: "var(--ink)", resize: "vertical", lineHeight: 1.6 }}
        />
        <div aria-hidden="true" style={{ height: 6, borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--line)", marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 99, transition: "width 200ms var(--ease-silk)" }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: over ? "var(--err)" : "var(--ink)" }}>
          {stats.chars.toLocaleString()} / {m.limit.toLocaleString()}
          {over
            ? ` — ${(stats.chars - m.limit).toLocaleString()} over the limit`
            : ` — ${(m.limit - stats.chars).toLocaleString()} left`}
        </span>
        {text && (
          <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13 }}>
            {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
            {copied ? "Copied" : "Copy text"}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12 }}>
        {([
          ["Words", stats.words],
          ["Lines", stats.lines],
          ["Hashtags", stats.hashtags],
          ["Mentions", stats.mentions],
        ] as [string, number][]).map(([k, v]) => (
          <div key={k} className="well" style={{ padding: 14, textAlign: "center" }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: k === "Hashtags" && v > 30 ? "var(--err)" : undefined }}>{v}</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{k}{k === "Hashtags" ? " (max 30)" : ""}</div>
          </div>
        ))}
      </div>

      {mode === "caption" && stats.chars > 0 && (
        <p className="mono" style={{ fontSize: 12, color: stats.chars > FOLD ? "var(--warn)" : "var(--ok)", lineHeight: 1.6 }}>
          {stats.chars > FOLD
            ? `Heads-up: only the first ~${FOLD} characters show before “… more”. Your fold line is: “${[...text].slice(0, FOLD).join("").split("\n")[0].slice(-60)}”`
            : "Your whole caption fits above the “… more” fold. 👌"}
        </p>
      )}
      <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>{m.hint}</p>
    </div>
  );
}
