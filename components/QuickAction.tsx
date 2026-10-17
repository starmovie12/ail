"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Loader2, Check, ArrowLeft, AlertTriangle, Music, ImageDown } from "lucide-react";
import type { ExtractResult } from "@/lib/extract-ui";
import { dl } from "@/lib/media";

const IG_URL_RE = /https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i;

/** Pull the first Instagram URL out of whatever the share sheet handed us
 *  (Instagram usually drops the link into `text`, sometimes `url`). */
function extractLink(params: URLSearchParams): string | null {
  for (const key of ["url", "text", "title"]) {
    const v = params.get(key);
    if (!v) continue;
    if (IG_URL_RE.test(v)) return v.match(IG_URL_RE)![0];
    if (key === "url" && /instagram\.com/i.test(v)) return v.trim();
  }
  return null;
}

type Phase = "idle" | "loading" | "done" | "error";

export default function QuickAction() {
  const params = useSearchParams();
  const link = useMemo(() => extractLink(new URLSearchParams(params.toString())), [params]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [manual, setManual] = useState("");

  async function run(url: string) {
    setPhase("loading"); setResult(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.error) { setPhase("error"); return; }
      setResult(json.data as ExtractResult); setPhase("done");
    } catch { setPhase("error"); }
  }

  useEffect(() => { if (link) run(link); }, [link]);

  const main = result?.slides?.[0];
  const best = main?.versions?.[0];

  function backToInstagram() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "https://www.instagram.com/";
  }

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      background: "radial-gradient(1000px 600px at 50% -10%, rgb(var(--c-violet-2-rgb) / .28), transparent 60%), var(--bg)",
    }}>
      <div className="qa-glass" style={{ maxWidth: 440, width: "100%", padding: 28, textAlign: "center", color: "var(--ink)" }}>
        {/* Idle with no link → let them paste */}
        {phase === "idle" && !link && (
          <>
            <h1 style={{ fontSize: 22, marginBottom: 8, color: "#fff" }}>Quick download</h1>
            <p style={{ color: "rgba(245,239,226,.7)", fontSize: 14, marginBottom: 20 }}>Paste an Instagram link to download instantly.</p>
            <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="instagram.com/reel/…"
              onKeyDown={(e) => e.key === "Enter" && manual && run(manual)}
              style={{ width: "100%", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 15, marginBottom: 14 }} />
            <button className="btn btn-molten" onClick={() => manual && run(manual)} style={{ width: "100%", height: 48 }}>
              <Download size={18} strokeWidth={1.5} /> Download
            </button>
          </>
        )}

        {phase === "loading" && (
          <div style={{ padding: "24px 0" }}>
            <Loader2 size={40} strokeWidth={1.5} className="qa-spin" style={{ color: "var(--gold-200)" }} />
            <p style={{ marginTop: 18, color: "rgba(245,239,226,.85)", fontSize: 15 }}>Fetching your download…</p>
          </div>
        )}

        {phase === "error" && (
          <div style={{ padding: "12px 0" }}>
            <AlertTriangle size={36} strokeWidth={1.5} style={{ color: "#E2765A" }} />
            <p style={{ margin: "16px 0", color: "rgba(245,239,226,.85)", fontSize: 15 }}>
              Couldn&apos;t fetch that one. It may be private, expired, or Instagram is busy.
            </p>
            {link && <button className="btn btn-secondary" onClick={() => run(link)} style={{ height: 46 }}>Try again</button>}
          </div>
        )}

        {phase === "done" && main && (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gold-200)", marginBottom: 16 }}>
              <Check size={18} strokeWidth={2} /> <span className="mono" style={{ fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase" }}>Ready</span>
            </div>
            <div style={{ width: 150, aspectRatio: result!.kind === "reel" || result!.kind === "story" ? "9/16" : "1/1", margin: "0 auto 20px", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.15)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dl(main.thumbnail || main.url, "preview")} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {best && (
                <a className="btn btn-molten" href={dl(best.url, `instagrab-${result!.shortcode}-${best.label.replace(/\W+/g, "")}`)} download style={{ width: "100%", height: 50, fontSize: 16 }}>
                  <Download size={20} strokeWidth={1.5} /> Download {best.label}
                </a>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                {main.audioUrl && (
                  <a className="btn btn-secondary" href={dl(main.audioUrl, `instagrab-${result!.shortcode}-audio.m4a`)} download style={{ flex: 1, height: 44 }}>
                    <Music size={16} strokeWidth={1.5} /> Audio
                  </a>
                )}
                {result!.thumbnail && (
                  <a className="btn btn-secondary" href={dl(result!.thumbnail, `instagrab-${result!.shortcode}-thumb.jpg`)} download style={{ flex: 1, height: 44 }}>
                    <ImageDown size={16} strokeWidth={1.5} /> Cover
                  </a>
                )}
              </div>
            </div>
            <button onClick={backToInstagram} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(245,239,226,.65)", fontSize: 13, marginTop: 20 }}>
              <ArrowLeft size={14} strokeWidth={1.5} /> Back to Instagram
            </button>
          </>
        )}

        <a href="/" className="mono" style={{ display: "block", marginTop: 18, color: "var(--ink-2)", fontSize: 12, textDecoration: "none" }}>
          Open full InstaGrab →
        </a>
      </div>

      <style jsx>{`
        .qa-glass{
          background: color-mix(in srgb, var(--surface) 72%, transparent);
          border: 1px solid rgb(var(--c-cyan-rgb) / .22);
          border-radius: 26px;
          backdrop-filter: blur(20px) saturate(1.2);
          -webkit-backdrop-filter: blur(20px) saturate(1.2);
          box-shadow: 0 30px 80px -20px rgba(0,0,0,.6);
          animation: qaPop 340ms cubic-bezier(.16,1,.3,1);
        }
        .qa-spin{ animation: qaSpin 900ms linear infinite; }
        @keyframes qaSpin{ to{ transform: rotate(360deg); } }
        @keyframes qaPop{ from{ opacity:0; transform: translateY(16px) scale(.95); } to{ opacity:1; transform:none; } }
      `}</style>
    </div>
  );
}
