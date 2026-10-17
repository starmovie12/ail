"use client";
import { useRef, useState } from "react";
import { Upload, Download } from "lucide-react";

type Filter = { id: string; label: string; css: string };
const FILTERS: Filter[] = [
  { id: "original", label: "Original", css: "none" },
  { id: "golden", label: "Golden hour", css: "sepia(.25) saturate(1.3) brightness(1.05) contrast(1.02)" },
  { id: "fade", label: "Soft fade", css: "contrast(.9) brightness(1.1) saturate(.85)" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.15) brightness(.95)" },
  { id: "silver", label: "Silver", css: "grayscale(.7) brightness(1.08) contrast(.95)" },
  { id: "vivid", label: "Vivid", css: "saturate(1.5) contrast(1.1)" },
  { id: "warm", label: "Warm", css: "sepia(.35) saturate(1.15) hue-rotate(-8deg)" },
  { id: "cool", label: "Cool", css: "saturate(1.05) hue-rotate(12deg) brightness(1.02)" },
  { id: "vintage", label: "Vintage", css: "sepia(.5) contrast(.92) brightness(1.05) saturate(.9)" },
  { id: "dramatic", label: "Dramatic", css: "contrast(1.3) brightness(.92) saturate(1.1)" },
  { id: "pastel", label: "Pastel", css: "saturate(.7) brightness(1.12) contrast(.88)" },
  { id: "sunset", label: "Sunset", css: "sepia(.2) saturate(1.4) hue-rotate(-15deg) brightness(1.02)" },
  { id: "matte", label: "Matte", css: "contrast(.85) brightness(1.05) saturate(1.05)" },
  { id: "punch", label: "Punch", css: "contrast(1.2) saturate(1.35) brightness(1.02)" },
  { id: "dream", label: "Dream", css: "brightness(1.08) saturate(1.1) blur(0.4px) contrast(.95)" },
];

export default function PhotoFilters() {
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [active, setActive] = useState("original");
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | undefined) {
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    const image = new Image();
    image.onload = () => { setImg(image); setSrc(url); };
    image.src = url;
  }

  function download() {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.filter = FILTERS.find((f) => f.id === active)?.css ?? "none";
    ctx.drawImage(img, 0, 0);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.92);
    a.download = `instagrab-${active}.jpg`;
    a.click();
  }

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0])} />

      {!src ? (
        <button className="card" onClick={() => inputRef.current?.click()}
          style={{ padding: 48, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><Upload size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>Choose a photo</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            15 filters, live preview — on-device, nothing uploaded.
          </span>
        </button>
      ) : (
        <>
          <div className="card intro-rise" style={{ padding: 16, textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Filtered preview"
              style={{ maxWidth: "100%", maxHeight: 420, borderRadius: 14, border: "1px solid var(--line)", filter: FILTERS.find((f) => f.id === active)?.css }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button className="btn btn-molten" onClick={download}>
                <Download size={16} strokeWidth={1.5} /> Download with “{FILTERS.find((f) => f.id === active)?.label}”
              </button>
              <button className="btn btn-ghost" onClick={() => inputRef.current?.click()} style={{ fontSize: 13 }}>
                <Upload size={14} strokeWidth={1.5} /> Change photo
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, WebkitMaskImage: "linear-gradient(90deg,#000 94%,transparent)" }}>
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setActive(f.id)}
                style={{ flexShrink: 0, width: 86, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                aria-label={`Apply ${f.label} filter`}>
                <span style={{ display: "block", width: 86, height: 86, borderRadius: 12, overflow: "hidden", border: active === f.id ? "2px solid var(--gold-400)" : "1px solid var(--line)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: f.css }} />
                </span>
                <span className="mono" style={{ display: "block", fontSize: 10, color: active === f.id ? "var(--gold-ink)" : "var(--ink-3)", marginTop: 5, textAlign: "center" }}>{f.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Filters render on your device via canvas — the export matches the preview exactly, at full resolution.
      </p>
    </div>
  );
}
