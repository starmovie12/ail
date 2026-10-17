"use client";
import { useRef, useState } from "react";
import { Link2, Camera, Download, AlertTriangle } from "lucide-react";
import type { ExtractResult } from "@/lib/extract-ui";
import { dl } from "@/lib/media";

export default function FrameGrabber() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [name, setName] = useState("frame");
  const [frame, setFrame] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  async function go() {
    if (loading) return;
    if (!/instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\//i.test(url.trim())) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300);
      return;
    }
    setLoading(true); setError(null); setVideoSrc(null); setFrame(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.error) { setError(json?.error?.message ?? "Couldn't extract that link."); return; }
      const data = json.data as ExtractResult;
      const vid = data.slides.find((s) => s.type === "video");
      if (!vid) { setError("That post has no video — frame grabbing needs a reel or video."); return; }
      setName(`instagrab-${data.shortcode}`);
      // Same-origin proxy → canvas stays untainted → we can export frames.
      setVideoSrc(dl(vid.url, "video"));
    } catch {
      setError("Network error — please try again.");
    } finally { setLoading(false); }
  }

  function grab() {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    canvas.getContext("2d")!.drawImage(v, 0, 0);
    setFrame(canvas.toDataURL("image/png"));
    try { navigator.vibrate?.(10); } catch {}
  }

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar fgbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><Link2 size={20} strokeWidth={1.5} /></span>
        <input
          value={url} disabled={loading}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Paste a reel/video link, then scrub to any moment"
          aria-label="Instagram video link"
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Camera size={18} strokeWidth={1.5} />
          <span>{loading ? "Loading…" : "Load video"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {videoSrc && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <div className="card intro-rise" style={{ padding: 16 }}>
            <span className="label" style={{ display: "block", marginBottom: 10 }}>1 · Pause on the exact moment</span>
            <video ref={videoRef} src={videoSrc} controls playsInline preload="auto"
              style={{ width: "100%", borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface-2)" }} />
            <button className="btn btn-molten" onClick={grab} style={{ width: "100%", justifyContent: "center", marginTop: 12, height: 48 }}>
              <Camera size={16} strokeWidth={1.5} /> Grab this frame
            </button>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <span className="label" style={{ display: "block", marginBottom: 10 }}>2 · Your captured frame</span>
            {frame ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frame} alt="Captured frame" style={{ width: "100%", borderRadius: 14, border: "1px solid var(--gold-300)" }} />
                <a className="btn btn-secondary gold" href={frame} download={`${name}-frame.png`} style={{ marginTop: 12 }}>
                  <Download size={15} strokeWidth={1.5} /> Download PNG (full resolution)
                </a>
              </>
            ) : (
              <div style={{ aspectRatio: "9/16", maxHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", fontSize: "var(--t-small)", border: "1px dashed var(--line)", borderRadius: 14 }}>
                Pause the video and hit “Grab this frame”
              </div>
            )}
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Frames export at the video&apos;s native resolution — sharper than any screenshot, no UI overlays.
        Perfect for custom reel covers and thumbnails.
      </p>

      <style jsx>{`
        .fgbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .fgbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .fgbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
