"use client";
import { useRef, useState } from "react";
import { Upload, Scissors, Download, AlertTriangle } from "lucide-react";

function fmtT(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/**
 * F6 — browser video trimmer: plays the selected range through a canvas and
 * re-records it with MediaRecorder (WebM out). No uploads, no ffmpeg.
 */
export default function VideoTrimmer() {
  const [src, setSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | undefined) {
    if (!f || !f.type.startsWith("video/")) return;
    setOutUrl(null); setError(null);
    setSrc(URL.createObjectURL(f));
  }

  function onMeta() {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    setStart(0);
    setEnd(Math.min(v.duration, 30));
  }

  async function trim() {
    const v = videoRef.current;
    if (!v || recording || end <= start) return;
    if (typeof MediaRecorder === "undefined") {
      setError("Your browser doesn't support in-browser recording — try Chrome or Edge.");
      return;
    }
    setRecording(true); setError(null); setOutUrl(null); setProgress(0);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth; canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d")!;

      const canvasStream = canvas.captureStream(30);
      // Carry the audio over when the browser exposes it.
      const anyV = v as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
      try {
        const vs = anyV.captureStream?.() ?? anyV.mozCaptureStream?.();
        vs?.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
      } catch { /* video without audio still trims fine */ }

      const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
        .find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
      const rec = new MediaRecorder(canvasStream, mime ? { mimeType: mime, videoBitsPerSecond: 5_000_000 } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const done = new Promise<void>((resolve) => { rec.onstop = () => resolve(); });

      v.currentTime = start;
      await new Promise<void>((resolve) => { v.onseeked = () => resolve(); });
      v.muted = false;
      await v.play();
      rec.start(250);

      await new Promise<void>((resolve) => {
        const tick = () => {
          if (v.currentTime >= end || v.ended) { resolve(); return; }
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          setProgress(Math.round(((v.currentTime - start) / (end - start)) * 100));
          requestAnimationFrame(tick);
        };
        tick();
      });

      v.pause();
      rec.stop();
      await done;
      setOutUrl(URL.createObjectURL(new Blob(chunks, { type: "video/webm" })));
      setProgress(100);
    } catch {
      setError("Trimming failed — try a shorter range or a different browser (Chrome works best).");
    } finally {
      setRecording(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <input ref={inputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0])} />

      {!src ? (
        <button className="card" onClick={() => inputRef.current?.click()}
          style={{ padding: 48, textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "none" }}>
          <span className="medallion" style={{ margin: "0 auto 14px" }}><Scissors size={24} strokeWidth={1.5} /></span>
          <b style={{ display: "block", fontSize: 16, color: "var(--ink)" }}>Choose a video to trim</b>
          <span style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", display: "block", marginTop: 6 }}>
            Cut a clip in your browser — nothing is uploaded. (Beta — Chrome/Edge best)
          </span>
        </button>
      ) : (
        <>
          <video ref={videoRef} src={src} controls playsInline onLoadedMetadata={onMeta}
            style={{ width: "100%", maxHeight: 380, borderRadius: 16, border: "1px solid var(--line)", background: "var(--surface-2)" }} />

          {duration > 0 && (
            <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label">Start: {fmtT(start)}</span>
                <span className="label">End: {fmtT(end)} · clip {fmtT(Math.max(0, end - start))}</span>
              </div>
              <input type="range" min={0} max={duration} step={0.1} value={start}
                onChange={(e) => setStart(Math.min(Number(e.target.value), end - 0.5))}
                aria-label="Clip start" style={{ width: "100%", accentColor: "var(--gold-ink)" }} />
              <input type="range" min={0} max={duration} step={0.1} value={end}
                onChange={(e) => setEnd(Math.max(Number(e.target.value), start + 0.5))}
                aria-label="Clip end" style={{ width: "100%", accentColor: "var(--gold-ink)" }} />
              <button className="btn btn-molten" onClick={trim} disabled={recording} style={{ height: 50, justifyContent: "center" }}>
                <Scissors size={16} strokeWidth={1.5} />
                {recording ? `Recording clip… ${progress}%` : "Trim this range"}
              </button>
              <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                The clip plays once while it&apos;s re-recorded — keep this tab visible until it finishes.
              </p>
            </div>
          )}

          {error && (
            <div className="card" role="alert" style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 16, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
              <AlertTriangle size={18} strokeWidth={1.5} style={{ color: "var(--err)", flexShrink: 0 }} />
              <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
            </div>
          )}

          {outUrl && (
            <div className="card intro-rise" style={{ padding: 18, borderColor: "var(--gold-300)" }}>
              <span className="label" style={{ color: "var(--gold-ink)", display: "block", marginBottom: 10 }}>Your clip ✂️</span>
              <video src={outUrl} controls playsInline style={{ width: "100%", maxHeight: 320, borderRadius: 14 }} />
              <a className="btn btn-molten" href={outUrl} download="instagrab-clip.webm" style={{ marginTop: 12 }}>
                <Download size={16} strokeWidth={1.5} /> Download clip (WebM)
              </a>
              <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 10 }}>
                WebM plays everywhere modern and uploads to Instagram/WhatsApp fine. Need MP4? Any converter can transcode it.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
