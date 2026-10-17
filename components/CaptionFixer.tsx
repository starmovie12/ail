"use client";
import { useMemo, useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";

// Braille blank — an invisible, non-collapsing character Instagram keeps on
// otherwise-empty lines, so your line breaks survive copy-paste.
const FILLER = "⠀";

function fix(input: string, keepBlankLines: boolean): string {
  const lines = input.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/g, ""));
  if (!keepBlankLines) return lines.join("\n");
  return lines.map((l) => (l.trim() === "" ? FILLER : l)).join("\n");
}

export default function CaptionFixer() {
  const [text, setText] = useState("");
  const [keep, setKeep] = useState(true);
  const [copied, setCopied] = useState(false);
  const output = useMemo(() => fix(text, keep), [text, keep]);

  async function copy() {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  const chars = text.length;
  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="label">Your caption</span>
          <span className="mono" style={{ fontSize: 12, color: chars > 2200 ? "var(--err)" : "var(--ink-3)" }}>{chars}/2200</span>
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder={"Paste or write your caption with the exact\nline breaks\n\nand spacing you want…"}
          aria-label="Caption input"
          rows={7}
          style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, fontSize: 15, color: "var(--ink)", resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "var(--t-small)", color: "var(--ink-2)", cursor: "pointer" }}>
        <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--gold-500)" }} />
        Keep blank lines (adds an invisible character so Instagram doesn&apos;t collapse them)
      </label>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="label">Instagram-ready</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setText("")} disabled={!text} style={{ fontSize: 13 }}>
              <Trash2 size={14} strokeWidth={1.5} /> Clear
            </button>
            <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} disabled={!output} style={{ fontSize: 13 }}>
              {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <div className="well" style={{ padding: 16, minHeight: 120, whiteSpace: "pre-wrap", fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6 }}>
          {output || <span style={{ color: "var(--ink-3)" }}>Your fixed caption appears here…</span>}
        </div>
      </div>
    </div>
  );
}
