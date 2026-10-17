"use client";
import { useRef, useState } from "react";
import { Upload, Sparkles, Copy, Check, AlertTriangle } from "lucide-react";

/** Downscale + JPEG-encode on-device so uploads stay small and private-ish. */
async function fileToBase64(f: File): Promise<{ data: string; mime: string }> {
  const url = URL.createObjectURL(f);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = url;
  });
  URL.revokeObjectURL(url);
  const MAX = 1280;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { data: dataUrl.split(",")[1], mime: "image/jpeg" };
}

export default function AltTextTool() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | undefined) {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setResult(null); setError(null);
    setPreview(URL.createObjectURL(f));
  }

  async function go() {
    if (!file || loading) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const { data, mime } = await fileToBase64(file);
      const res = await fetch("/api/alt-text", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data, mimeType: mime }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.text) setError(json?.error ?? "Something went wrong — try again.");
      else setResult(json.text);
    } catch {
      setError("Couldn't process that image — try a different one.");
    } finally { setLoading(false); }
  }

  async function copy() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0])} />

      {!preview ? (
        <button className="card" onClick={() => inputRef.current?.click()}
          style={{ padding: 48, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><Upload size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>Choose the photo you&apos;re posting</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            The AI describes it — you get 3 alt text options. Image isn&apos;t stored.
          </span>
        </button>
      ) : (
        <div className="card" style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Upload preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12, border: "1px solid var(--line)" }} />
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn btn-molten" onClick={go} disabled={loading} style={{ justifyContent: "center", height: 48 }}>
              <Sparkles size={16} strokeWidth={1.5} /> {loading ? "Looking at it…" : "Generate alt text"}
            </button>
            <button className="btn btn-ghost" onClick={() => inputRef.current?.click()} style={{ fontSize: 13, alignSelf: "flex-start" }}>
              <Upload size={13} strokeWidth={1.5} /> Different photo
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {result && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="label" style={{ color: "var(--gold-ink)" }}>3 alt text options</span>
            <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13 }}>
              {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? "Copied" : "Copy all"}
            </button>
          </div>
          <div className="well" style={{ padding: 18, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)", lineHeight: 1.7 }}>
            {result}
          </div>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 12, lineHeight: 1.6 }}>
            Paste into: New post → Advanced settings → Accessibility → Write alt text.
          </p>
        </div>
      )}
    </div>
  );
}
