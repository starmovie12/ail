"use client";
import { useState } from "react";
import { Clapperboard, Image as ImageIcon, GalleryHorizontalEnd, CircleDashed, ImageDown, AtSign, Download, Check, Music, Heart, MessageCircle, Play, Calendar } from "lucide-react";
import type { ExtractResult, Slide } from "@/lib/extract-ui";
import CopyButton from "./CopyButton";
import CreatorPack from "./CreatorPack";
import { recordDownload, playCoin } from "@/lib/retention";
import { fmt } from "@/lib/media";
import { useI18n } from "@/lib/i18n";

/** I3+I5 — tiny gold particle burst + haptic tick on download taps. */
function celebrate(e: React.MouseEvent) {
  try { navigator.vibrate?.(12); } catch {}
  if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const { clientX: x, clientY: y } = e;
  for (let i = 0; i < 8; i++) {
    const p = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.6;
    const dist = 26 + Math.random() * 22;
    p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:5px;height:5px;border-radius:99px;pointer-events:none;z-index:99;background:linear-gradient(135deg,var(--c-cyan),var(--c-magenta));transition:transform 600ms cubic-bezier(.16,1,.3,1),opacity 600ms;`;
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`;
      p.style.opacity = "0";
    });
    setTimeout(() => p.remove(), 700);
  }
}

const KIND_ICON: Record<ExtractResult["kind"], React.ElementType> = {
  reel: Clapperboard, post: ImageIcon, carousel: GalleryHorizontalEnd, story: CircleDashed,
};

function dl(url: string, name: string) {
  return `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
}
function fmtDur(s?: number) {
  if (!s) return null;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function TagChip({ tag }: { tag: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button className={`chip ${ok ? "tick" : ""}`} onClick={async () => {
      try { await navigator.clipboard.writeText(tag); } catch { return; }
      setOk(true); setTimeout(() => setOk(false), 1400);
    }}>
      {ok && <Check size={12} strokeWidth={2} className="coin-in" style={{ color: "var(--gold-ink)" }} />}
      {tag}
    </button>
  );
}

function Mention({ handle }: { handle: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => {
      try { await navigator.clipboard.writeText(handle); } catch { return; }
      setOk(true); setTimeout(() => setOk(false), 1400);
    }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-mono)", fontSize: 13, color: ok ? "var(--gold-ink)" : "var(--ink-2)" }}>
      {handle}{ok ? " ✓" : ""}
    </button>
  );
}

function MediaPreview({ slide, kind }: { slide: Slide; kind: ExtractResult["kind"] }) {
  const ratio = kind === "reel" || kind === "story" ? "9/16" : "1/1";
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", aspectRatio: ratio, background: "var(--surface-2)" }}>
      {slide.type === "video"
        ? <video src={dl(slide.url, "preview")} poster={dl(slide.thumbnail, "thumb")} controls playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : /* eslint-disable-next-line @next/next/no-img-element */
          <img src={dl(slide.url, "photo")} alt="Post media" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
    </div>
  );
}

export default function ResultCard({ data }: { data: ExtractResult }) {
  const { t } = useI18n();
  const KindIcon = KIND_ICON[data.kind];
  const main = data.slides[0];
  if (!main) return null;
  const best = main.versions[0];
  const dur = fmtDur(data.durationSeconds);
  const base = `instagrab-${data.shortcode}`;
  // NOTE: no ad/sponsor calls in here — anything that opens a tab or eats the
  // click gesture breaks the actual file download (learned the hard way).
  const onDownload = (e: React.MouseEvent) => {
    celebrate(e);
    playCoin();
    recordDownload({ shortcode: data.shortcode, kind: data.kind, username: data.username, thumbnail: data.thumbnail });
  };

  return (
    <div className="card intro-rise" style={{ padding: 24, maxWidth: 920, margin: "0 auto", textAlign: "left" }}>
      {/* Meta row */}
      <div className="mono" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-3)", marginBottom: data.likes != null || data.views != null ? 10 : 20, flexWrap: "wrap" }}>
        <KindIcon size={16} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} />
        <span className="label" style={{ color: "var(--gold-ink)" }}>{data.kind}</span>
        {data.username && <span>@{data.username}</span>}
        {dur && <span>{dur}</span>}
      </div>

      {/* A3 — post metadata card */}
      {(data.likes != null || data.views != null || data.commentCount != null || data.takenAt != null) && (
        <div className="mono" style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12.5, color: "var(--ink-2)", marginBottom: 20, flexWrap: "wrap" }}>
          {data.views != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Play size={13} strokeWidth={1.75} style={{ color: "var(--gold-ink)" }} /> {fmt(data.views)} views
            </span>
          )}
          {data.likes != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Heart size={13} strokeWidth={1.75} style={{ color: "var(--gold-ink)" }} /> {fmt(data.likes)} likes
            </span>
          )}
          {data.commentCount != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <MessageCircle size={13} strokeWidth={1.75} style={{ color: "var(--gold-ink)" }} /> {fmt(data.commentCount)} comments
            </span>
          )}
          {data.takenAt != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Calendar size={13} strokeWidth={1.75} style={{ color: "var(--gold-ink)" }} />
              {new Date(data.takenAt * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      )}

      <div className="result-grid">
        {/* Media */}
        <div className="intro-rise" style={{ ["--dl" as string]: "120ms" }}>
          <MediaPreview slide={main} kind={data.kind} />
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {/* Downloads */}
          <div className="intro-rise" style={{ ["--dl" as string]: "200ms" }}>
            <span className="label" style={{ display: "block", marginBottom: 10 }}>{t("dlLabel")}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {main.versions.map((v, i) => (
                <a key={i} href={dl(v.url, `${base}-${v.label.replace(/\W+/g, "")}`)}
                  className={`btn btn-secondary ${i === 0 ? "gold" : ""}`} download onClick={onDownload}>
                  <Download size={16} strokeWidth={1.5} />
                  {i === 0 ? `${t("dlLabel")} ${v.label}` : v.label}
                </a>
              ))}
              {main.audioUrl && (
                <a href={dl(main.audioUrl, `${base}-audio`)} className="btn btn-secondary" download>
                  <Music size={16} strokeWidth={1.5} /> {t("audio")}
                </a>
              )}
              {data.thumbnail && (
                <a href={dl(data.thumbnail, `${base}-thumbnail`)} className="btn btn-secondary" download>
                  <ImageDown size={16} strokeWidth={1.5} /> {t("thumbnail")}
                </a>
              )}
              {best && <CopyButton text={best.url} label={t("copyLink")} className="btn btn-secondary" />}
              <CreatorPack data={data} />
            </div>
          </div>

          {/* Carousel strip */}
          {data.slides.length > 1 && (
            <div className="intro-rise" style={{ ["--dl" as string]: "260ms" }}>
              <span className="label" style={{ display: "block", marginBottom: 10 }}>{t("slides")} ({data.slides.length})</span>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 6, WebkitMaskImage: "linear-gradient(90deg,#000 92%,transparent)" }}>
                {data.slides.map((s, i) => (
                  <div key={i} style={{ flexShrink: 0, scrollSnapAlign: "start", width: 96 }}>
                    <div style={{ width: 96, height: 96, borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={dl(s.thumbnail, "t")} alt={`Slide ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{i + 1}/{data.slides.length}</span>
                      <a href={dl(s.url, `${base}-slide-${i + 1}`)} download aria-label={`Download slide ${i + 1}`}
                        style={{ color: "var(--gold-ink)", display: "inline-flex" }}>
                        <Download size={14} strokeWidth={1.5} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caption — the wedge */}
          {data.caption && (
            <div className="intro-rise" style={{ ["--dl" as string]: "300ms" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span className="label">{t("caption")}</span>
                <CopyButton text={data.caption} className="btn btn-secondary" />
              </div>
              <div className="well" style={{ padding: 16, maxHeight: 180, overflowY: "auto", whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)", userSelect: "all" }}>
                {data.caption}
              </div>
            </div>
          )}

          {/* Hashtags — the wedge */}
          {data.hashtags.length > 0 && (
            <div className="intro-rise" style={{ ["--dl" as string]: "380ms" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span className="label">{t("hashtags")} ({data.hashtags.length})</span>
                <CopyButton text={data.hashtags.join(" ")} label={t("copyAll")} className="btn btn-secondary" />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.hashtags.map(t => <TagChip key={t} tag={t} />)}
              </div>
            </div>
          )}

          {/* Mentions */}
          {data.mentions.length > 0 && (
            <div className="intro-rise" style={{ ["--dl" as string]: "460ms", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span className="label" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <AtSign size={14} strokeWidth={1.5} /> {t("mentions")}
              </span>
              {data.mentions.map(m => <Mention key={m} handle={m} />)}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .result-grid{ display:grid; grid-template-columns:minmax(220px,280px) 1fr; gap:24px; }
        @media (max-width:700px){ .result-grid{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
