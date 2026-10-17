"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

const SMALL_CAPS: Record<string, string> = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ",
  k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "ꜱ", t: "ᴛ",
  u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ",
};

const CONVERTERS: { name: string; fn: (s: string) => string }[] = [
  { name: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { name: "lowercase", fn: (s) => s.toLowerCase() },
  { name: "Title Case", fn: (s) => s.toLowerCase().replace(/(^|\s|[-"'(])(\p{L})/gu, (m, pre, ch) => pre + ch.toUpperCase()) },
  { name: "Sentence case", fn: (s) => s.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toUpperCase()) },
  { name: "aLtErNaTiNg", fn: (s) => [...s].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("") },
  { name: "ꜱᴍᴀʟʟ ᴄᴀᴘꜱ", fn: (s) => [...s.toLowerCase()].map((c) => SMALL_CAPS[c] ?? c).join("") },
  { name: "rEVERSE cASE", fn: (s) => [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("") },
];

function Row({ name, value }: { name: string; value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="well" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="label" style={{ display: "block", fontSize: 9, marginBottom: 4 }}>{name}</span>
        <div style={{ fontSize: 14, color: "var(--ink)", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{value || "—"}</div>
      </div>
      <button className={`btn btn-secondary ${ok ? "gold tick" : ""}`} style={{ fontSize: 12, flexShrink: 0 }}
        onClick={async () => {
          if (!value) return;
          try { await navigator.clipboard.writeText(value); } catch { return; }
          setOk(true); setTimeout(() => setOk(false), 1400);
        }}>
        {ok ? <Check size={13} strokeWidth={2} className="coin-in" /> : <Copy size={13} strokeWidth={1.5} />}
      </button>
    </div>
  );
}

export default function CaseConverter() {
  const [text, setText] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your caption / bio text here…"
        aria-label="Text to convert" rows={4}
        style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, fontSize: 15, color: "var(--ink)", resize: "vertical", lineHeight: 1.6 }}
      />
      {text && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CONVERTERS.map((c) => <Row key={c.name} name={c.name} value={c.fn(text)} />)}
        </div>
      )}
      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Small caps use special Unicode letters that work in bios and captions.
        Want 15+ more fancy styles? Try the font generator.
      </p>
    </div>
  );
}
