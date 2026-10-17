"use client";
import { useRef, useState } from "react";
import { Upload, Download, Scaling } from "lucide-react";

type Preset = { id: string; label: string; w: number; h: number };
const PRESETS: Preset[] = [
  { id: "square", label: "Post · square 1:1", w: 1080, h: 1080 },
  { id: "portrait", label: "Post · portrait 4:5", w: 1080, h: 1350 },
  { id: "landscape", label: "Post · landscape 1.91:1", w: 1080, h: 566 },
  { id: "story", label: "Story / Reel 9:16", w: 1080, h: 1920 },
  { id: "cover", label: "Reel cover 9:16", w: 1080, h: 1920 },
  { id: "dp", label: "Profile picture", w: 320, h: 320 },
];

type Fit = "cover" | "contain";

function render(img: HTMLImageElement, preset: Preset, fit: Fit): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = preset.w; canvas.height = preset.h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  const scale = fit === "cover"
    ? Math.max(preset.w / img.width, preset.h / img.height)
    : Math.min(preset.w / img.width, preset.h / img.height);
  const w = img.width * scale, h = img.height * scale;
  const x = (preset.w - w) / 2, y = (preset.h - h) / 2;

  if (fit === "contain") {
    // Blurred cover of the same image as background — the classic IG pad look.
    const bs = Math.max(preset.w / img.width, preset.h / img.height) * 1.1;
    const bw = img.width * bs, bh = img.height * bs;
    ctx.filter = "blur(40px) brightness(.9)";
    ctx.drawImage(img, (preset.w - bw) / 2, (preset.h - bh) / 2, bw, bh);
    ctx.filter = "none";
  }
  ctx.drawImage(img, x, y, w, h);
  return canvas;
}

export default function PhotoResizer() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [preset, setPreset] = useState("portrait");
  const [fit, setFit] = useState<Fit>("cover");
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | undefined) {
    if (!f || !f.type.startsWith("image/")) return;
    setFileName(f.name.replace(/\.\w+$/, ""));
    const url = URL.createObjectURL(f);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      const p = PRESETS.find((x) => x.id === preset)!;
      setPreview(render(image, p, fit).toDataURL("image/jpeg", 0.92));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  function update(nextPreset: string, nextFit: Fit) {
    setPreset(nextPreset); setFit(nextFit);
    if (img) {
      const p = PRESETS.find((x) => x.id === nextPreset)!;
      setPreview(render(img, p, nextFit).toDataURL("image/jpeg", 0.92));
    }
  }

  function download() {
    if (!img) return;
    const p = PRESETS.find((x) => x.id === preset)!;
    const canvas = render(img, p, fit);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.92);
    a.download = `${fileName || "photo"}-${p.w}x${p.h}.jpg`;
    a.click();
  }

  const active = PRESETS.find((x) => x.id === preset)!;

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => onFile(e.target.files?.[0])} />

      {!img ? (
        <button className="card" onClick={() => inputRef.current?.click()}
          style={{ padding: 48, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><Upload size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>Choose a photo</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            Stays on your device — nothing is uploaded.
          </span>
        </button>
      ) : (
        <>
          <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <span className="label" style={{ display: "block", marginBottom: 8 }}>Size preset</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRESETS.map((p) => (
                  <button key={p.id} className="chip" onClick={() => update(p.id, fit)}
                    style={{ cursor: "pointer", borderColor: preset === p.id ? "var(--gold-400)" : undefined, color: preset === p.id ? "var(--gold-ink)" : undefined, fontWeight: preset === p.id ? 600 : 400 }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className="label">Fit:</span>
              <button className={`btn ${fit === "cover" ? "btn-molten" : "btn-secondary"}`} onClick={() => update(preset, "cover")} style={{ fontSize: 13 }}>Crop to fill</button>
              <button className={`btn ${fit === "contain" ? "btn-molten" : "btn-secondary"}`} onClick={() => update(preset, "contain")} style={{ fontSize: 13 }}>Fit with blur pad</button>
              <button className="btn btn-ghost" onClick={() => inputRef.current?.click()} style={{ fontSize: 13, marginLeft: "auto" }}>
                <Upload size={14} strokeWidth={1.5} /> Change photo
              </button>
            </div>
          </div>

          {preview && (
            <div className="card intro-rise" style={{ padding: 20, textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Resized preview"
                style={{ maxWidth: "100%", maxHeight: 440, borderRadius: 14, border: "1px solid var(--line)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 16, flexWrap: "wrap" }}>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Scaling size={13} strokeWidth={1.5} /> {active.w} × {active.h}px
                </span>
                <button className="btn btn-molten" onClick={download}>
                  <Download size={16} strokeWidth={1.5} /> Download JPG
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        100% client-side — your photo never leaves this device. Exports at Instagram&apos;s recommended
        resolutions so the app doesn&apos;t re-crush your quality.
      </p>
    </div>
  );
}
