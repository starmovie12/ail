"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, Download, LayoutGrid, Trash2 } from "lucide-react";

type Layout = { id: string; label: string; cells: [number, number, number, number][] }; // x,y,w,h in fractions
const LAYOUTS: Layout[] = [
  { id: "2v", label: "2 side-by-side", cells: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]] },
  { id: "2h", label: "2 stacked", cells: [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]] },
  { id: "3l", label: "1 big + 2", cells: [[0, 0, 0.6, 1], [0.6, 0, 0.4, 0.5], [0.6, 0.5, 0.4, 0.5]] },
  { id: "4g", label: "4 grid", cells: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]] },
  { id: "6g", label: "6 grid", cells: [[0, 0, 1 / 3, 0.5], [1 / 3, 0, 1 / 3, 0.5], [2 / 3, 0, 1 / 3, 0.5], [0, 0.5, 1 / 3, 0.5], [1 / 3, 0.5, 1 / 3, 0.5], [2 / 3, 0.5, 1 / 3, 0.5]] },
  { id: "9g", label: "9 grid", cells: Array.from({ length: 9 }, (_, i) => [(i % 3) / 3, Math.floor(i / 3) / 3, 1 / 3, 1 / 3] as [number, number, number, number]) },
];

const SIZE = 1080;

function drawCollage(canvas: HTMLCanvasElement, imgs: HTMLImageElement[], layout: Layout, gap: number, gold: boolean) {
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  if (gold) {
    const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    g.addColorStop(0, "#22E4FF"); g.addColorStop(0.5, "#6366F1"); g.addColorStop(1, "#D946EF");
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = "#FFFFFF";
  }
  ctx.fillRect(0, 0, SIZE, SIZE);

  layout.cells.forEach((cell, i) => {
    const img = imgs[i];
    if (!img) return;
    const x = cell[0] * SIZE + gap, y = cell[1] * SIZE + gap;
    const w = cell[2] * SIZE - gap * 2, h = cell[3] * SIZE - gap * 2;
    // Cover-fit crop into the cell.
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale, sh = h / scale;
    const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  });
}

export default function CollageMaker() {
  const [imgs, setImgs] = useState<HTMLImageElement[]>([]);
  const [layoutId, setLayoutId] = useState("4g");
  const [gap, setGap] = useState(8);
  const [gold, setGold] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const layout = LAYOUTS.find((l) => l.id === layoutId)!;

  function onFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 9);
    Promise.all(list.map((f) => new Promise<HTMLImageElement>((resolve) => {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    }))).then((loaded) => setImgs((prev) => [...prev, ...loaded].slice(0, 9)));
  }

  useEffect(() => {
    if (canvasRef.current && imgs.length) drawCollage(canvasRef.current, imgs, layout, gap, gold);
  }, [imgs, layout, gap, gold]);

  function download() {
    if (!imgs.length) return;
    const canvas = document.createElement("canvas");
    drawCollage(canvas, imgs, layout, gap, gold);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.92);
    a.download = "instagrab-collage.jpg";
    a.click();
  }

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => onFiles(e.target.files)} />
        <button className="btn btn-secondary gold" onClick={() => inputRef.current?.click()} style={{ justifyContent: "center" }}>
          <Upload size={16} strokeWidth={1.5} /> Add photos ({imgs.length}/9)
        </button>
        {imgs.length > 0 && (
          <button className="btn btn-ghost" onClick={() => setImgs([])} style={{ fontSize: 13, alignSelf: "flex-start" }}>
            <Trash2 size={13} strokeWidth={1.5} /> Clear all
          </button>
        )}
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Layout</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LAYOUTS.map((l) => (
              <button key={l.id} className="chip" onClick={() => setLayoutId(l.id)}
                style={{ cursor: "pointer", borderColor: layoutId === l.id ? "var(--gold-400)" : undefined, color: layoutId === l.id ? "var(--gold-ink)" : undefined, fontWeight: layoutId === l.id ? 600 : 400 }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Border thickness: {gap}px</span>
          <input type="range" min={0} max={24} step={2} value={gap} onChange={(e) => setGap(Number(e.target.value))}
            aria-label="Border thickness" style={{ width: "100%", accentColor: "var(--gold-ink)" }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--ink-2)", cursor: "pointer" }}>
          <input type="checkbox" checked={gold} onChange={(e) => setGold(e.target.checked)} style={{ accentColor: "var(--gold-ink)", width: 16, height: 16 }} />
          Gold gradient borders ✨
        </label>
        <button className="btn btn-molten" onClick={download} disabled={!imgs.length} style={{ height: 50, justifyContent: "center" }}>
          <Download size={16} strokeWidth={1.5} /> Download collage
        </button>
      </div>

      <div>
        <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <LayoutGrid size={13} strokeWidth={1.5} /> Live preview
        </span>
        {imgs.length ? (
          <canvas ref={canvasRef} style={{ width: "100%", height: "auto", borderRadius: 18, border: "1px solid var(--line)", display: "block" }} />
        ) : (
          <div className="card" style={{ aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", fontSize: "var(--t-small)", textAlign: "center", padding: 24 }}>
            Add 2-9 photos —<br />your collage builds here instantly.
          </div>
        )}
      </div>
    </div>
  );
}
