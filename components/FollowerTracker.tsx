"use client";
import { useEffect, useState } from "react";
import { AtSign, TrendingUp, TrendingDown, Plus, Trash2, AlertTriangle } from "lucide-react";
import { fmt } from "@/lib/media";

type Point = { date: string; followers: number }; // date = YYYY-MM-DD
type Log = Record<string, Point[]>; // username → points

const KEY = "ig.followerLog";

function load(): Log {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function save(log: Log) {
  try { localStorage.setItem(KEY, JSON.stringify(log)); } catch {}
}
function today(): string { return new Date().toISOString().slice(0, 10); }

/** Minimal SVG line chart — no chart library needed. */
function Chart({ points }: { points: Point[] }) {
  const W = 640, H = 200, PAD = 10;
  const vals = points.map((p) => p.followers);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(1, max - min);
  const x = (i: number) => PAD + (i / Math.max(1, points.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.followers).toFixed(1)}`).join(" ");
  const area = `${path} L${x(points.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Follower growth chart">
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22E4FF" stopOpacity=".35" />
          <stop offset="100%" stopColor="#22E4FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#tg)" />
      <path d={path} fill="none" stroke="#22E4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={p.date} cx={x(i)} cy={y(p.followers)} r="3.5" fill="var(--surface, #fff)" stroke="#6366F1" strokeWidth="2" />
      ))}
    </svg>
  );
}

const MILESTONES = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

export default function FollowerTracker() {
  const [username, setUsername] = useState("");
  const [log, setLog] = useState<Log>({});
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    const l = load();
    setLog(l);
    const names = Object.keys(l);
    if (names.length) setActive(names[0]);
  }, []);

  function persist(next: Log) { setLog(next); save(next); }

  function addPoint(name: string, followers: number) {
    const clean = name.replace(/^@/, "").toLowerCase();
    const next = { ...log };
    const points = (next[clean] ?? []).filter((p) => p.date !== today());
    points.push({ date: today(), followers });
    points.sort((a, b) => a.date.localeCompare(b.date));
    next[clean] = points.slice(-90); // keep ~3 months
    persist(next);
    setActive(clean);
  }

  async function logToday() {
    const name = (active ?? username).trim();
    if (!name) { setError("Enter a username first."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dp", username: name }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || typeof json?.followers !== "number") {
        setError(json?.error ?? "Couldn't fetch that profile — you can log the count manually below.");
      } else {
        addPoint(json.username ?? name, json.followers);
        setUsername("");
      }
    } catch {
      setError("Network error — you can log the count manually below.");
    } finally { setLoading(false); }
  }

  function logManual() {
    const name = (active ?? username).trim();
    const n = parseInt(manual.replace(/[,\s]/g, ""), 10);
    if (!name || !isFinite(n) || n < 0) { setError("Enter a username and a valid follower count."); return; }
    setError(null);
    addPoint(name, n);
    setManual("");
  }

  function remove(name: string) {
    const next = { ...log };
    delete next[name];
    persist(next);
    setActive(Object.keys(next)[0] ?? null);
  }

  const points = active ? log[active] ?? [] : [];
  const first = points[0], last = points[points.length - 1];
  const delta = first && last ? last.followers - first.followers : 0;
  const nextMilestone = last ? MILESTONES.find((m) => m > last.followers) : null;

  const inputStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <AtSign size={16} strokeWidth={1.5} style={{ color: "var(--ink-3)" }} />
          <input value={active ?? username}
            onChange={(e) => { setActive(null); setUsername(e.target.value); }}
            placeholder="username to track" aria-label="Username to track"
            autoCapitalize="none" autoCorrect="off" spellCheck={false} style={inputStyle} />
          <button className="btn btn-molten" onClick={logToday} disabled={loading} style={{ height: 44 }}>
            <Plus size={16} strokeWidth={1.75} /> {loading ? "Fetching…" : "Log today's count"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input value={manual} onChange={(e) => setManual(e.target.value)}
            placeholder="…or type the count manually (e.g. 12450)" aria-label="Manual follower count"
            inputMode="numeric" style={inputStyle} />
          <button className="btn btn-secondary" onClick={logManual} style={{ height: 44 }}>Log manually</button>
        </div>
        {Object.keys(log).length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(log).map((name) => (
              <button key={name} className="chip" onClick={() => setActive(name)}
                style={{ cursor: "pointer", borderColor: active === name ? "var(--gold-400)" : undefined, color: active === name ? "var(--gold-ink)" : undefined }}>
                @{name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="card" role="alert" style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 16, borderColor: "color-mix(in srgb, var(--warn) 45%, var(--line))", borderWidth: 1.5 }}>
          <AlertTriangle size={18} strokeWidth={1.5} style={{ color: "var(--warn)", flexShrink: 0 }} />
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {active && points.length > 0 && (
        <div className="card intro-rise" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
            <b>@{active}</b>
            <button className="btn btn-ghost" onClick={() => remove(active)} aria-label={`Stop tracking @${active}`} style={{ fontSize: 12, minHeight: 32, color: "var(--err)" }}>
              <Trash2 size={13} strokeWidth={1.5} /> Remove
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, margin: "12px 0 20px" }}>
            <div className="well" style={{ padding: 14, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{fmt(last.followers)}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>Now</div>
            </div>
            <div className="well" style={{ padding: 14, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: delta >= 0 ? "var(--ok)" : "var(--err)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                {delta >= 0 ? <TrendingUp size={18} strokeWidth={1.75} /> : <TrendingDown size={18} strokeWidth={1.75} />}
                {delta >= 0 ? "+" : ""}{fmt(Math.abs(delta))}
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>Since {first.date}</div>
            </div>
            {nextMilestone && (
              <div className="well" style={{ padding: 14, textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--gold-ink)" }}>{fmt(nextMilestone - last.followers)}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>To {fmt(nextMilestone)} 🏆</div>
              </div>
            )}
          </div>

          {points.length >= 2 ? (
            <Chart points={points} />
          ) : (
            <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center", padding: "24px 0" }}>
              Come back tomorrow and log again — the growth chart appears from day 2. 📈
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{first.date}</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{last.date}</span>
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        History lives only in this browser (localStorage) — nothing is uploaded. One data point per day per account;
        visit daily to build your chart. Track competitors too. 😉
      </p>
    </div>
  );
}
