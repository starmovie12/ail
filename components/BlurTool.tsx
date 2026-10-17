"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, Download, Eraser, EyeOff } from "lucide-react";

type Mode = "pixelate" | "blur";

export default function BlurTool() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<Mode>("pixelate");
  const [brush, setBrush] = useState(36);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);

  function onFile(f: File | undefined) {
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = url;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const maxW = 1600;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [img]);

  function censorAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext("2d")!;
    const r = brush;
    const sx = Math.max(0, x - r), sy = Math.max(0, y - r);
    const sw = Math.min(canvas.width - sx, r * 2), sh = Math.min(canvas.height - sy, r * 2);
    if (sw <= 0 || sh <= 0) return;

    if (mode === "pixelate") {
      // Downscale the patch then draw it back up — classic mosaic censor.
      const patch = document.createElement("canvas");
      const cell = 10;
      patch.width = Math.max(1, Math.round(sw / cell));
      patch.height = Math.max(1, Math.round(sh / cell));
      const pctx = patch.getContext("2d")!;
      pctx.imageSmoothingEnabled = false;
      pctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, patch.width, patch.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(patch, 0, 0, patch.width, patch.height, sx, sy, sw, sh);
      ctx.imageSmoothingEnabled = true;
    } else {
      ctx.save();
      ctx.filter = "blur(12px)";
      ctx.drawImage(canvas, sx, sy, sw, sh, sx, sy, sw, sh);
      ctx.restore();
    }
  }

  function reset() {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.92);
    a.download = "instagrab-censored.jpg";
    a.click();
  }

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0])} />

      {!img ? (
        <button className="card" onClick={() => inputRef.current?.click()}
          style={{ padding: 48, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><EyeOff size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>Choose a screenshot or photo</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            Rub over faces, names or numbers to hide them — on-device.
          </span>
        </button>
      ) : (
        <>
          <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`btn ${mode === "pixelate" ? "btn-molten" : "btn-secondary"}`} onClick={() => setMode("pixelate")} style={{ fontSize: 13 }}>Pixelate</button>
              <button className={`btn ${mode === "blur" ? "btn-molten" : "btn-secondary"}`} onClick={() => setMode("blur")} style={{ fontSize: 13 }}>Blur</button>
            </div>
            <label className="mono" style={{ fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 160 }}>
              Brush {brush}px
              <input type="range" min={16} max={80} value={brush} onChange={(e) => setBrush(Number(e.target.value))}
                aria-label="Brush size" style={{ flex: 1, accentColor: "var(--gold-ink)" }} />
            </label>
            <button className="btn btn-ghost" onClick={reset} style={{ fontSize: 13 }}>
              <Eraser size={13} strokeWidth={1.5} /> Reset
            </button>
            <button className="btn btn-secondary gold" onClick={() => inputRef.current?.click()} style={{ fontSize: 13 }}>
              <Upload size={13} strokeWidth={1.5} /> New image
            </button>
          </div>

          <canvas
            ref={canvasRef}
            onPointerDown={(e) => { drawing.current = true; censorAt(e.clientX, e.clientY); }}
            onPointerMove={(e) => { if (drawing.current) censorAt(e.clientX, e.clientY); }}
            onPointerUp={() => { drawing.current = false; }}
            onPointerLeave={() => { drawing.current = false; }}
            style={{ width: "100%", height: "auto", borderRadius: 18, border: "1px solid var(--line)", display: "block", touchAction: "none", cursor: "crosshair" }}
          />

          <button className="btn btn-molten" onClick={download} style={{ height: 50, justifyContent: "center" }}>
            <Download size={16} strokeWidth={1.5} /> Download censored image
          </button>
        </>
      )}
      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Tip: pixelation is safer than light blur for hiding text — heavy mosaic can&apos;t be &ldquo;un-blurred&rdquo;.
        Everything stays on your device.
      </p>
    </div>
  );
}
