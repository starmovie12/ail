"use client";
import { useState } from "react";
import { Link2, Download, AlertTriangle } from "lucide-react";
import { dl } from "@/lib/media";

type Result = { video: string | null; image: string | null; title: string; description: string; host: string };

/** Shared paste→download UI for the OG-tag platforms (Pinterest, Threads).
 *  hostHint arrives as a pattern STRING (RegExp can't cross the server→client boundary). */
export default function OgDownloader({ platform, hostHint, placeholder }: {
  platform: string;
  hostHint: string;
  placeholder: string;
}) {
  const hostRe = new RegExp(hostHint, "i");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!hostRe.test(url.trim())) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300);
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/og-extract", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.error) setError(json?.error ?? "Something went wrong — try again.");
      else setResult(json as Result);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally { setLoading(false); }
  }

  // Media on allowlisted CDNs downloads through our proxy; anything else links directly.
  const proxied = (u: string, name: string) =>
    /(^https:\/\/)([\w-]+\.)*(pinimg\.com|cdninstagram\.com|fbcdn\.net|tiktokcdn(-[a-z0-9]+)?\.com)\//.test(u) ? dl(u, name) : u;

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar obar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><Link2 size={20} strokeWidth={1.5} /></span>
        <input
          value={url} disabled={loading}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder={placeholder}
          aria-label={`${platform} link`}
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Download size={18} strokeWidth={1.5} />
          <span>{loading ? "Fetching…" : "Download"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {result && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          {result.title && <b style={{ display: "block", marginBottom: 4 }}>{result.title}</b>}
          {result.description && (
            <p style={{ fontSize: "var(--t-small)", color: "var(--ink-3)", marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {result.description}
            </p>
          )}
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface-2)", maxWidth: 420 }}>
            {result.video ? (
              <video src={proxied(result.video, "preview")} poster={result.image ? proxied(result.image, "thumb") : undefined} controls playsInline style={{ width: "100%", display: "block" }} />
            ) : result.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={proxied(result.image, "photo")} alt={result.title || "Media"} style={{ width: "100%", display: "block" }} />
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            {result.video && (
              <a className="btn btn-secondary gold" href={proxied(result.video, `${platform.toLowerCase()}-video.mp4`)} download target="_blank" rel="noreferrer">
                <Download size={15} strokeWidth={1.5} /> Download video
              </a>
            )}
            {result.image && (
              <a className={`btn btn-secondary ${!result.video ? "gold" : ""}`} href={proxied(result.image, `${platform.toLowerCase()}-image.jpg`)} download target="_blank" rel="noreferrer">
                <Download size={15} strokeWidth={1.5} /> Download image{result.video ? " (cover)" : ""}
              </a>
            )}
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Public {platform} content only. Download only what you own or have permission to use — nothing is stored here.
      </p>

      <style jsx>{`
        .obar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .obar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .obar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
