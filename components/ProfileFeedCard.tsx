"use client";
import { useState } from "react";
import {
  BadgeCheck, ImageDown, Clapperboard, GalleryHorizontalEnd, Heart,
  MessageCircle, Pin, ExternalLink, Download, Package, Loader2,
} from "lucide-react";
import { dl, fmt, type FeedPost, type ProfileFeed } from "@/lib/media";
import { useI18n } from "@/lib/i18n";

const POST_ICON = { image: ImageDown, video: Clapperboard, carousel: GalleryHorizontalEnd } as const;

/** Shared profile header + stats + bio + posts grid — used by the universal
 *  home box, the Profile Viewer, and the Bulk downloader. */
export default function ProfileFeedCard({ data, showBulk = false }: { data: ProfileFeed; showBulk?: boolean }) {
  const { t } = useI18n();
  const [zipping, setZipping] = useState(false);
  const [zipMsg, setZipMsg] = useState("");
  const name = data.username || "user";

  async function downloadZip() {
    if (zipping || !data.postsList?.length) return;
    setZipping(true); setZipMsg("");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      let ok = 0;
      for (let i = 0; i < data.postsList.length; i++) {
        const p = data.postsList[i];
        setZipMsg(`${i + 1}/${data.postsList.length}`);
        try {
          const res = await fetch(dl(p.thumbnail, "post"));
          if (!res.ok) continue;
          const blob = await res.blob();
          zip.file(`${String(i + 1).padStart(2, "0")}-${p.shortcode}.jpg`, blob);
          ok++;
        } catch { /* skip this one */ }
      }
      if (!ok) { setZipMsg("✕"); setZipping(false); return; }
      const out = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url; a.download = `instagrab-${name}-posts.zip`; a.click();
      URL.revokeObjectURL(url);
      setZipMsg("✓");
    } catch {
      setZipMsg("✕");
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="card intro-rise" style={{ padding: 24, maxWidth: 920, margin: "0 auto", width: "100%", textAlign: "left" }}>
      {/* Profile header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--gold-300)", flexShrink: 0, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
          {data.profilePicHd
            /* eslint-disable-next-line @next/next/no-img-element */
            ? <img src={dl(data.profilePicHd, "avatar")} alt={`@${data.username} profile`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (data.username || "?").charAt(0).toUpperCase()}
        </span>
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
          <b style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            @{data.username}
            {data.isVerified && <BadgeCheck size={16} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} />}
          </b>
          {data.fullName && <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>{data.fullName}</span>}
        </span>
        <a className="btn btn-secondary" href={dl(data.profilePicHd, `instagrab-${name}-dp.jpg`)} download style={{ fontSize: 13 }}>
          <ImageDown size={14} strokeWidth={1.5} /> DP
        </a>
      </div>

      <div className="mono" style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--ink-2)", flexWrap: "wrap", marginBottom: 16 }}>
        <span><b style={{ color: "var(--ink)" }}>{fmt(data.posts)}</b> {t("posts")}</span>
        <span><b style={{ color: "var(--ink)" }}>{fmt(data.followers)}</b> {t("followers")}</span>
        <span><b style={{ color: "var(--ink)" }}>{fmt(data.following)}</b> {t("following")}</span>
      </div>

      {data.biography && (
        <div className="well" style={{ padding: 16, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)", marginBottom: 20 }}>{data.biography}</div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <span className="label">{t("recentPosts")}</span>
        {showBulk && data.postsList.length > 0 && (
          <button className="btn btn-secondary gold" onClick={downloadZip} disabled={zipping} style={{ fontSize: 13 }}>
            {zipping ? <Loader2 size={14} strokeWidth={1.5} className="spin-loop" /> : <Package size={14} strokeWidth={1.5} />}
            {t("downloadAllZip")}{zipMsg && ` ${zipMsg}`}
          </button>
        )}
      </div>

      {data.postsList.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {data.postsList.map((p: FeedPost) => {
            const PIcon = POST_ICON[p.type];
            return (
              <div key={p.shortcode} className="card feed-cell" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--surface-2)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dl(p.thumbnail, "post")} alt={p.caption ? p.caption.slice(0, 60) : `@${name} post`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <span style={{ position: "absolute", top: 8, right: 8, color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.6))", display: "inline-flex" }}>
                    <PIcon size={16} strokeWidth={1.75} />
                  </span>
                  {p.isPinned && (
                    <span style={{ position: "absolute", top: 8, left: 8, color: "var(--gold-200)", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.6))", display: "inline-flex" }} aria-label={t("pinned")}>
                      <Pin size={14} strokeWidth={1.75} />
                    </span>
                  )}
                </div>
                <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="mono" style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-3)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Heart size={12} strokeWidth={1.5} /> {fmt(p.likes)}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MessageCircle size={12} strokeWidth={1.5} /> {fmt(p.comments)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <a className="btn btn-secondary gold" href={dl(p.thumbnail, `instagrab-${name}-${p.shortcode}.jpg`)} download
                      style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "6px 8px" }} aria-label="Download image">
                      <Download size={13} strokeWidth={1.5} />
                    </a>
                    <a className="btn btn-secondary" href={`https://www.instagram.com/p/${p.shortcode}/`} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "6px 8px" }} aria-label="Open on Instagram">
                      <ExternalLink size={13} strokeWidth={1.5} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>{t("noPosts")}</p>
      )}

      <style jsx>{`
        .feed-cell{ transition:transform 200ms var(--ease-silk), box-shadow 200ms var(--ease-silk); }
        .feed-cell:hover{ transform:translateY(-3px); box-shadow:var(--shadow-1); }
        .spin-loop{ animation:spin 900ms linear infinite; }
        @keyframes spin{ to{ transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
