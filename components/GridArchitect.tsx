"use client";
import { useRef, useState } from "react";
import { Upload, Palette, Sun, Shuffle, RotateCcw, GripVertical, Trash2 } from "lucide-react";

type Tile = { id: string; url: string; hue: number; light: number; sat: number };

/** Average colour of an image, downscaled to 16×16 for speed. Returns HSL. */
async function analyse(file: File): Promise<{ url: string; hue: number; light: number; sat: number }> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const cv = document.createElement("canvas"); cv.width = 16; cv.height = 16;
  const ctx = cv.getContext("2d")!; ctx.drawImage(img, 0, 0, 16, 16);
  const { data } = ctx.getImageData(0, 0, 16, 16);
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
  r /= n; g /= n; b /= n;
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = Math.round(h * 60); if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { url, hue: h, light: l, sat };
}

export default function GridArchitect() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragId = useRef<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 12 - tiles.length);
    if (!list.length) return;
    setBusy(true);
    try {
      const added: Tile[] = [];
      for (const f of list) {
        const a = await analyse(f);
        added.push({ id: `${f.name}-${Math.random().toString(36).slice(2, 8)}`, ...a });
      }
      setTiles((t) => [...t, ...added]);
    } finally { setBusy(false); }
  }

  const sortByHue = () => setTiles((t) => [...t].sort((a, b) => a.hue - b.hue || a.light - b.light));
  const sortByLight = () => setTiles((t) => [...t].sort((a, b) => b.light - a.light));
  const reverse = () => setTiles((t) => [...t].reverse());
  const shuffle = () => setTiles((t) => { const c = [...t]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; });
  const clear = () => setTiles([]);
  const removeTile = (id: string) => setTiles((t) => t.filter((x) => x.id !== id));

  function onDrop(targetId: string) {
    const from = dragId.current; dragId.current = null; setOverId(null);
    if (!from || from === targetId) return;
    setTiles((t) => {
      const fromIdx = t.findIndex((x) => x.id === from);
      const toIdx = t.findIndex((x) => x.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return t;
      const c = [...t]; const [moved] = c.splice(fromIdx, 1); c.splice(toIdx, 0, moved); return c;
    });
  }

  return (
    <div style={{ width: "100%", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => onFiles(e.target.files)} />

      {tiles.length === 0 ? (
        <button className="card" onClick={() => inputRef.current?.click()} disabled={busy}
          style={{ padding: 44, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><Palette size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>{busy ? "Reading colours…" : "Upload your next posts"}</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            Up to 12 photos — we read each one&apos;s colour and help you arrange a cohesive grid.
          </span>
        </button>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="chip" onClick={sortByHue} style={{ cursor: "pointer" }}><Palette size={13} strokeWidth={1.5} /> By colour</button>
            <button className="chip" onClick={sortByLight} style={{ cursor: "pointer" }}><Sun size={13} strokeWidth={1.5} /> By brightness</button>
            <button className="chip" onClick={reverse} style={{ cursor: "pointer" }}><RotateCcw size={13} strokeWidth={1.5} /> Reverse</button>
            <button className="chip" onClick={shuffle} style={{ cursor: "pointer" }}><Shuffle size={13} strokeWidth={1.5} /> Shuffle</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
            {tiles.map((t) => (
              <div key={t.id} draggable
                onDragStart={() => { dragId.current = t.id; }}
                onDragOver={(e) => { e.preventDefault(); setOverId(t.id); }}
                onDragLeave={() => setOverId((o) => (o === t.id ? null : o))}
                onDrop={() => onDrop(t.id)}
                style={{ position: "relative", aspectRatio: "1", cursor: "grab", outline: overId === t.id ? "2px solid var(--gold-400)" : "none", outlineOffset: -2 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.url} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
                <span aria-hidden style={{ position: "absolute", top: 4, left: 4, color: "#fff", opacity: 0.7, filter: "drop-shadow(0 1px 2px rgba(0,0,0,.6))" }}>
                  <GripVertical size={14} strokeWidth={2} />
                </span>
                <button onClick={() => removeTile(t.id)} aria-label="Remove"
                  style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,.5)", border: "none", borderRadius: 6, padding: 3, cursor: "pointer", color: "#fff", display: "inline-flex" }}>
                  <Trash2 size={12} strokeWidth={2} />
                </button>
                <span aria-hidden style={{ position: "absolute", bottom: 5, left: 5, width: 12, height: 12, borderRadius: 3, border: "1.5px solid rgba(255,255,255,.85)", background: `hsl(${t.hue} ${Math.round(t.sat * 100)}% ${Math.round(t.light * 100)}%)` }} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn btn-secondary gold" onClick={() => inputRef.current?.click()} disabled={busy || tiles.length >= 12} style={{ fontSize: 13 }}>
              <Upload size={14} strokeWidth={1.5} /> {busy ? "Reading…" : "Add more"}
            </button>
            <button className="btn btn-ghost" onClick={clear} style={{ fontSize: 13 }}><Trash2 size={14} strokeWidth={1.5} /> Clear all</button>
          </div>
          <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
            Drag any tile to reorder · the little swatch shows each photo&apos;s dominant colour
          </p>
        </>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6, textAlign: "center" }}>
        100% on your device — photos never leave your browser. Plan the grid here, then post in this order.
      </p>
    </div>
  );
}
