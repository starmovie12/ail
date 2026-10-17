"use client";
import { useState } from "react";
import { Copy, Check, EyeOff } from "lucide-react";

const CHARS: { name: string; char: string; code: string; use: string }[] = [
  { name: "Braille blank", char: "⠀", code: "U+2800", use: "The reliable one — survives Instagram captions, bios and comments. Use for blank lines." },
  { name: "Zero-width space", char: "​", code: "U+200B", use: "Invisible AND takes no width — for hidden word-breaks in long strings." },
  { name: "Hair space", char: " ", code: "U+200A", use: "The thinnest visible space — subtle letter spacing tricks." },
  { name: "En space", char: " ", code: "U+2002", use: "A wider space Instagram won't collapse like normal doubles." },
  { name: "Ideographic space", char: "　", code: "U+3000", use: "Extra-wide space — for dramatic gaps in names and bios." },
];

function CopyRow({ item }: { item: (typeof CHARS)[number] }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="well" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <b style={{ fontSize: 14 }}>{item.name} <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{item.code}</span></b>
        <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.5 }}>{item.use}</p>
      </div>
      <button className={`btn btn-secondary gold ${ok ? "tick" : ""}`} style={{ fontSize: 13 }}
        onClick={async () => {
          try { await navigator.clipboard.writeText(item.char); } catch { return; }
          setOk(true); setTimeout(() => setOk(false), 1400);
        }}>
        {ok ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
        {ok ? "Copied" : "Copy character"}
      </button>
    </div>
  );
}

export default function InvisibleChar() {
  const [testCopied, setTestCopied] = useState(false);
  const blankName = "⠀⠀";

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 12 }}>
      {CHARS.map((c) => <CopyRow key={c.code} item={c} />)}

      <div className="card" style={{ padding: 18, borderColor: "var(--gold-300)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <b style={{ fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <EyeOff size={15} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} /> Blank name preset
          </b>
          <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.5 }}>
            Two Braille blanks — paste into the Name field for an invisible display name.
          </p>
        </div>
        <button className={`btn btn-molten ${testCopied ? "tick" : ""}`} style={{ fontSize: 13 }}
          onClick={async () => {
            try { await navigator.clipboard.writeText(blankName); } catch { return; }
            setTestCopied(true); setTimeout(() => setTestCopied(false), 1400);
          }}>
          {testCopied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
          {testCopied ? "Copied" : "Copy blank name"}
        </button>
      </div>

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Tip: for clean caption line breaks, our caption fixer inserts these automatically on every blank line.
      </p>
    </div>
  );
}
