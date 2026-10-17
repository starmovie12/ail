"use client";
import { useState } from "react";
import { Download, Loader2, Check, X, ListChecks } from "lucide-react";
import type { ExtractResult } from "@/lib/extract-ui";
import { dl } from "@/lib/media";

const URL_RE = /instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv|stories)\/[\w-]+/gi;
const MAX = 20;

type Row = { url: string; status: "pending" | "loading" | "done" | "error"; data?: ExtractResult };

export default function BatchDownloader() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  function parse(): string[] {
    const found = text.match(URL_RE) ?? [];
    return Array.from(new Set(found.map((u) => (u.startsWith("http") ? u : "https://" + u)))).slice(0, MAX);
  }

  async function run() {
    const urls = parse();
    if (!urls.length || running) return;
    setRunning(true);
    const init: Row[] = urls.map((url) => ({ url, status: "pending" }));
    setRows(init);
    for (let i = 0; i < urls.length; i++) {
      setRows((r) => r.map((row, j) => (j === i ? { ...row, status: "loading" } : row)));
      try {
        const res = await fetch("/api/extract", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urls[i] }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.error) {
          setRows((r) => r.map((row, j) => (j === i ? { ...row, status: "error" } : row)));
        } else {
          setRows((r) => r.map((row, j) => (j === i ? { ...row, status: "done", data: json.data } : row)));
        }
      } catch {
        setRows((r) => r.map((row, j) => (j === i ? { ...row, status: "error" } : row)));
      }
    }
    setRunning(false);
  }

  const count = parse().length;

  return (
    <div style={{ width: "100%", maxWidth: 760, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="label">Paste up to {MAX} links</span>
          {count > 0 && <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{count} detected</span>}
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder={"https://instagram.com/reel/AAA/\nhttps://instagram.com/p/BBB/\nhttps://instagram.com/reel/CCC/"}
          aria-label="Batch links input" rows={6}
          style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, fontSize: 14, color: "var(--ink)", resize: "vertical", lineHeight: 1.7, fontFamily: "var(--font-mono), monospace" }}
        />
      </div>
      <button className="btn btn-molten" onClick={run} disabled={running || !count} style={{ height: 50, alignSelf: "flex-start" }}>
        {running ? <Loader2 size={18} strokeWidth={1.5} className="spin-loop" /> : <ListChecks size={18} strokeWidth={1.5} />}
        {running ? "Fetching…" : `Fetch ${count || ""} links`}
      </button>

      {rows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((row, i) => {
            const best = row.data?.slides?.[0]?.versions?.[0];
            return (
              <div key={i} className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {row.data?.slides?.[0]
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={dl(row.data.slides[0].thumbnail || row.data.slides[0].url, "t")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : row.status === "loading" ? <Loader2 size={18} className="spin-loop" style={{ color: "var(--ink-3)" }} />
                    : row.status === "error" ? <X size={18} style={{ color: "var(--err)" }} />
                    : <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{i + 1}</span>}
                </span>
                <span className="mono" style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.url.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
                {row.status === "done" && best ? (
                  <a className="btn btn-secondary gold" href={dl(best.url, `instagrab-${row.data!.shortcode}-${best.label.replace(/\W+/g, "")}`)} download style={{ fontSize: 13, flexShrink: 0 }}>
                    <Download size={14} strokeWidth={1.5} /> {best.label}
                  </a>
                ) : row.status === "error" ? (
                  <span className="mono" style={{ fontSize: 12, color: "var(--err)", flexShrink: 0 }}>failed</span>
                ) : row.status === "done" ? (
                  <Check size={16} style={{ color: "var(--ok)", flexShrink: 0 }} />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      <style jsx>{`.spin-loop{ animation:spin 900ms linear infinite; } @keyframes spin{ to{ transform:rotate(360deg); } }`}</style>
    </div>
  );
}
