"use client";
import { useEffect, useState } from "react";
import { AtSign, Plus, X, Eye, Download, RefreshCw, CircleDashed } from "lucide-react";
import { dl } from "@/lib/media";

type StoryItem = { type: "video" | "image"; url: string; thumbnail: string; qualities?: { label: string; url: string }[] };
type UserStories = { username: string; state: "loading" | "ok" | "none" | "error"; items: StoryItem[] };

const KEY = "ig.storyWatchlist";

function loadList(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const l = raw ? JSON.parse(raw) : [];
    return Array.isArray(l) ? l.filter((x) => typeof x === "string") : [];
  } catch { return []; }
}
function saveList(l: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {}
}

export default function StoryFeed() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [feed, setFeed] = useState<UserStories[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => { setWatchlist(loadList()); }, []);

  function add() {
    const name = input.trim().replace(/^@/, "").toLowerCase();
    if (!name || watchlist.includes(name) || watchlist.length >= 10) return;
    const next = [...watchlist, name];
    setWatchlist(next); saveList(next); setInput("");
  }
  function remove(name: string) {
    const next = watchlist.filter((n) => n !== name);
    setWatchlist(next); saveList(next);
    setFeed((f) => f.filter((u) => u.username !== name));
  }

  async function loadAll() {
    if (running || !watchlist.length) return;
    setRunning(true);
    setFeed(watchlist.map((u) => ({ username: u, state: "loading", items: [] })));
    // Sequential, not parallel — kinder to the rate limit.
    for (const username of watchlist) {
      try {
        const res = await fetch("/api/profile", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "stories", username }),
        });
        const json = await res.json().catch(() => null);
        setFeed((f) => f.map((u) => u.username === username
          ? res.ok && Array.isArray(json?.items) && json.items.length
            ? { ...u, state: "ok", items: json.items }
            : { ...u, state: res.status === 404 ? "none" : "error", items: [] }
          : u));
      } catch {
        setFeed((f) => f.map((u) => (u.username === username ? { ...u, state: "error", items: [] } : u)));
      }
    }
    setRunning(false);
  }

  return (
    <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <span className="label" style={{ display: "block", marginBottom: 10 }}>Your watchlist (max 10 accounts, saved on this device)</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 220px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "0 12px" }}>
            <AtSign size={15} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="add a username" aria-label="Add username to watchlist"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 14, color: "var(--ink)", padding: "11px 0" }} />
          </div>
          <button className="btn btn-secondary gold" onClick={add} disabled={watchlist.length >= 10}>
            <Plus size={15} strokeWidth={1.75} /> Add
          </button>
          <button className="btn btn-molten" onClick={loadAll} disabled={running || !watchlist.length}>
            {running ? <RefreshCw size={16} strokeWidth={1.5} className="coin-in" /> : <Eye size={16} strokeWidth={1.5} />}
            {running ? "Loading…" : "Watch all stories"}
          </button>
        </div>
        {watchlist.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {watchlist.map((name) => (
              <span key={name} className="chip">
                @{name}
                <button onClick={() => remove(name)} aria-label={`Remove @${name}`}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex", color: "var(--ink-3)" }}>
                  <X size={12} strokeWidth={1.75} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {feed.map((u) => (
        <div key={u.username} className="card intro-rise" style={{ padding: 18 }}>
          <span className="label" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: u.state === "ok" ? 14 : 0, color: u.state === "ok" ? "var(--gold-ink)" : undefined }}>
            <CircleDashed size={13} strokeWidth={1.5} /> @{u.username}
            {u.state === "loading" && <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>· loading…</span>}
            {u.state === "none" && <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>· no active stories right now</span>}
            {u.state === "error" && <span className="mono" style={{ fontSize: 11, color: "var(--warn)" }}>· couldn&apos;t load (private or rate-limited)</span>}
            {u.state === "ok" && <span className="mono" style={{ fontSize: 11 }}>· {u.items.length} stories</span>}
          </span>
          {u.state === "ok" && (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, WebkitMaskImage: "linear-gradient(90deg,#000 94%,transparent)" }}>
              {u.items.map((item, i) => (
                <div key={i} style={{ flexShrink: 0, width: 150 }}>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "9/16", background: "var(--surface-2)" }}>
                    {item.type === "video"
                      ? <video src={dl(item.url, "preview")} poster={item.thumbnail ? dl(item.thumbnail, "thumb") : undefined} controls playsInline preload="none" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      : /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={dl(item.url, "photo")} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                  </div>
                  <a href={dl(item.qualities?.[0]?.url ?? item.url, `instagrab-${u.username}-story-${i + 1}.${item.type === "video" ? "mp4" : "jpg"}`)} download
                    className="btn btn-secondary" style={{ fontSize: 12, marginTop: 8, width: "100%", justifyContent: "center" }}>
                    <Download size={12} strokeWidth={1.5} /> Save
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Anonymous — story views never register. The watchlist lives only in this browser.
        Public accounts only; loading is sequential to stay gentle on rate limits.
      </p>
    </div>
  );
}
