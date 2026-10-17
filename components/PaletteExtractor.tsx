"use client";
import { useRef, useState } from "react";
import { Upload, Copy, Check, Palette } from "lucide-react";

/** Median-cut-ish quantization via coarse RGB bucketing — fast and good enough for 5 swatches. */
function extractPalette(img: HTMLImageElement, count = 5): string[] {
  const canvas = document.createElement("canvas");
  const S = 96;
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, S, S);
  const data = ctx.getImageData(0, 0, S, S).data;

  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    // Skip near-white/near-black — rarely useful as brand swatches.
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 245 || lum < 12) continue;
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const bkt = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    bkt.r += r; bkt.g += g; bkt.b += b; bkt.n++;
    buckets.set(key, bkt);
  }

  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
  const picked: { r: number; g: number; b: number }[] = [];
  for (const bkt of sorted) {
    const c = { r: bkt.r / bkt.n, g: bkt.g / bkt.n, b: bkt.b / bkt.n };
    // Keep swatches visually distinct from ones already picked.
    const distinct = picked.every((p) => Math.abs(p.r - c.r) + Math.abs(p.g - c.g) + Math.abs(p.b - c.b) > 90);
    if (distinct) picked.push(c);
    if (picked.length >= count) break;
  }
  return picked.map((c) =>
    "#" + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

function Swatch({ hex }: { hex: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => {
      try { await navigator.clipboard.writeText(hex); } catch { return; }
      setOk(true); setTimeout(() => setOk(false), 1400);
    }}
      style={{ flex: "1 1 90px", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", cursor: "pointer", background: "var(--surface)", padding: 0 }}
      aria-label={`Copy ${hex}`}>
      <span style={{ display: "block", height: 84, background: hex }} />
      <span className="mono" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 6px", fontSize: 12, color: ok ? "var(--gold-ink)" : "var(--ink-2)" }}>
        {ok ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={1.5} />}
        {ok ? "Copied" : hex}
      </span>
    </button>
  );
}

export default function PaletteExtractor() {
  const [preview, setPreview] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | undefined) {
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    const image = new Image();
    image.onload = () => {
      setPalette(extractPalette(image));
      setPreview(url);
    };
    image.src = url;
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => onFile(e.target.files?.[0])} />

      {!preview ? (
        <button className="card" onClick={() => inputRef.current?.click()}
          style={{ padding: 48, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><Palette size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>Choose a photo</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            We&apos;ll pull its 5 signature colors — on-device, nothing uploaded.
          </span>
        </button>
      ) : (
        <div className="card intro-rise" style={{ padding: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Source" style={{ width: "100%", maxHeight: 360, objectFit: "contain", borderRadius: 14, border: "1px solid var(--line)" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            {palette.map((hex) => <Swatch key={hex} hex={hex} />)}
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => inputRef.current?.click()} style={{ fontSize: 13 }}>
              <Upload size={14} strokeWidth={1.5} /> Try another photo
            </button>
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Tap any swatch to copy its hex code. Use the palette for story backgrounds, text colors,
        highlight covers and a feed that finally looks planned.
      </p>
    </div>
  );
}
