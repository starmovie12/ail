"use client";
import { useState } from "react";
import {
  AtSign, Search, Download, BadgeCheck, ImageDown, AlertTriangle, Eye, Music,
} from "lucide-react";
import AdFrame from "./AdFrame";
import ProfileFeedCard from "./ProfileFeedCard";
import { dl, fmt } from "@/lib/media";
import { useI18n } from "@/lib/i18n";

type Mode = "dp" | "stories" | "viewer" | "highlights" | "feed";
type Quality = { label: string; url: string };
type StoryItem = { type: "video" | "image"; url: string; thumbnail: string; takenAt: number; qualities?: Quality[]; audioUrl?: string };
type HighlightAlbum = { id: string; title: string; cover: string };

const REQUEST_TYPE: Record<Mode, string> = { dp: "dp", stories: "stories", viewer: "stories", highlights: "highlights", feed: "feed" };

function StoryCard({ item, name, index }: { item: StoryItem; name: string; index: number }) {
  const ext = item.type === "video" ? "mp4" : "jpg";
  const qs = item.qualities?.length
    ? item.qualities
    : [{ label: item.type === "video" ? "HD" : "Original", url: item.url }];
  return (
    <div className="card intro-rise" style={{ padding: 16, ["--dl" as string]: `${index * 60}ms` }}>
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "9/16", background: "var(--surface-2)" }}>
        {item.type === "video"
          ? <video src={dl(item.url, "preview")} poster={item.thumbnail ? dl(item.thumbnail, "thumb") : undefined} controls playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : /* eslint-disable-next-line @next/next/no-img-element */
            <img src={dl(item.url, "photo")} alt={`Story ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {qs.map((q, qi) => (
          <a key={q.label + qi} href={dl(q.url, `instagrab-${name}-story-${index + 1}-${q.label.replace(/\W+/g, "")}.${ext}`)}
            className={`btn btn-secondary ${qi === 0 ? "gold" : ""}`} download style={{ fontSize: 13 }}>
            <Download size={14} strokeWidth={1.5} /> {qi === 0 ? `${item.type === "video" ? "Video" : "Photo"} ${q.label}` : q.label}
          </a>
        ))}
        {item.audioUrl && (
          <a href={dl(item.audioUrl, `instagrab-${name}-story-${index + 1}-audio.m4a`)}
            className="btn btn-secondary" download style={{ fontSize: 13 }}>
            <Music size={14} strokeWidth={1.5} /> Audio
          </a>
        )}
      </div>
    </div>
  );
}

export default function UsernameTool({ mode, placeholder }: { mode: Mode; placeholder?: string }) {
  const { t, lang } = useI18n();
  // Bespoke per-page placeholders are English; fall back to the translated
  // generic one whenever another language is active.
  const hint = lang === "en" && placeholder ? placeholder : t("userPlaceholder");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<Record<string, StoryItem[]>>({});
  const [invalid, setInvalid] = useState(false);

  async function go() {
    if (loading) return;
    if (!username.trim()) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300);
      return;
    }
    setLoading(true); setError(null); setData(null); setItems({});
    try {
      const res = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: REQUEST_TYPE[mode], username }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) setError(json?.error ?? "Something went wrong. Please try again.");
      else setData(json);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally { setLoading(false); }
  }

  async function loadHighlight(id: string) {
    if (items[id]) return;
    try {
      const res = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "highlight-items", highlightId: id }),
      });
      const json = await res.json();
      if (res.ok) setItems((p) => ({ ...p, [id]: json.items ?? [] }));
    } catch { /* ignore */ }
  }

  const name = data?.username ?? "user";

  return (
    <div style={{ width: "100%" }}>
      <div className={`bar ubar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ maxWidth: 720, margin: "0 auto" }}>
        <span className="ubar-icon" aria-hidden="true"><AtSign size={20} strokeWidth={1.5} /></span>
        <input
          value={username} disabled={loading}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === "Enter" && go()}
          placeholder={hint}
          aria-label="Instagram username"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          className="ubar-input"
        />
        <button className="btn btn-molten ubar-go" onClick={go} disabled={loading} style={{ height: 48 }}>
          {mode === "viewer" ? <Eye size={20} strokeWidth={1.5} /> : <Search size={20} strokeWidth={1.5} />}
          <span>{loading ? t("fetching") : mode === "viewer" ? t("view") : t("search")}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{
          display: "flex", gap: 16, alignItems: "flex-start", padding: 20, maxWidth: 720, margin: "24px auto 0",
          textAlign: "left", borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5,
        }}>
          <span className="medallion" style={{ flexShrink: 0, color: "var(--err)" }}>
            <AlertTriangle size={24} strokeWidth={1.5} />
          </span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {data && mode === "feed" && (
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <ProfileFeedCard data={data} showBulk />
          <div style={{ maxWidth: 920, margin: "0 auto", width: "100%" }}><AdFrame slotH={280} /></div>
        </div>
      )}

      {data && mode !== "feed" && (
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card intro-rise" style={{ padding: 24, maxWidth: 920, margin: "0 auto", width: "100%", textAlign: "left" }}>
            {/* Profile header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <span style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--gold-300)", flexShrink: 0, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {data.profilePicHd
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={dl(data.profilePicHd, "avatar")} alt={`@${data.username} profile`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (data.username || "?").charAt(0).toUpperCase()}
              </span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <b style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  @{data.username}
                  {data.isVerified && <BadgeCheck size={16} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} />}
                </b>
                {data.fullName && <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>{data.fullName}</span>}
              </span>
            </div>

            {mode === "dp" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {data.followers != null && (
                  <div className="mono" style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--ink-2)", flexWrap: "wrap" }}>
                    <span><b style={{ color: "var(--ink)" }}>{fmt(data.posts)}</b> {t("posts")}</span>
                    <span><b style={{ color: "var(--ink)" }}>{fmt(data.followers)}</b> {t("followers")}</span>
                    <span><b style={{ color: "var(--ink)" }}>{fmt(data.following)}</b> {t("following")}</span>
                  </div>
                )}
                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", maxWidth: 360 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dl(data.profilePicHd, "dp-preview")} alt={`@${data.username} full-size profile picture`} style={{ width: "100%", display: "block" }} />
                </div>
                <div>
                  <a className="btn btn-secondary gold" href={dl(data.profilePicHd, `instagrab-${data.username}-dp.jpg`)} download>
                    <ImageDown size={16} strokeWidth={1.5} /> {t("dpDownload")}
                  </a>
                </div>
                {data.biography && (
                  <div>
                    <span className="label" style={{ display: "block", marginBottom: 10 }}>{t("bio")}</span>
                    <div className="well" style={{ padding: 16, whiteSpace: "pre-wrap", fontSize: "var(--t-small)", color: "var(--ink-2)" }}>{data.biography}</div>
                  </div>
                )}
              </div>
            )}

            {(mode === "stories" || mode === "viewer") && Array.isArray(data.items) && (
              <div>
                <span className="label" style={{ display: "block", marginBottom: 14 }}>
                  {data.items.length} {t("activeStories")}
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                  {data.items.map((item: StoryItem, i: number) => (
                    <StoryCard key={i} item={item} name={name} index={i} />
                  ))}
                </div>
              </div>
            )}

            {mode === "highlights" && Array.isArray(data.albums) && (
              <div>
                <span className="label" style={{ display: "block", marginBottom: 14 }}>
                  {data.albums.length} {t("highlights")}
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                  {data.albums.map((a: HighlightAlbum) => (
                    <div key={a.id} className="card" style={{ padding: 14 }}>
                      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "1/1", background: "var(--surface-2)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={dl(a.cover, "cover")} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                      <b style={{ display: "block", marginTop: 10, fontSize: 15 }}>{a.title}</b>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                        <a className="btn btn-secondary" href={dl(a.cover, `instagrab-${name}-${a.title}-cover.jpg`)} download style={{ fontSize: 13 }}>
                          <ImageDown size={14} strokeWidth={1.5} /> {t("cover")}
                        </a>
                        <button className="btn btn-secondary" style={{ fontSize: 13, cursor: "pointer" }} onClick={() => loadHighlight(a.id)}>
                          {items[a.id] ? `${items[a.id].length} ✓` : t("loadStories")}
                        </button>
                      </div>
                      {items[a.id] && items[a.id].length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                          {items[a.id].map((it, j) => (
                            <a key={j} className="chip" href={dl(it.qualities?.[0]?.url ?? it.url, `instagrab-${name}-${a.title}-${j + 1}.${it.type === "video" ? "mp4" : "jpg"}`)} download>
                              <Download size={12} strokeWidth={1.5} /> {it.type === "video" ? "video" : "photo"} {j + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Ad slot — only after success, never inside the card */}
          <div style={{ maxWidth: 920, margin: "0 auto", width: "100%" }}><AdFrame slotH={280} /></div>
        </div>
      )}

      <style jsx>{`
        .ubar{ display:flex; align-items:center; gap:8px; height:64px; padding:8px 8px 8px 20px; }
        .ubar-icon{ color:var(--ink-3); display:inline-flex; flex-shrink:0; }
        .ubar-input{ flex:1; min-width:0; background:none; border:none; font-size:15px; color:var(--ink); }
        .ubar-input::placeholder{ color:var(--ink-3); }
        .ubar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .ubar.loading:focus-within{ box-shadow:none; }
        .feed-cell{ transition:transform 200ms var(--ease-silk), box-shadow 200ms var(--ease-silk); }
        .feed-cell:hover{ transform:translateY(-3px); box-shadow:var(--shadow-1); }
        @media (max-width:639px){
          .ubar{ flex-wrap:wrap; height:auto; border-radius:24px; padding:12px; }
          .ubar-input{ flex:1 1 60%; height:44px; }
          .ubar-go{ width:100%; }
        }
      `}</style>
    </div>
  );
}
