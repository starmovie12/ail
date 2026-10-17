"use client";
/**
 * ResultPanel (PRD §10.7, A20) — GoldenBar ka inline result + ResultCard/CreatorPack ke features, ek jagah:
 * preview, author, type badge, Copy Caption, hashtag chips + Copy Hashtags, mentions, Download, Audio,
 * Save Thumbnail, Download All (ZIP). Markup/CSS GoldenBar ke `.gb-result-*` classes (look same).
 */
import React, { useMemo, useState } from "react";
import { Check, Copy, Download, ImageDown, Music, Package, RotateCcw } from "lucide-react";
import { GOLDEN_BAR_STYLES } from "@/components/GoldenBar";
import { buildDownloadProxyUrl, type ExtractedResult } from "@/lib/normalize";
import { celebrate } from "@/lib/feedback";
import { fmt } from "@/lib/media";

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
const MENTION_RE = /@[A-Za-z0-9_.]+/g;

function unique(a: string[]) { return Array.from(new Set(a)); }

export default function ResultPanel({
  result, platformName, pulseSave, onAnother, children,
}: {
  result: ExtractedResult;
  platformName: string;
  /** iOS Safari: auto-save skip hua — Save button pulse kare + hint (R8) */
  pulseSave?: boolean;
  onAnother: () => void;
  /** Profile extras (stories / highlights) */
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState<"caption" | "tags" | "">("");
  const [zip, setZip] = useState<"idle" | "packing" | "done" | "error">("idle");
  const caption = result.caption ?? "";
  const hashtags = useMemo(() => unique(caption.match(HASHTAG_RE) ?? []), [caption]);
  const mentions = useMemo(() => unique(caption.match(MENTION_RE) ?? []), [caption]);
  const media = result.media ?? [];
  const base = (result.author?.username || platformName || "media").replace(/[^\w.-]/g, "") || "media";
  const audio = media.find((m) => m.audioUrl)?.audioUrl || result.audioUrl;
  const isProfile = result.type === "profile";
  const multi = media.length > 1 && !isProfile && result.type !== "thumbnail";

  async function copy(text: string, kind: "caption" | "tags") {
    try { await navigator.clipboard.writeText(text); setCopied(kind); setTimeout(() => setCopied(""), 1800); } catch { /* ignore */ }
  }

  async function downloadZip(e: React.MouseEvent) {
    celebrate(e.clientX, e.clientY);
    if (zip === "packing") return;
    setZip("packing");
    try {
      const { default: JSZip } = await import("jszip");
      const z = new JSZip();
      const add = async (name: string, url: string) => {
        const r = await fetch(buildDownloadProxyUrl(url, name));
        if (!r.ok) throw new Error("fetch failed");
        z.file(name, await r.blob());
      };
      for (let i = 0; i < media.length; i++) await add(`${base}-${i + 1}.${media[i].type === "video" ? "mp4" : media[i].type === "audio" ? "m4a" : "jpg"}`, media[i].url);
      if (audio) await add(`${base}-audio.m4a`, audio);
      if (caption) z.file("caption.txt", caption);
      if (hashtags.length) z.file("hashtags.txt", hashtags.join(" "));
      z.file("info.txt", `Source: ${result.platform ?? platformName}\nAuthor: ${result.author?.username ? "@" + result.author.username : "-"}\nPacked by InstaGrab — download only content you own or have permission to use.`);
      const blob = await z.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${base}-pack.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
      setZip("done"); setTimeout(() => setZip("idle"), 2500);
    } catch { setZip("error"); setTimeout(() => setZip("idle"), 3000); }
  }

  const badge = (result.type || "media").toUpperCase();

  return (
    <div className="gb-wrapper rp">
      <style dangerouslySetInnerHTML={{ __html: GOLDEN_BAR_STYLES + RP_STYLES }} />
      <div className="gb-result-card" aria-live="polite">
        <div className="rp-meta">
          <span className="rp-badge">{badge}</span>
          {typeof result.views === "number" && <span>{fmt(result.views)} views</span>}
          {typeof result.likes === "number" && <span>{fmt(result.likes)} likes</span>}
          {typeof result.comments === "number" && <span>{fmt(result.comments)} comments</span>}
        </div>

        {(result.author?.username || result.author?.avatar || (result.title && !isProfile)) && (
          <div className="gb-result-header">
            <div className="gb-author-box">
              {result.author?.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={buildDownloadProxyUrl(result.author.avatar, "avatar")} alt={result.author.username || "Creator"} className="gb-author-avatar" />
              )}
              <div>
                <div className="gb-author-name-row">
                  <span className="gb-author-name">
                    {result.author?.fullName || (result.author?.username ? `@${result.author.username}` : result.title)}
                  </span>
                  {result.author?.verified && <span className="gb-verified" title="Verified">✓</span>}
                </div>
                {result.author?.username && <span className="gb-author-handle">@{result.author.username}</span>}
              </div>
            </div>
            {typeof result.author?.followers === "number" && (
              <div className="gb-profile-stats">
                <div className="gb-stat"><strong>{result.author.followers.toLocaleString()}</strong><span>Followers</span></div>
                {typeof result.author.following === "number" && <div className="gb-stat"><strong>{result.author.following.toLocaleString()}</strong><span>Following</span></div>}
                {typeof result.author.postsCount === "number" && <div className="gb-stat"><strong>{result.author.postsCount.toLocaleString()}</strong><span>Posts</span></div>}
              </div>
            )}
            {isProfile && result.author?.avatar && (
              <a
                href={buildDownloadProxyUrl(result.author.avatar, `${result.author.username || "profile"}-dp.jpg`)}
                download onClick={(e) => celebrate(e.clientX, e.clientY)}
                className={`gb-dp-btn ${pulseSave ? "rp-pulse" : ""}`}
              >
                <Download size={16} strokeWidth={2.2} aria-hidden="true" /> Download HD DP
              </a>
            )}
          </div>
        )}

        {!isProfile && media.length > 0 && (
          <div className="gb-media-grid">
            {media.map((item, idx) => {
              const ext = item.type === "video" ? "mp4" : item.type === "audio" ? "m4a" : "jpg";
              const fname = item.filename || `${base}-${idx + 1}.${ext}`;
              const href = buildDownloadProxyUrl(item.url, fname);
              return (
                <div key={`${item.url}-${idx}`} className="gb-media-item">
                  <div className="gb-media-preview">
                    {item.type === "video" ? (
                      <video src={buildDownloadProxyUrl(item.url, fname)} poster={item.thumbnail ? buildDownloadProxyUrl(item.thumbnail, "poster") : undefined} controls playsInline preload="metadata" className="gb-video" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={buildDownloadProxyUrl(item.url, fname)} alt={`${platformName} media ${idx + 1}`} loading="lazy" className="gb-image" />
                    )}
                    <span className="gb-quality-tag">{item.quality || (item.type === "video" ? "HD MP4" : "HD JPG")}</span>
                  </div>
                  <div className="gb-media-footer">
                    <a href={href} download={fname} onClick={(e) => celebrate(e.clientX, e.clientY)} className={`gb-download-primary ${pulseSave && idx === 0 ? "rp-pulse" : ""}`}>
                      <span><Download size={16} strokeWidth={2.2} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> Download {item.type === "video" ? "Video (MP4)" : "Photo (HD)"}</span>
                    </a>
                    {item.thumbnail && item.type === "video" && (
                      <a href={buildDownloadProxyUrl(item.thumbnail, `${base}-thumb.jpg`)} download className="gb-download-secondary">
                        <ImageDown size={15} strokeWidth={2} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> Save Thumbnail
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pulseSave && <p className="rp-hint">iPhone/iPad par download ke liye Save button ko ek baar tap karein.</p>}

        {(audio || multi || (zip !== "idle")) && !isProfile && (
          <div className="rp-actions">
            {audio && (
              <a href={buildDownloadProxyUrl(audio, `${base}-audio.m4a`)} download onClick={(e) => celebrate(e.clientX, e.clientY)} className="gb-download-secondary">
                <Music size={15} strokeWidth={2} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> Download Audio
              </a>
            )}
            {multi && (
              <button type="button" onClick={downloadZip} className="gb-download-secondary" disabled={zip === "packing"}>
                <Package size={15} strokeWidth={2} aria-hidden="true" style={{ verticalAlign: "-3px" }} />{" "}
                {zip === "packing" ? "Packing…" : zip === "done" ? "Saved ✓" : zip === "error" ? "Failed — retry" : `Download All (ZIP · ${media.length})`}
              </button>
            )}
          </div>
        )}

        {caption && !isProfile && (
          <div className="gb-caption-box">
            <div className="gb-caption-top">
              <span className="gb-caption-label">Caption{hashtags.length ? " & Hashtags" : ""}</span>
              <button type="button" onClick={() => copy(caption, "caption")} className="gb-copy-btn">
                {copied === "caption" ? <><Check size={14} strokeWidth={2.6} aria-hidden="true" /> Copied!</> : <><Copy size={14} strokeWidth={2} aria-hidden="true" /> Copy Caption</>}
              </button>
            </div>
            <p className="gb-caption-text">{caption}</p>
            {hashtags.length > 0 && (
              <div className="rp-tags">
                <div className="rp-tags__row">
                  {hashtags.map((h) => (
                    <button key={h} type="button" className="rp-tag" onClick={() => copy(h, "tags")} title="Copy">{h}</button>
                  ))}
                </div>
                <button type="button" onClick={() => copy(hashtags.join(" "), "tags")} className="gb-copy-btn">
                  {copied === "tags" ? <><Check size={14} strokeWidth={2.6} aria-hidden="true" /> Copied!</> : <><Copy size={14} strokeWidth={2} aria-hidden="true" /> Copy Hashtags</>}
                </button>
              </div>
            )}
            {mentions.length > 0 && <p className="rp-mentions">Mentions: {mentions.join(" · ")}</p>}
          </div>
        )}

        {children}

        <button type="button" className="rp-another" onClick={onAnother}>
          <RotateCcw size={16} strokeWidth={2.2} aria-hidden="true" /> Download another
        </button>
      </div>
    </div>
  );
}

const RP_STYLES = `
  .rp .gb-result-card { margin-top: 0; }
  .rp-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; font-size: 13px; color: var(--ink-3); margin-bottom: 12px; }
  .rp-badge { font-weight: 800; letter-spacing: .08em; font-size: 11px; padding: 4px 10px; border-radius: 999px; color: var(--gold-ink); border: 1px solid var(--line-strong); background: rgb(var(--c-cyan-rgb) / .08); }
  .rp-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
  .rp-actions .gb-download-secondary { cursor: pointer; }
  .rp-tags { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
  .rp-tags__row { display: flex; flex-wrap: wrap; gap: 6px; }
  .rp-tag { min-height: 32px; padding: 0 12px; border-radius: 999px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--gold-ink); background: rgb(var(--c-cyan-rgb) / .08); border: 1px solid var(--line-strong); }
  .rp-mentions { margin: 10px 0 0; font-size: 13px; color: var(--ink-3); overflow-wrap: anywhere; }
  .rp-hint { margin: 10px 0 0; font-size: 13px; color: var(--warn); }
  .rp-another { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; min-height: 44px; padding: 0 18px; border-radius: 999px; cursor: pointer; font-weight: 700; font-size: 14px; color: var(--ink); background: var(--bg-surface); border: 1px solid var(--border-color); }
  @keyframes rpPulse { 0%,100% { box-shadow: 0 0 0 0 rgb(var(--c-cyan-rgb) / .55); } 50% { box-shadow: 0 0 0 10px rgb(var(--c-cyan-rgb) / 0); } }
  .rp-pulse { animation: rpPulse 1.4s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .rp-pulse { animation: none; outline: 2px solid var(--c-cyan); } }
`;
