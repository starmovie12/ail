"use client";
import { useState } from "react";
import { Link2, MessageCircle, Download, AlertTriangle, Copy, Check } from "lucide-react";
import type { ExtractResult, PostComment } from "@/lib/extract-ui";

function toCsv(comments: PostComment[]): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = comments.map((c) => [esc(c.username), esc(c.text), String(c.likes ?? "")].join(","));
  return ["username,comment,likes", ...rows].join("\r\n");
}

export default function CommentsExporter() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!/instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\//i.test(url.trim())) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300);
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.error) setError(json?.error?.message ?? "Something went wrong — try again.");
      else setResult(json.data as ExtractResult);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally { setLoading(false); }
  }

  const comments = result?.comments ?? [];

  function downloadCsv() {
    const blob = new Blob(["﻿" + toCsv(comments)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `instagrab-comments-${result?.shortcode ?? "post"}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
  }

  async function copyAll() {
    const text = comments.map((c) => `@${c.username}: ${c.text}`).join("\n");
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar cbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><Link2 size={20} strokeWidth={1.5} /></span>
        <input
          value={url} disabled={loading}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Paste a post or reel link to export its comments"
          aria-label="Instagram post link"
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <MessageCircle size={18} strokeWidth={1.5} />
          <span>{loading ? "Fetching…" : "Get comments"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {result && comments.length === 0 && (
        <div className="card intro-rise" style={{ padding: 18, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <AlertTriangle size={18} strokeWidth={1.5} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 2 }} />
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>
            No comments came back for this post — either it has none, comments are limited, or Instagram
            didn&apos;t include them this time. Try again in a moment.
          </span>
        </div>
      )}

      {comments.length > 0 && result && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <span className="label" style={{ color: "var(--gold-ink)" }}>
              {comments.length} recent comments · @{result.username}
            </span>
            <span style={{ display: "flex", gap: 8 }}>
              <button className={`btn btn-secondary ${copied ? "tick" : ""}`} onClick={copyAll} style={{ fontSize: 13 }}>
                {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button className="btn btn-secondary gold" onClick={downloadCsv} style={{ fontSize: 13 }}>
                <Download size={14} strokeWidth={1.5} /> CSV / Excel
              </button>
            </span>
          </div>
          <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {comments.map((c, i) => (
              <div key={i} className="well" style={{ padding: "10px 14px" }}>
                <b className="mono" style={{ fontSize: 12, color: "var(--gold-ink)" }}>@{c.username}</b>
                <span style={{ display: "block", fontSize: 13.5, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.5 }}>{c.text}</span>
              </div>
            ))}
          </div>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 14, lineHeight: 1.6 }}>
            Honest note: without login, Instagram exposes the most recent ~40-50 comments of a public post —
            that&apos;s what you get here, free. The CSV opens directly in Excel/Sheets.
          </p>
        </div>
      )}

      <style jsx>{`
        .cbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .cbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .cbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
