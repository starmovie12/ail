"use client";
import { useEffect, useState } from "react";
import { History, Trash2, ExternalLink } from "lucide-react";
import { getDownloadHistory, clearDownloadHistory, type HistoryItem } from "@/lib/retention";
import { dl } from "@/lib/media";

function ago(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function HistoryList() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useEffect(() => { setItems(getDownloadHistory()); }, []);

  if (items === null) return null;

  if (items.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
        <History size={28} strokeWidth={1.25} style={{ margin: "0 auto 12px", display: "block", color: "var(--gold-ink)" }} />
        <b style={{ display: "block", fontSize: 16 }}>Nothing here yet</b>
        <p style={{ color: "var(--ink-3)", fontSize: "var(--t-small)", marginTop: 6 }}>
          Downloads you make on InstaGrab will appear here — stored only in this browser, visible only to you.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="label" style={{ color: "var(--gold-ink)" }}>{items.length} downloads on this device</span>
        <button className="btn btn-ghost" onClick={() => { clearDownloadHistory(); setItems([]); }} style={{ fontSize: 12, color: "var(--err)" }}>
          <Trash2 size={13} strokeWidth={1.5} /> Clear history
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
        {items.map((h) => (
          <a key={h.shortcode + h.at} href={`https://www.instagram.com/p/${h.shortcode}/`} target="_blank" rel="noreferrer"
            className="card" style={{ padding: 10, textDecoration: "none" }}>
            <span style={{ display: "block", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "1/1", background: "var(--surface-2)" }}>
              {h.thumbnail && /* eslint-disable-next-line @next/next/no-img-element */
                <img src={dl(h.thumbnail, "t")} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
            </span>
            <span className="mono" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink-2)" }}>
                {h.username ? "@" + h.username : h.kind}
              </span>
              <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>
                {ago(h.at)} <ExternalLink size={10} strokeWidth={1.5} />
              </span>
            </span>
          </a>
        ))}
      </div>
      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        History lives in this browser&apos;s localStorage only — we store nothing on servers. Thumbnails may expire
        after a while (Instagram CDN links are temporary); tap a card to reopen the original post.
      </p>
    </div>
  );
}
