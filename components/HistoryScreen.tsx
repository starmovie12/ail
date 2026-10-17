"use client";
/** History screen (PRD §12) — Recent Grabs: filter chips, Re-grab, Delete + UNDO, Clear All (2-step), empty state. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, RotateCw, Trash2, History as HistoryIcon, Lock } from "lucide-react";
import { PlatformTile } from "@/components/PlatformIcons";
import { platformById } from "@/lib/platforms";
import { EV, on } from "@/lib/events";
import { clearHistory, getHistory, removeHistory, restoreHistory, setHandoff, streakDays, type GrabRecord } from "@/lib/storage";
import { dl } from "@/lib/media";

const KIND_PARAM: Record<string, string> = { reel: "reel", story: "story", video: "video", photo: "photo", carousel: "photo", profile: "profile", thumbnail: "thumbnail" };
const KIND_LABEL: Record<string, string> = { reel: "Reel", story: "Story", photo: "Photo", carousel: "Carousel", video: "Video", profile: "Profile", audio: "Audio", thumbnail: "Thumbnail", other: "Media" };

function ago(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function Thumb({ rec }: { rec: GrabRecord }) {
  const [bad, setBad] = useState(false);
  const def = platformById(rec.platform);
  if (rec.thumbnail && !bad) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={dl(rec.thumbnail, "t")} alt="" loading="lazy" className="hs-thumb" onError={() => setBad(true)} />;
  }
  return <span className="hs-thumb hs-thumb--fallback" aria-hidden="true">{def && <PlatformTile name={def.iconKey} size={30} showLabel={false} />}</span>;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<GrabRecord[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [undo, setUndo] = useState<GrabRecord | null>(null);
  const [confirm, setConfirm] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => setItems(getHistory()), []);
  useEffect(() => { load(); return on(EV.historyUpdated, load); }, [load]);
  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current); }, []);

  const platforms = useMemo(() => Array.from(new Set((items ?? []).map((i) => i.platform))), [items]);
  const shown = (items ?? []).filter((i) => filter === "all" || i.platform === filter);
  const streak = streakDays(items ?? []);

  function regrab(rec: GrabRecord) {
    const def = platformById(rec.platform);
    if (!def) return;
    const kind = KIND_PARAM[rec.kind];
    const qs = new URLSearchParams({ src: "history" });
    if (kind) qs.set("kind", kind);
    const ok = setHandoff({ url: rec.url, kind, src: "history" });
    if (!ok) qs.set("url", rec.url);
    router.push(`${def.route}?${qs.toString()}`);
  }
  function del(rec: GrabRecord) {
    const removed = removeHistory(rec.id);
    if (!removed) return;
    setUndo(removed);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  }
  function doUndo() { if (undo) restoreHistory(undo); setUndo(null); }
  function clearAll() {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 4000); return; }
    clearHistory(); setConfirm(false);
  }

  if (items === null) return <main className="hs" />;

  return (
    <main className="hs">
      <div className="container" style={{ maxWidth: 1120 }}>
        <div className="hs-title">
          <h1>Recent Grabs <span>({items.length})</span></h1>
          {streak >= 2 && <span className="hs-streak" title={`${streak}-day streak`}><Flame size={14} strokeWidth={2.4} aria-hidden="true" /> {streak}-day streak</span>}
          {items.length > 0 && <button type="button" className="hs-clear hs-clear--top" onClick={clearAll}>{confirm ? "Tap again to confirm" : "Clear All"}</button>}
        </div>

        {items.length === 0 ? (
          <div className="hs-empty">
            <HistoryIcon size={32} strokeWidth={1.5} aria-hidden="true" />
            <strong>Abhi koi grab nahi</strong>
            <p>Jo bhi aap download karenge wo yahan dikhega — sirf aapke device par.</p>
            <Link href="/" className="hs-cta">Link paste karein</Link>
          </div>
        ) : (
          <>
            <div className="hs-chips" role="tablist" aria-label="Platform filter">
              {["all", ...platforms].map((p) => (
                <button key={p} type="button" role="tab" aria-selected={filter === p} className={`hs-chip ${filter === p ? "is-on" : ""}`} onClick={() => setFilter(p)}>
                  {p === "all" ? "All" : platformById(p)?.name ?? p}
                </button>
              ))}
            </div>
            <ul className="hs-list">
              {shown.map((r) => (
                <li key={r.id} className="hs-row">
                  <button type="button" className="hs-main" onClick={() => regrab(r)} aria-label={`Re-grab ${r.author ?? r.title ?? "media"}`}>
                    <Thumb rec={r} />
                    <span className="hs-txt">
                      <b>{r.author ?? r.title ?? "Media"}</b>
                      <small>{platformById(r.platform)?.name ?? r.platform} · {KIND_LABEL[r.kind] ?? "Media"} · {ago(r.at)}</small>
                    </span>
                  </button>
                  <button type="button" className="hs-btn hs-btn--go" onClick={() => regrab(r)} aria-label="Download again"><RotateCw size={18} strokeWidth={2.2} /></button>
                  <button type="button" className="hs-btn hs-btn--del" onClick={() => del(r)} aria-label="Delete from history"><Trash2 size={18} strokeWidth={2.2} /></button>
                </li>
              ))}
            </ul>
            <div className="hs-zone">
              <span><Lock size={14} aria-hidden="true" /> Stored locally on your device</span>
              <button type="button" className="hs-clear" onClick={clearAll}>{confirm ? "Tap again to confirm" : "Clear All History"}</button>
            </div>
          </>
        )}
      </div>

      {undo && (
        <div className="hs-snack" role="status">
          <span>Removed {undo.author ?? "item"} from history</span>
          <button type="button" onClick={doUndo}>UNDO</button>
        </div>
      )}
    </main>
  );
}
