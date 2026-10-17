"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

/* Build a transform from base code points for A, a and 0, plus an exceptions
   map for the Unicode "holes" (letters that live elsewhere in the block). */
function make(baseUpper: number, baseLower: number, baseDigit: number | null, exc: Record<string, string> = {}) {
  return (s: string) =>
    [...s].map((ch) => {
      if (exc[ch]) return exc[ch];
      const c = ch.codePointAt(0)!;
      if (c >= 65 && c <= 90) return String.fromCodePoint(baseUpper + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(baseLower + (c - 97));
      if (baseDigit !== null && c >= 48 && c <= 57) return String.fromCodePoint(baseDigit + (c - 48));
      return ch;
    }).join("");
}

const SCRIPT_EXC: Record<string, string> = { B: "ℬ", E: "ℰ", F: "ℱ", H: "ℋ", I: "ℐ", L: "ℒ", M: "ℳ", R: "ℛ", e: "ℯ", g: "ℊ", o: "ℴ" };
const FRAKTUR_EXC: Record<string, string> = { C: "ℭ", H: "ℌ", I: "ℑ", R: "ℜ", Z: "ℨ" };
const DS_EXC: Record<string, string> = { C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ" };
const ITALIC_EXC: Record<string, string> = { h: "ℎ" };

const SMALLCAPS: Record<string, string> = {};
"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((u, i) => {
  const map = "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢ";
  SMALLCAPS[u.toLowerCase()] = map[i];
});
const smallcaps = (s: string) => [...s].map((c) => SMALLCAPS[c.toLowerCase()] ?? c).join("");

const STYLES: { name: string; fn: (s: string) => string }[] = [
  { name: "Bold", fn: make(0x1d400, 0x1d41a, 0x1d7ce) },
  { name: "Italic", fn: make(0x1d434, 0x1d44e, null, ITALIC_EXC) },
  { name: "Bold Italic", fn: make(0x1d468, 0x1d482, null) },
  { name: "Script", fn: make(0x1d49c, 0x1d4b6, null, SCRIPT_EXC) },
  { name: "Bold Script", fn: make(0x1d4d0, 0x1d4ea, null) },
  { name: "Fraktur", fn: make(0x1d504, 0x1d51e, null, FRAKTUR_EXC) },
  { name: "Bold Fraktur", fn: make(0x1d56c, 0x1d586, null) },
  { name: "Double-struck", fn: make(0x1d538, 0x1d552, 0x1d7d8, DS_EXC) },
  { name: "Sans", fn: make(0x1d5a0, 0x1d5ba, 0x1d7e2) },
  { name: "Sans Bold", fn: make(0x1d5d4, 0x1d5ee, 0x1d7ec) },
  { name: "Sans Italic", fn: make(0x1d608, 0x1d622, null) },
  { name: "Monospace", fn: make(0x1d670, 0x1d68a, 0x1d7f6) },
  { name: "Circled", fn: make(0x24b6, 0x24d0, null) },
  { name: "Squared", fn: make(0x1f130, 0x1f130, null) },
  { name: "Fullwidth", fn: make(0xff21, 0xff41, 0xff10) },
  { name: "Small Caps", fn: smallcaps },
];

function Row({ name, text }: { name: string; text: string }) {
  const [ok, setOk] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setOk(true); setTimeout(() => setOk(false), 1400);
  }
  return (
    <button onClick={copy} className={`card fontrow ${ok ? "tick" : ""}`} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      padding: "12px 16px", width: "100%", textAlign: "left", cursor: "pointer",
    }}>
      <span style={{ fontSize: 18, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
      <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: ok ? "var(--gold-ink)" : "var(--ink-3)", flexShrink: 0 }}>
        {ok ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
        {ok ? "Copied" : name}
      </span>
    </button>
  );
}

export default function FontGenerator() {
  const [text, setText] = useState("");
  const sample = text || "Your name here";
  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left" }}>
      <div className="bar" style={{ display: "flex", alignItems: "center", height: 64, padding: "8px 8px 8px 20px", maxWidth: 720, margin: "0 auto" }}>
        <input
          value={text} onChange={(e) => setText(e.target.value)} maxLength={120}
          placeholder="Type your name or bio…" aria-label="Text to style"
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        {STYLES.map((s) => <Row key={s.name} name={s.name} text={s.fn(sample)} />)}
      </div>
      <style jsx>{`
        .fontrow{ transition:border-color 200ms var(--ease-silk), transform 120ms var(--ease-silk); background:var(--surface); }
        .fontrow:hover{ border-color:var(--gold-400); }
        .fontrow:active{ transform:translateY(1px); }
      `}</style>
    </div>
  );
}
