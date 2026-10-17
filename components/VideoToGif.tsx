"use client";
import { useRef, useState } from "react";
import { Upload, Download, Film, AlertTriangle } from "lucide-react";

const MAX_GIF_SECONDS = 8;
const FPS = 10;
const OUT_W = 480;

export default function VideoToGif() {
  const [src, setSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [len, setLen] = useState(3);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | undefined) {
    if (!f || !f.type.startsWith("video/")) return;
    setGifUrl(null); setError(null);
    setSrc(URL.createObjectURL(f));
  }

  async function make() {
    const v = videoRef.current;
    if (!v || working) return;
    setWorking(true); setError(null); setGifUrl(null); setProgress(0);
    try {
      const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
      const gif = GIFEncoder();

      const scale = OUT_W / v.videoWidth;
      const w = OUT_W, h = Math.round(v.videoHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      const frames = Math.round(Math.min(len, MAX_GIF_SECONDS) * FPS);
      v.pause();
      for (let i = 0; i < frames; i++) {
        const t = start + i / FPS;
        if (t > v.duration) break;
        v.currentTime = t;
        await new Promise<void>((resolve) => { v.onseeked = () => resolve(); });
        ctx.drawImage(v, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        gif.writeFrame(index, w, h, { palette, delay: 1000 / FPS });
        setProgress(Math.round(((i + 1) / frames) * 100));
      }
      gif.finish();
      const bytes = gif.bytes();
      const buf = new Uint8Array(bytes); // fresh copy → plain ArrayBuffer for Blob
      const blob = new Blob([buf], { type: "image/gif" });
      setGifSize(blob.size);
      setGifUrl(URL.createObjectURL(blob));
    } catch {
      setError("GIF encoding failed — try a shorter clip or a different video.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0])} />

      {!src ? (
        <button className="card" onClick={() => inputRef.current?.click()}
          style={{ padding: 48, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><Film size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>Choose a video</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            Turn up to {MAX_GIF_SECONDS} seconds into a shareable GIF — on-device.
          </span>
        </button>
      ) : (
        <>
          <video ref={videoRef} src={src} controls playsInline muted
            onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); setStart(0); }}
            style={{ width: "100%", maxHeight: 340, borderRadius: 16, border: "1px solid var(--line)", background: "var(--surface-2)" }} />

          <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <span className="label">Start at: {start.toFixed(1)}s</span>
            <input type="range" min={0} max={Math.max(0, duration - 0.5)} step={0.1} value={start}
              onChange={(e) => setStart(Number(e.target.value))} aria-label="GIF start time"
              style={{ width: "100%", accentColor: "var(--gold-ink)" }} />
            <span className="label">Length: {len}s (max {MAX_GIF_SECONDS}s)</span>
            <input type="range" min={1} max={MAX_GIF_SECONDS} step={1} value={len}
              onChange={(e) => setLen(Number(e.target.value))} aria-label="GIF length"
              style={{ width: "100%", accentColor: "var(--gold-ink)" }} />
            <button className="btn btn-molten" onClick={make} disabled={working} style={{ height: 50, justifyContent: "center" }}>
              <Film size={16} strokeWidth={1.5} />
              {working ? `Encoding… ${progress}%` : "Make GIF"}
            </button>
          </div>

          {error && (
            <div className="card" role="alert" style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 16, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
              <AlertTriangle size={18} strokeWidth={1.5} style={{ color: "var(--err)", flexShrink: 0 }} />
              <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
            </div>
          )}

          {gifUrl && (
            <div className="card intro-rise" style={{ padding: 18, borderColor: "var(--gold-300)", textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gifUrl} alt="Generated GIF" style={{ maxWidth: "100%", borderRadius: 14, border: "1px solid var(--line)" }} />
              <div style={{ marginTop: 12 }}>
                <a className="btn btn-molten" href={gifUrl} download="instagrab.gif">
                  <Download size={16} strokeWidth={1.5} /> Download GIF ({(gifSize / 1048576).toFixed(1)} MB)
                </a>
              </div>
            </div>
          )}
        </>
      )}
      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        GIFs are big by nature — {FPS} fps at {OUT_W}px wide keeps them WhatsApp-friendly.
        Encoding runs entirely in your browser.
      </p>
    </div>
  );
}
