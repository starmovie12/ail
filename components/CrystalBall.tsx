"use client";
import { useRef, useState } from "react";
import { Upload, Sparkles, AlertTriangle } from "lucide-react";

async function fileToBase64(f: File): Promise<{ data: string; mime: string }> {
  const url = URL.createObjectURL(f);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url;
  });
  URL.revokeObjectURL(url);
  const MAX = 1280;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { data: canvas.toDataURL("image/jpeg", 0.85).split(",")[1], mime: "image/jpeg" };
}

export default function CrystalBall() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | undefined) {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); setReport(null); setError(null);
    setPreview(URL.createObjectURL(f));
  }

  async function go() {
    if (!file || loading) return;
    setLoading(true); setError(null); setReport(null);
    try {
      const { data, mime } = await fileToBase64(file);
      const res = await fetch("/api/invent/crystal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data, mimeType: mime, caption: caption.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.report) setError(json?.error ?? "Couldn't analyse — try again.");
      else setReport(json.report);
    } catch {
      setError("Couldn't process that image — try another.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0])} />

      {!preview ? (
        <button className="card" onClick={() => inputRef.current?.click()}
          style={{ padding: 48, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><Sparkles size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>Upload what you&apos;re about to post</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            The AI predicts virality BEFORE you post. Image not stored.
          </span>
        </button>
      ) : (
        <div className="card" style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 12, border: "1px solid var(--line)" }} />
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Planned caption (optional)"
              aria-label="Planned caption" style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", fontSize: 14, color: "var(--ink)" }} />
            <button className="btn btn-molten" onClick={go} disabled={loading} style={{ justifyContent: "center", height: 46 }}>
              <Sparkles size={16} strokeWidth={1.5} /> {loading ? "Reading the future…" : "Predict virality"}
            </button>
            <button className="btn btn-ghost" onClick={() => inputRef.current?.click()} style={{ fontSize: 13, alignSelf: "flex-start" }}>
              <Upload size={13} strokeWidth={1.5} /> Different image
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <AlertTriangle size={20} strokeWidth={1.5} style={{ color: "var(--err)", flexShrink: 0 }} />
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {report && (
        <div className="card intro-rise" style={{ padding: 20, borderColor: "var(--gold-300)" }}>
          <span className="label" style={{ color: "var(--gold-ink)", display: "block", marginBottom: 12 }}>🔮 Pre-post report</span>
          <div className="well" style={{ padding: 18, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)", lineHeight: 1.7 }}>{report}</div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        AI prediction, not a guarantee — treat it as a second opinion before you hit post. Image is analysed once and never stored.
      </p>
    </div>
  );
}
