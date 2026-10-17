"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, Download, Shrink } from "lucide-react";

function fmtBytes(n: number): string {
  if (n >= 1048576) return (n / 1048576).toFixed(2) + " MB";
  if (n >= 1024) return Math.round(n / 1024) + " KB";
  return n + " B";
}

const MAX_DIM = 2400; // plenty for social; keeps giant camera files manageable

export default function ImageCompressor() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [origSize, setOrigSize] = useState(0);
  const [fileName, setFileName] = useState("");
  const [quality, setQuality] = useState(0.8);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  function onFile(f: File | undefined) {
    if (!f || !f.type.startsWith("image/")) return;
    setOrigSize(f.size);
    setFileName(f.name.replace(/\.\w+$/, ""));
    const url = URL.createObjectURL(f);
    const image = new Image();
    image.onload = () => { setImg(image); URL.revokeObjectURL(url); };
    image.src = url;
  }

  useEffect(() => {
    if (!img) return;
    const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((b) => {
      if (!b) return;
      setBlob(b);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const u = URL.createObjectURL(b);
      previewUrlRef.current = u;
      setPreview(u);
    }, "image/jpeg", quality);
  }, [img, quality]);

  useEffect(() => () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); }, []);

  function download() {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName || "image"}-compressed.jpg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
  }

  const saved = blob && origSize ? Math.max(0, Math.round((1 - blob.size / origSize) * 100)) : 0;

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => onFile(e.target.files?.[0])} />

      {!img ? (
        <button className="card" onClick={() => inputRef.current?.click()}
          style={{ padding: 48, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><Upload size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>Choose an image to compress</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            Processed entirely in your browser — nothing is uploaded.
          </span>
        </button>
      ) : (
        <>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <span className="label">Quality: {(quality * 100).toFixed(0)}%</span>
              <button className="btn btn-ghost" onClick={() => inputRef.current?.click()} style={{ fontSize: 13 }}>
                <Upload size={14} strokeWidth={1.5} /> Change image
              </button>
            </div>
            <input type="range" min={30} max={95} step={5} value={quality * 100}
              onChange={(e) => setQuality(Number(e.target.value) / 100)}
              aria-label="Compression quality" style={{ width: "100%", accentColor: "var(--gold-ink)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginTop: 16 }}>
              {([
                ["Original", fmtBytes(origSize), undefined],
                ["Compressed", blob ? fmtBytes(blob.size) : "…", "var(--gold-ink)"],
                ["Saved", `${saved}%`, saved > 0 ? "var(--ok)" : undefined],
              ] as [string, string, string | undefined][]).map(([k, v, color]) => (
                <div key={k} className="well" style={{ padding: 14, textAlign: "center" }}>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color }}>{v}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>

          {preview && (
            <div className="card intro-rise" style={{ padding: 20, textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Compressed preview"
                style={{ maxWidth: "100%", maxHeight: 420, borderRadius: 14, border: "1px solid var(--line)" }} />
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-molten" onClick={download}>
                  <Shrink size={16} strokeWidth={1.5} /> Download compressed JPG
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Everything happens on your device. 80% quality is visually identical for most photos at a fraction of the size;
        very large images are also scaled to a maximum of {MAX_DIM}px on the long side.
      </p>
    </div>
  );
}
