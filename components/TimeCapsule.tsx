"use client";
import { useEffect, useState } from "react";
import { AtSign, Lock, Unlock, Hourglass, Trash2, AlertTriangle, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { fmt } from "@/lib/media";

type Snap = { followers: number; following: number; posts: number; avgLikes: number };
type Capsule = { id: string; username: string; createdAt: number; unlockAt: number; snapshot: Snap };
type Opened = { id: string; before: Snap; after: Snap };

const KEY = "ig.timeCapsules";
const LOCK_DAYS = 30;

function load(): Capsule[] {
  try { const l = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(l) ? l : []; } catch { return []; }
}
function save(l: Capsule[]) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} }

async function fetchSnap(username: string): Promise<Snap> {
  const res = await fetch("/api/profile", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "feed", username }),
  });
  const j = await res.json().catch(() => null);
  if (!res.ok || !j?.username) throw new Error(j?.error || "Couldn't reach that profile.");
  const posts = j.postsList ?? [];
  const avgLikes = posts.length ? Math.round(posts.reduce((a: number, p: { likes: number }) => a + p.likes, 0) / posts.length) : 0;
  return { followers: j.followers, following: j.following, posts: j.posts, avgLikes };
}

function fmtDate(ts: number) { return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }

function Delta({ before, after }: { before: Snap; after: Snap }) {
  const rows: [string, number, number][] = [
    ["Followers", before.followers, after.followers],
    ["Posts", before.posts, after.posts],
    ["Avg likes", before.avgLikes, after.avgLikes],
    ["Following", before.following, after.following],
  ];
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
      {rows.map(([label, b, a]) => {
        const d = a - b; const up = d >= 0;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--ink-3)" }}>{label}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span className="mono" style={{ color: "var(--ink-3)" }}>{fmt(b)} → <b style={{ color: "var(--ink)" }}>{fmt(a)}</b></span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 700, color: d === 0 ? "var(--ink-3)" : up ? "var(--gold-ink)" : "var(--err)" }}>
                {d !== 0 && (up ? <TrendingUp size={13} strokeWidth={2} /> : <TrendingDown size={13} strokeWidth={2} />)}
                {up ? "+" : ""}{fmt(d)}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function TimeCapsule() {
  const [username, setUsername] = useState("");
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState<Opened | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => { setCapsules(load()); }, []);

  async function bury() {
    const name = username.trim().replace(/^@/, "").toLowerCase();
    if (!name || busy) return;
    setBusy(true); setError(null);
    try {
      const snapshot = await fetchSnap(name);
      const now = Date.now();
      const cap: Capsule = { id: `${name}-${now}`, username: name, createdAt: now, unlockAt: now + LOCK_DAYS * 86_400_000, snapshot };
      const next = [cap, ...capsules.filter((c) => c.username !== name)];
      setCapsules(next); save(next); setUsername("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong — try again.");
    } finally { setBusy(false); }
  }

  async function open(cap: Capsule) {
    if (openingId) return;
    setOpeningId(cap.id); setError(null); setOpened(null);
    try {
      const after = await fetchSnap(cap.username);
      setOpened({ id: cap.id, before: cap.snapshot, after });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't open — try again.");
    } finally { setOpeningId(null); }
  }

  function remove(id: string) {
    const next = capsules.filter((c) => c.id !== id);
    setCapsules(next); save(next);
    if (opened?.id === id) setOpened(null);
  }

  const now = Date.now();

  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <span className="label" style={{ display: "block", marginBottom: 10 }}>Bury a stats capsule — open it in {LOCK_DAYS} days</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 220px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "0 12px" }}>
            <AtSign size={15} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
            <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && bury()}
              placeholder="your @username" aria-label="Username" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 14, color: "var(--ink)", padding: "12px 0" }} />
          </div>
          <button className="btn btn-molten" onClick={bury} disabled={busy}>
            {busy ? <Hourglass size={16} strokeWidth={1.5} className="coin-in" /> : <Plus size={16} strokeWidth={1.75} />}
            {busy ? "Sealing…" : "Bury capsule"}
          </button>
        </div>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <AlertTriangle size={20} strokeWidth={1.5} style={{ color: "var(--err)", flexShrink: 0 }} />
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {capsules.length === 0 && (
        <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center", padding: "8px 0" }}>
          No capsules yet. Bury one today, come back in a month, and watch how far you&apos;ve grown. ⏳
        </p>
      )}

      {capsules.map((cap) => {
        const unlocked = now >= cap.unlockAt;
        const daysLeft = Math.ceil((cap.unlockAt - now) / 86_400_000);
        const isOpen = opened?.id === cap.id;
        return (
          <div key={cap.id} className="card intro-rise" style={{ padding: 18, borderColor: unlocked ? "var(--gold-300)" : "var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="medallion" style={{ width: 38, height: 38 }}>
                  {unlocked ? <Unlock size={17} strokeWidth={1.5} /> : <Lock size={17} strokeWidth={1.5} />}
                </span>
                <div>
                  <b style={{ fontSize: 15 }}>@{cap.username}</b>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                    Sealed {fmtDate(cap.createdAt)} · {unlocked ? "ready to open" : `opens ${fmtDate(cap.unlockAt)}`}
                  </div>
                </div>
              </div>
              <button onClick={() => remove(cap.id)} aria-label="Delete capsule"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: 6 }}>
                <Trash2 size={15} strokeWidth={1.5} />
              </button>
            </div>

            {!unlocked && (
              <div style={{ marginTop: 14 }}>
                <div style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, ((LOCK_DAYS - daysLeft) / LOCK_DAYS) * 100)}%`, background: "var(--gold-300)", borderRadius: 99 }} />
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Hourglass size={13} strokeWidth={1.5} /> {daysLeft} {daysLeft === 1 ? "day" : "days"} to go — locked until then. 🔒
                </p>
              </div>
            )}

            {unlocked && !isOpen && (
              <button className="btn btn-molten" onClick={() => open(cap)} disabled={openingId === cap.id}
                style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>
                {openingId === cap.id ? <Hourglass size={16} strokeWidth={1.5} className="coin-in" /> : <Unlock size={16} strokeWidth={1.5} />}
                {openingId === cap.id ? "Opening…" : "Open capsule 🎁"}
              </button>
            )}

            {isOpen && opened && (
              <div className="intro-rise" style={{ marginTop: 6 }}>
                <span className="label" style={{ color: "var(--gold-ink)", display: "block", marginTop: 10 }}>
                  {LOCK_DAYS} days later — here&apos;s your growth
                </span>
                <Delta before={opened.before} after={opened.after} />
              </div>
            )}
          </div>
        );
      })}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Capsules are saved only in this browser — clear your data and they&apos;re gone. A snapshot of public stats, sealed for {LOCK_DAYS} days.
      </p>
    </div>
  );
}
