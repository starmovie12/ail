"use client";
import { useState } from "react";
import { Link2, Music, Download, AlertTriangle } from "lucide-react";
import type { ExtractResult } from "@/lib/extract-ui";
import { dl } from "@/lib/media";

type Phase = "idle" | "extracting" | "converting" | "done" | "error";

/** Decode any audio (M4A) with WebAudio, then encode true MP3 with lamejs — all on-device. */
async function convertToMp3(audioUrl: string, onProgress: (pct: number) => void): Promise<Blob> {
  const res = await fetch(dl(audioUrl, "audio"));
  if (!res.ok) throw new Error("fetch");
  const buf = await res.arrayBuffer();

  const AC: typeof AudioContext =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const decoded = await ctx.decodeAudioData(buf);
  ctx.close();

  const lamejs = await import("@breezystack/lamejs");
  const channels = Math.min(2, decoded.numberOfChannels);
  const encoder = new lamejs.Mp3Encoder(channels, decoded.sampleRate, 192);

  const toInt16 = (f32: Float32Array) => {
    const out = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) {
      const s = Math.max(-1, Math.min(1, f32[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  };
  const left = toInt16(decoded.getChannelData(0));
  const right = channels === 2 ? toInt16(decoded.getChannelData(1)) : left;

  const chunks: Uint8Array[] = [];
  const BLOCK = 1152 * 20;
  for (let i = 0; i < left.length; i += BLOCK) {
    const l = left.subarray(i, i + BLOCK);
    const r = right.subarray(i, i + BLOCK);
    const enc = channels === 2 ? encoder.encodeBuffer(l, r) : encoder.encodeBuffer(l);
    if (enc.length) chunks.push(new Uint8Array(enc));
    onProgress(Math.round((i / left.length) * 100));
    // Yield to the UI thread so the progress bar actually paints.
    if (i % (BLOCK * 10) === 0) await new Promise((r2) => setTimeout(r2, 0));
  }
  const end = encoder.flush();
  if (end.length) chunks.push(new Uint8Array(end));
  onProgress(100);
  return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
}

export default function ReelToMp3() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [mp3Url, setMp3Url] = useState<string | null>(null);
  const [name, setName] = useState("audio");
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (phase === "extracting" || phase === "converting") return;
    if (!/instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\//i.test(url.trim())) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300);
      return;
    }
    setError(null); setMp3Url(null); setProgress(0);
    setPhase("extracting");
    try {
      const res = await fetch("/api/extract", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.error) {
        setError(json?.error?.message ?? "Couldn't extract that link — try again.");
        setPhase("error"); return;
      }
      const data = json.data as ExtractResult;
      const slide = data.slides.find((s) => s.audioUrl) ?? data.slides[0];
      const src = slide?.audioUrl ?? (slide?.type === "video" ? slide.url : null);
      if (!src) {
        setError("This post has no audio track — is it a photo?");
        setPhase("error"); return;
      }
      setName(`instagrab-${data.shortcode}`);
      setPhase("converting");
      const blob = await convertToMp3(src, setProgress);
      setMp3Url(URL.createObjectURL(blob));
      setPhase("done");
    } catch {
      setError("Conversion failed — your browser may not support this audio. The M4A download on the audio downloader page always works.");
      setPhase("error");
    }
  }

  const busy = phase === "extracting" || phase === "converting";

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar mbar ${busy ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><Link2 size={20} strokeWidth={1.5} /></span>
        <input
          value={url} disabled={busy}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Paste a reel link to convert its audio to MP3"
          aria-label="Instagram reel link"
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={busy} style={{ height: 48 }}>
          <Music size={18} strokeWidth={1.5} />
          <span>{phase === "extracting" ? "Extracting…" : phase === "converting" ? "Converting…" : "Convert to MP3"}</span>
        </button>
      </div>

      {phase === "converting" && (
        <div className="card intro-rise" style={{ padding: 18 }}>
          <span className="label" style={{ display: "block", marginBottom: 10 }}>Encoding MP3 on your device… {progress}%</span>
          <div aria-hidden="true" style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--line)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "var(--gold-ink)", borderRadius: 99, transition: "width 200ms" }} />
          </div>
        </div>
      )}

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {phase === "done" && mp3Url && (
        <div className="card intro-rise" style={{ padding: 20, borderColor: "var(--gold-300)" }}>
          <span className="label" style={{ color: "var(--gold-ink)", display: "block", marginBottom: 12 }}>True MP3, ready 🎵</span>
          <audio controls src={mp3Url} style={{ width: "100%", marginBottom: 14 }} />
          <a className="btn btn-molten" href={mp3Url} download={`${name}.mp3`}>
            <Download size={16} strokeWidth={1.5} /> Download MP3 (192 kbps)
          </a>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Real MP3, not a renamed M4A — decoded and re-encoded at 192 kbps entirely in your browser.
        Works in every editor, car stereo and status app. Download only audio you have rights to use.
      </p>

      <style jsx>{`
        .mbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .mbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .mbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
