"use client";
import { useEffect, useState } from "react";
import { AtSign, Plus, X, Ghost, RefreshCw, Zap, Clock } from "lucide-react";
import { dl } from "@/lib/media";

const KEY = "ig.storyWatchlist"; // shared with Story Watch Mode
type Row = {
  username: string;
  state: "loading" | "ok" | "error";
  lastPost?: number;        // takenAt of newest post (unix seconds)
  daysAgo?: number;
  pic?: string;
};

function loadList(): string[] {
  try { const l = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(l) ? l.filter((x) => typeof x === "string") : []; } catch { return []; }
}
function saveList(l: string[]) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} }

function ghostLabel(days: number): { text: string; color: string; icon: "zap" | "clock" | "ghost" } {
  if (days <= 2) return { text: "Active 🔥", color: "var(--gold-ink)", icon: "zap" };
  if (days <= 7) return { text: "Slowing down", color: "var(--ink-2)", icon: "clock" };
  if (days <= 21) return { text: "Going quiet 👀", color: "var(--warn)", icon: "clock" };
  return { text: "Ghosting 👻", color: "var(--err)", icon: "ghost" };
}

export default function GhostFeed() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => { setWatchlist(loadList()); }, []);

  function add() {
    const name = input.trim().replace(/^@/, "").toLowerCase();
    if (!name || watchlist.includes(name) || watchlist.length >= 15) return;
    const next = [...watchlist, name]; setWatchlist(next); saveList(next); setInput("");
  }
  function remove(name: string) {
    const next = watchlist.filter((n) => n !== name); setWatchlist(next); saveList(next);
    setRows((r) => r.filter((x) => x.username !== name));
  }

  async function scan() {
    if (running || !watchlist.length) return;
    setRunning(true);
    setRows(watchlist.map((u) => ({ username: u, state: "loading" })));
    for (const username of watchlist) {
      try {
        const res = await fetch("/api/profile", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "feed", username }),
        });
        const j = await res.json().catch(() => null);
        const posts = j?.postsList ?? [];
        const newest = posts.filter((p: { isPinned?: boolean }) => !p.isPinned)
          .reduce((m: number, p: { takenAt: number }) => Math.max(m, p.takenAt || 0), 0)
          || posts.reduce((m: number, p: { takenAt: number }) => Math.max(m, p.takenAt || 0), 0);
        setRows((r) => r.map((x) => x.username === username
          ? (res.ok && newest)
            ? { ...x, state: "ok", lastPost: newest, daysAgo: Math.floor((Date.now() / 1000 - newest) / 86400), pic: j.profilePicHd }
            : { ...x, state: "error" }
          : x));
      } catch {
        setRows((r) => r.map((x) => (x.username === username ? { ...x, state: "error" } : x)));
      }
    }
    setRunning(false);
  }

  const ranked = [...rows].sort((a, b) => (b.daysAgo ?? -1) - (a.daysAgo ?? -1));

  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <span className="label" style={{ display: "block", marginBottom: 10 }}>Your watchlist (max 15 · shared with Story Watch Mode)</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 220px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "0 12px" }}>
            <AtSign size={15} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="add a username" aria-label="Add username" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 14, color: "var(--ink)", padding: "11px 0" }} />
          </div>
          <button className="btn btn-secondary gold" onClick={add} disabled={watchlist.length >= 15}><Plus size={15} strokeWidth={1.75} /> Add</button>
          <button className="btn btn-molten" onClick={scan} disabled={running || !watchlist.length}>
            {running ? <RefreshCw size={16} strokeWidth={1.5} className="coin-in" /> : <Ghost size={16} strokeWidth={1.5} />}
            {running ? "Scanning…" : "Scan for ghosts"}
          </button>
        </div>
        {watchlist.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {watchlist.map((name) => (
              <span key={name} className="chip">@{name}
                <button onClick={() => remove(name)} aria-label={`Remove @${name}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex", color: "var(--ink-3)" }}>
                  <X size={12} strokeWidth={1.75} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {ranked.map((r) => {
        const lab = r.daysAgo != null ? ghostLabel(r.daysAgo) : null;
        return (
          <div key={r.username} className="card intro-rise" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface-2)", flexShrink: 0 }}>
              {r.pic && /* eslint-disable-next-line @next/next/no-img-element */
                <img src={dl(r.pic, "avatar")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 15 }}>@{r.username}</b>
              <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                {r.state === "loading" && "checking…"}
                {r.state === "error" && "couldn't load (private or rate-limited)"}
                {r.state === "ok" && (r.daysAgo === 0 ? "posted today" : `last post ${r.daysAgo} ${r.daysAgo === 1 ? "day" : "days"} ago`)}
              </div>
            </div>
            {lab && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: lab.color, flexShrink: 0 }}>
                {lab.icon === "zap" ? <Zap size={14} strokeWidth={2} /> : lab.icon === "ghost" ? <Ghost size={14} strokeWidth={2} /> : <Clock size={14} strokeWidth={2} />}
                {lab.text}
              </span>
            )}
          </div>
        );
      })}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Ranks your accounts by how long since their last public post — the ghosts float to the top. Public accounts only; scanning is sequential to stay gentle on limits.
      </p>
    </div>
  );
}
