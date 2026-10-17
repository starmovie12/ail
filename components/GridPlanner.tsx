"use client";
import { useRef, useState } from "react";
import { Upload, Trash2, Grid3x3, ArrowLeftRight } from "lucide-react";

/**
 * F10 — 3×3 feed planner: add up to 9 photos, tap two to swap, see your grid
 * exactly as visitors will. First image = your NEXT post (top-left).
 */
export default function GridPlanner() {
  const [imgs, setImgs] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 9 - imgs.length);
    const urls = list.map((f) => URL.createObjectURL(f));
    setImgs((prev) => [...prev, ...urls].slice(0, 9));
  }

  function tap(i: number) {
    if (selected === null) { setSelected(i); return; }
    if (selected === i) { setSelected(null); return; }
    setImgs((prev) => {
      const next = [...prev];
      [next[selected], next[i]] = [next[i], next[selected]];
      return next;
    });
    setSelected(null);
  }

  return (
    <div style={{ width: "100%", maxWidth: 560, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => onFiles(e.target.files)} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-molten" onClick={() => inputRef.current?.click()} disabled={imgs.length >= 9}>
          <Upload size={16} strokeWidth={1.5} /> Add photos ({imgs.length}/9)
        </button>
        {imgs.length > 0 && (
          <button className="btn btn-ghost" onClick={() => { setImgs([]); setSelected(null); }} style={{ fontSize: 13 }}>
            <Trash2 size={13} strokeWidth={1.5} /> Clear
          </button>
        )}
      </div>

      {imgs.length > 0 ? (
        <>
          <p className="mono" style={{ fontSize: 12, color: "var(--gold-ink)", display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeftRight size={13} strokeWidth={1.5} />
            Tap one photo, then another — they swap. Top-left = your newest post.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 4, overflow: "hidden" }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <button key={i} onClick={() => imgs[i] && tap(i)}
                aria-label={imgs[i] ? `Photo position ${i + 1}` : `Empty slot ${i + 1}`}
                style={{ aspectRatio: "1/1", padding: 0, border: "none", cursor: imgs[i] ? "pointer" : "default", background: "var(--surface-2)", position: "relative", outline: selected === i ? "3px solid var(--molten)" : "none", outlineOffset: -3, zIndex: selected === i ? 1 : 0 }}>
                {imgs[i] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={imgs[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: selected !== null && selected !== i ? 0.75 : 1 }} />
                ) : (
                  <span style={{ color: "var(--ink-3)", fontSize: 11 }} className="mono">{i + 1}</span>
                )}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-3)", fontSize: "var(--t-small)" }}>
          <Grid3x3 size={28} strokeWidth={1.25} style={{ margin: "0 auto 12px", display: "block", color: "var(--gold-ink)" }} />
          Add your planned posts and see the 3×3 grid exactly as profile visitors will.
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Photos stay on your device. Planning tip: alternate close-ups and wide shots, and keep one palette
        (try the color palette extractor) — that&apos;s what makes feeds look curated.
      </p>
    </div>
  );
}
