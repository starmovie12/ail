"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Quote } from "lucide-react";

type Theme = { id: string; label: string; bg: [string, string]; ink: string; accent: string };
const THEMES: Theme[] = [
  { id: "ivory", label: "Ivory & indigo", bg: ["#F4F6FF", "#E1E6FB"], ink: "#0B1030", accent: "#4F46E5" },
  { id: "noir", label: "Noir & cyan", bg: ["#050B24", "#101842"], ink: "#F1F5FF", accent: "#22E4FF" },
  { id: "blush", label: "Blush", bg: ["#FCEEF0", "#F8D8DD"], ink: "#4A2B33", accent: "#B0566B" },
  { id: "sage", label: "Sage", bg: ["#EEF3EA", "#D7E3D0"], ink: "#2C3B28", accent: "#5E7A52" },
  { id: "ocean", label: "Midnight", bg: ["#0E1B2C", "#16283E"], ink: "#E8EEF5", accent: "#7FA8D0" },
];

type Size = { id: string; label: string; w: number; h: number };
const SIZES: Size[] = [
  { id: "post", label: "Post 1:1", w: 1080, h: 1080 },
  { id: "portrait", label: "Post 4:5", w: 1080, h: 1350 },
  { id: "story", label: "Story 9:16", w: 1080, h: 1920 },
];

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(""); continue; }
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; }
      else line = test;
    }
    out.push(line);
  }
  return out;
}

function draw(canvas: HTMLCanvasElement, quote: string, author: string, theme: Theme, size: Size) {
  canvas.width = size.w; canvas.height = size.h;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, size.w, size.h);
  g.addColorStop(0, theme.bg[0]); g.addColorStop(1, theme.bg[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size.w, size.h);

  // Thin accent frame
  ctx.strokeStyle = theme.accent; ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, size.w - 96, size.h - 96);

  // Decorative quotation mark
  ctx.fillStyle = theme.accent;
  ctx.font = "700 220px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("“", size.w / 2, size.h * 0.24);

  // Quote text — auto-size to fit
  const maxW = size.w - 220;
  let fontSize = 72;
  let lines: string[];
  do {
    ctx.font = `italic 600 ${fontSize}px Georgia, serif`;
    lines = wrapLines(ctx, quote || "Your quote here", maxW);
    fontSize -= 4;
  } while (lines.length * fontSize * 1.4 > size.h * 0.5 && fontSize > 26);
  fontSize += 4;

  const lh = fontSize * 1.4;
  const startY = size.h / 2 - ((lines.length - 1) * lh) / 2;
  ctx.fillStyle = theme.ink;
  lines.forEach((line, i) => ctx.fillText(line, size.w / 2, startY + i * lh));

  // Author
  if (author.trim()) {
    ctx.fillStyle = theme.accent;
    ctx.font = "500 34px Georgia, serif";
    ctx.fillText("— " + author.trim(), size.w / 2, startY + lines.length * lh + 40);
  }
}

export default function QuoteMaker() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [themeId, setThemeId] = useState("ivory");
  const [sizeId, setSizeId] = useState("post");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const theme = THEMES.find((t) => t.id === themeId)!;
  const size = SIZES.find((s) => s.id === sizeId)!;

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, quote, author, theme, size);
  }, [quote, author, theme, size]);

  function download() {
    const canvas = document.createElement("canvas");
    draw(canvas, quote, author, theme, size);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `instagrab-quote-${size.id}.png`;
    a.click();
  }

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Your quote</span>
          <textarea value={quote} onChange={(e) => setQuote(e.target.value)}
            placeholder={"Kaam bolta hai.\nBaaki sab bakwaas hai."} aria-label="Quote text" rows={4}
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 14, fontSize: 15, color: "var(--ink)", resize: "vertical", lineHeight: 1.6 }} />
        </div>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Author / handle (optional)</span>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="@yourhandle"
            aria-label="Author" style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "12px 14px", fontSize: 15, color: "var(--ink)" }} />
        </div>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Theme</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {THEMES.map((t) => (
              <button key={t.id} className="chip" onClick={() => setThemeId(t.id)}
                style={{ cursor: "pointer", borderColor: themeId === t.id ? "var(--gold-400)" : undefined, fontWeight: themeId === t.id ? 600 : 400 }}>
                <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 99, background: `linear-gradient(135deg, ${t.bg[0]}, ${t.bg[1]})`, border: `1.5px solid ${t.accent}`, display: "inline-block" }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Size</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SIZES.map((s) => (
              <button key={s.id} className="chip" onClick={() => setSizeId(s.id)}
                style={{ cursor: "pointer", borderColor: sizeId === s.id ? "var(--gold-400)" : undefined, color: sizeId === s.id ? "var(--gold-ink)" : undefined, fontWeight: sizeId === s.id ? 600 : 400 }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-molten" onClick={download} style={{ height: 50, justifyContent: "center" }}>
          <Download size={16} strokeWidth={1.5} /> Download PNG
        </button>
      </div>

      <div>
        <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Quote size={13} strokeWidth={1.5} /> Live preview
        </span>
        <canvas ref={canvasRef}
          style={{ width: "100%", height: "auto", borderRadius: 18, border: "1px solid var(--line)", display: "block" }} />
      </div>
    </div>
  );
}
