"use client";
/** Instagram profile ke options: DP ke saath Stories + Highlights (PRD §7.6.2 "options dikhao", R6). */
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { profileExtras } from "@/lib/api";
import { buildDownloadProxyUrl } from "@/lib/normalize";
import { celebrate } from "@/lib/feedback";
import ErrorCard, { type ErrorCode } from "@/components/ErrorCard";

type Item = { id?: string; type: "video" | "image"; url: string; thumbnail: string };
type Album = { id: string; title: string; cover: string };

export default function ProfileExtras({ username }: { username: string }) {
  const [busy, setBusy] = useState<"" | "stories" | "highlights" | "album">("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [albums, setAlbums] = useState<Album[] | null>(null);
  const [err, setErr] = useState<ErrorCode | null>(null);

  async function loadStories() {
    setBusy("stories"); setErr(null); setAlbums(null);
    const r = await profileExtras(username, "stories");
    setBusy("");
    if (!r.ok) { setErr(r.code === "EXTRACTOR_DOWN" || r.code === "NOT_FOUND" ? "STORY_EXPIRED" : r.code); setItems(null); return; }
    setItems((r.json.items as Item[]) ?? []);
  }
  async function loadHighlights() {
    setBusy("highlights"); setErr(null); setItems(null);
    const r = await profileExtras(username, "highlights");
    setBusy("");
    if (!r.ok) { setErr(r.code); setAlbums(null); return; }
    setAlbums((r.json.albums as Album[]) ?? []);
  }
  async function openAlbum(id: string) {
    setBusy("album"); setErr(null);
    const r = await profileExtras(username, "highlight-items", { highlightId: id });
    setBusy("");
    if (!r.ok) { setErr(r.code); return; }
    setItems((r.json.items as Item[]) ?? []);
  }

  return (
    <div className="pe">
      <div className="pe__btns">
        <button type="button" className="pe__btn" onClick={loadStories} disabled={Boolean(busy)}>
          {busy === "stories" && <Loader2 size={16} className="pe__spin" aria-hidden="true" />} Stories
        </button>
        <button type="button" className="pe__btn" onClick={loadHighlights} disabled={Boolean(busy)}>
          {busy === "highlights" && <Loader2 size={16} className="pe__spin" aria-hidden="true" />} Highlights
        </button>
      </div>
      {err && <div style={{ marginTop: 12 }}><ErrorCard code={err} /></div>}
      {albums && !items && (
        <ul className="pe__albums">
          {albums.length === 0 && <li className="pe__empty">Koi highlight nahi mila.</li>}
          {albums.map((a) => (
            <li key={a.id}>
              <button type="button" className="pe__album" onClick={() => openAlbum(a.id)} disabled={busy === "album"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={buildDownloadProxyUrl(a.cover, "cover")} alt="" loading="lazy" />
                <span>{a.title || "Highlight"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {items && (
        <div className="pe__grid">
          {items.length === 0 && <p className="pe__empty">Kuch nahi mila.</p>}
          {items.map((it, i) => {
            const name = `${username}-${i + 1}.${it.type === "video" ? "mp4" : "jpg"}`;
            return (
              <div key={it.id ?? i} className="pe__item">
                {it.type === "video"
                  ? <video src={buildDownloadProxyUrl(it.url, name)} controls playsInline preload="metadata" />
                  // eslint-disable-next-line @next/next/no-img-element
                  : <img src={buildDownloadProxyUrl(it.url, name)} alt="" loading="lazy" />}
                <a href={buildDownloadProxyUrl(it.url, name)} download={name} onClick={(e) => celebrate(e.clientX, e.clientY)} className="gb-download-primary">
                  <span><Download size={15} strokeWidth={2.2} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> Download</span>
                </a>
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        .pe { margin-top: 16px; }
        .pe__btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .pe__btn { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border-radius: 999px; cursor: pointer; font-weight: 700; font-size: 14px; color: var(--ink); background: var(--bg-surface); border: 1px solid var(--line-strong); }
        .pe__btn:disabled { opacity: .6; cursor: default; }
        .pe__spin { animation: peSpin .8s linear infinite; } @keyframes peSpin { to { transform: rotate(360deg); } }
        .pe__albums { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 12px; }
        .pe__album { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 6px; background: none; border: 0; cursor: pointer; color: var(--ink); font-size: 12px; }
        .pe__album img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid var(--line-strong); }
        .pe__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-top: 14px; }
        .pe__item { display: flex; flex-direction: column; gap: 8px; }
        .pe__item img, .pe__item video { width: 100%; aspect-ratio: 9/16; object-fit: cover; border-radius: 14px; background: var(--surface-2); }
        .pe__empty { color: var(--ink-3); font-size: 14px; }
      `}</style>
    </div>
  );
}
