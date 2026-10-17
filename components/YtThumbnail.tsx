"use client";
import { useState } from "react";
import { Link2, Search, Download, AlertTriangle, X } from "lucide-react";
import { dl } from "@/lib/media";

/** Pull the 11-char video id out of any YouTube URL shape (watch, shorts, youtu.be, embed, live). */
function videoId(input: string): string | null {
  const v = input.trim();
  const direct = v.match(/^[\w-]{11}$/);
  if (direct) return direct[0];
  const m = v.match(
    /(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i
  );
  return m ? m[1] : null;
}

const SIZES = [
  { file: "maxresdefault", label: "Full HD", dims: "1280 × 720" },
  { file: "sddefault", label: "SD", dims: "640 × 480" },
  { file: "hqdefault", label: "High", dims: "480 × 360" },
  { file: "mqdefault", label: "Medium", dims: "320 × 180" },
];

export default function YtThumbnail() {
  const [value, setValue] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  function go() {
    const vid = videoId(value);
    if (!vid) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300);
      setId(null);
      return;
    }
    setFailed({});
    setId(vid);
  }
  function clear() { setValue(""); setId(null); }

  const showInvalid = invalid && value.trim().length > 0;

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
      <div className={`bar ytbar ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><Link2 size={20} strokeWidth={1.5} /></span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Paste any YouTube video or Shorts link"
          aria-label="YouTube video link"
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        {value && (
          <button className="btn-icon" aria-label="Clear" onClick={clear}><X size={16} strokeWidth={1.5} /></button>
        )}
        <button className="btn btn-molten" onClick={go} style={{ height: 48 }}>
          <Search size={18} strokeWidth={1.5} /> <span>Get thumbnails</span>
        </button>
      </div>

      {showInvalid && (
        <p className="mono" style={{ color: "var(--err)", fontSize: 13, marginTop: 12, textAlign: "center" }}>
          That doesn&apos;t look like a YouTube link — try a youtube.com or youtu.be URL.
        </p>
      )}

      {id && (
        <div className="card intro-rise" style={{ padding: 24, marginTop: 28, textAlign: "left" }}>
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-3)", marginBottom: 18 }}>
            <span className="label" style={{ color: "var(--gold-ink)" }}>Video</span>
            <span>{id}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {SIZES.filter((s) => !failed[s.file]).map((s, i) => {
              const src = `https://img.youtube.com/vi/${id}/${s.file}.jpg`;
              return (
                <div key={s.file} className="card intro-rise" style={{ padding: 14, ["--dl" as string]: `${i * 60}ms` }}>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "16/9", background: "var(--surface-2)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src} alt={`${s.label} thumbnail`} loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onLoad={(e) => {
                        // YouTube serves a 120×90 grey placeholder instead of 404 for missing sizes.
                        const img = e.currentTarget;
                        if (img.naturalWidth <= 120) setFailed((f) => ({ ...f, [s.file]: true }));
                      }}
                      onError={() => setFailed((f) => ({ ...f, [s.file]: true }))}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                    <span>
                      <b style={{ fontSize: 14 }}>{s.label}</b>
                      <span className="mono" style={{ display: "block", fontSize: 11, color: "var(--ink-3)" }}>{s.dims}</span>
                    </span>
                    <a className="btn btn-secondary gold" href={dl(src, `youtube-${id}-${s.file}.jpg`)} download style={{ fontSize: 13 }}>
                      <Download size={14} strokeWidth={1.5} /> Save
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          {SIZES.every((s) => failed[s.file]) && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--warn)", marginTop: 8 }}>
              <AlertTriangle size={18} strokeWidth={1.5} />
              <span style={{ fontSize: "var(--t-small)", color: "var(--ink-2)" }}>
                No thumbnails found for this video — double-check the link.
              </span>
            </div>
          )}
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 18, lineHeight: 1.6 }}>
            Full HD is only available when the creator uploaded a high-res thumbnail. Sizes that don&apos;t exist
            for this video are hidden automatically.
          </p>
        </div>
      )}

      <style jsx>{`
        .ytbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        @media (max-width:639px){
          .ytbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
