"use client";
import { useState } from "react";
import { Link2, Download, AlertTriangle, Copy, Check } from "lucide-react";
import { dl } from "@/lib/media";

type Media = { type: "video" | "image"; url: string; thumbnail: string; label?: string };
type Result = { media: Media[]; text: string; username: string; name: string };

export default function TwitterDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!/(twitter\.com|x\.com)\/\w+\/status/i.test(url.trim())) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300);
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/twitter", {
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

  async function copyText() {
    if (!result?.text) return;
    try { await navigator.clipboard.writeText(result.text); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar twbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><Link2 size={20} strokeWidth={1.5} /></span>
        <input
          value={url} disabled={loading}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Paste a tweet link (x.com or twitter.com)"
          aria-label="Tweet link"
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
          <div className="mono" style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 14 }}>
            {result.name} <span style={{ color: "var(--gold-ink)" }}>@{result.username}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {result.media.map((m, i) => (
              <div key={i} className="card" style={{ padding: 12 }}>
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface-2)" }}>
                  {m.type === "video"
                    ? <video src={dl(m.url, "preview")} poster={m.thumbnail ? dl(m.thumbnail, "thumb") : undefined} controls playsInline preload="metadata" style={{ width: "100%", display: "block" }} />
                    : /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={dl(m.url, "photo")} alt={`Media ${i + 1}`} style={{ width: "100%", display: "block" }} />}
                </div>
                <a className="btn btn-secondary gold" href={dl(m.url, `twitter-${result.username}-${i + 1}.${m.type === "video" ? "mp4" : "jpg"}`)} download
                  style={{ fontSize: 13, marginTop: 10, width: "100%", justifyContent: "center" }}>
                  <Download size={14} strokeWidth={1.5} /> {m.label ?? (m.type === "video" ? "Video" : "Photo (original)")}
                </a>
              </div>
            ))}
          </div>
          {result.text && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="label">Tweet text</span>
                <button className={`btn btn-secondary ${copied ? "tick" : ""}`} onClick={copyText} style={{ fontSize: 12 }}>
                  {copied ? <Check size={13} strokeWidth={2} className="coin-in" /> : <Copy size={13} strokeWidth={1.5} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="well" style={{ padding: 14, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)" }}>{result.text}</div>
            </div>
          )}
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Videos download at the highest available bitrate; photos at original resolution.
        Public tweets only — nothing is stored.
      </p>

      <style jsx>{`
        .twbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .twbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .twbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
