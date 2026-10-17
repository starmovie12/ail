"use client";
import { useRef, useState } from "react";
import { Upload, Package, Loader2, Grid3x3 } from "lucide-react";

type Piece = { url: string; row: number; col: number };

export default function GridSplitter() {
  const [src, setSrc] = useState<string | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setBusy(true); setPieces([]);
    const url = URL.createObjectURL(file);
    setSrc(url);
    const img = new Image();
    img.onload = () => {
      // Square-crop from the centre, then cut into 3×3.
      const side = Math.min(img.width, img.height);
      const ox = (img.width - side) / 2, oy = (img.height - side) / 2;
      const cell = Math.floor(side / 3);
      const out: Piece[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const cv = document.createElement("canvas");
          cv.width = cell; cv.height = cell;
          const ctx = cv.getContext("2d")!;
          ctx.drawImage(img, ox + c * cell, oy + r * cell, cell, cell, 0, 0, cell, cell);
          out.push({ url: cv.toDataURL("image/jpeg", 0.92), row: r, col: c });
        }
      }
      setPieces(out); setBusy(false);
    };
    img.onerror = () => setBusy(false);
    img.src = url;
  }

  async function downloadZip() {
    if (!pieces.length) return;
    setBusy(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      pieces.forEach((p) => {
        const b64 = p.url.split(",")[1];
        // Upload order for a 3×3 grid: post bottom-right last so it lands top-left.
        const n = p.row * 3 + p.col + 1;
        zip.file(`grid-${n}-r${p.row + 1}c${p.col + 1}.jpg`, b64, { base64: true });
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "instagrab-9grid.zip"; a.click();
      URL.revokeObjectURL(url);
    } finally { setBusy(false); }
  }

  return (
    <div style={{ width: "100%", maxWidth: 620, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />

      {!pieces.length && (
        <button className="card" onClick={() => inputRef.current?.click()} style={{
          padding: "48px 24px", cursor: "pointer", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 12, borderStyle: "dashed", borderColor: "var(--gold-300)",
        }}>
          <span className="medallion"><Upload size={24} strokeWidth={1.5} /></span>
          <b>Upload a photo</b>
          <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>It&apos;s cropped to a square and cut into a 3×3 grid — in your browser.</span>
        </button>
      )}

      {pieces.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)" }}>
            {pieces.map((p, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={p.url} alt={`Tile ${i + 1}`} style={{ width: "100%", display: "block", aspectRatio: "1/1", objectFit: "cover" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-molten" onClick={downloadZip} disabled={busy} style={{ height: 48 }}>
              {busy ? <Loader2 size={18} strokeWidth={1.5} className="spin-loop" /> : <Package size={18} strokeWidth={1.5} />}
              Download 9 tiles (ZIP)
            </button>
            <button className="btn btn-secondary" onClick={() => { setPieces([]); setSrc(null); }} style={{ height: 48 }}>
              <Grid3x3 size={16} strokeWidth={1.5} /> New image
            </button>
          </div>
          <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
            Upload tiles bottom-right first (9 → 1) so they line up as a grid on your profile.
          </p>
        </>
      )}
      {src && !pieces.length && busy && <p className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>Slicing…</p>}
      <style jsx>{`.spin-loop{ animation:spin 900ms linear infinite; } @keyframes spin{ to{ transform:rotate(360deg); } }`}</style>
    </div>
  );
}
