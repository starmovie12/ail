"use client";
import { useRef, useState } from "react";
import { Upload, Download, RefreshCw } from "lucide-react";

const RINGS: { name: string; stops: string[] }[] = [
  { name: "Story", stops: ["#feda75", "#fa7e1e", "#d62976", "#962fbf", "#4f5bd5"] },
  { name: "Brand", stops: ["#22E4FF", "#6366F1", "#D946EF", "#22E4FF"] },
  { name: "Sunset", stops: ["#ff9a9e", "#fad0c4", "#fbc2eb", "#a18cd1"] },
  { name: "Ocean", stops: ["#43e97b", "#38f9d7", "#38a1f9", "#5b6bf9"] },
];

export default function DpRingMaker() {
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [ring, setRing] = useState(0);
  const [out, setOut] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function render(img: HTMLImageElement, ringIdx: number) {
    const S = 640, pad = 26, gap = 12;
    const cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    const ctx = cv.getContext("2d")!;
    const cx = S / 2, cy = S / 2;

    // Gradient ring
    const g = ctx.createLinearGradient(0, 0, S, S);
    const stops = RINGS[ringIdx].stops;
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.beginPath();
    ctx.arc(cx, cy, S / 2 - pad / 2, 0, Math.PI * 2);
    ctx.lineWidth = pad;
    ctx.strokeStyle = g;
    ctx.stroke();

    // Circular photo, centre-cropped
    const R = S / 2 - pad - gap;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    const side = Math.min(img.width, img.height);
    const ox = (img.width - side) / 2, oy = (img.height - side) / 2;
    ctx.drawImage(img, ox, oy, side, side, cx - R, cy - R, R * 2, R * 2);
    ctx.restore();

    setOut(cv.toDataURL("image/png"));
  }

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const img = new Image();
    img.onload = () => { setImgEl(img); render(img, ring); };
    img.src = URL.createObjectURL(file);
  }

  function pick(i: number) { setRing(i); if (imgEl) render(imgEl, i); }

  return (
    <div style={{ width: "100%", maxWidth: 520, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />

      {!out ? (
        <button className="card" onClick={() => inputRef.current?.click()} style={{
          padding: "48px 24px", cursor: "pointer", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 12, borderStyle: "dashed", borderColor: "var(--gold-300)",
        }}>
          <span className="medallion"><Upload size={24} strokeWidth={1.5} /></span>
          <b>Upload your profile photo</b>
          <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>We add a story-style gradient ring — all in your browser.</span>
        </button>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={out} alt="Profile picture with ring" style={{ width: 280, height: 280, margin: "0 auto", display: "block" }} />
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {RINGS.map((r, i) => (
              <button key={r.name} onClick={() => pick(i)} className="btn btn-secondary" style={{
                fontSize: 13, borderColor: i === ring ? "var(--gold-400)" : undefined, color: i === ring ? "var(--gold-ink)" : undefined,
              }}>{r.name}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-molten" href={out} download="instagrab-dp-ring.png" style={{ height: 48 }}>
              <Download size={18} strokeWidth={1.5} /> Download PNG
            </a>
            <button className="btn btn-secondary" onClick={() => { setOut(null); setImgEl(null); }} style={{ height: 48 }}>
              <RefreshCw size={16} strokeWidth={1.5} /> New photo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
