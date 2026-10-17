"use client";
import { useState } from "react";
import { Link2, Gift, Trophy, AlertTriangle, RotateCw } from "lucide-react";
import Link from "next/link";
import type { ExtractResult, PostComment } from "@/lib/extract-ui";

function cryptoPick<T>(arr: T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (pool.length && out.length < n) {
    const r = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    out.push(pool.splice(Math.floor(r * pool.length), 1)[0]);
  }
  return out;
}

export default function GiveawayPicker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [invalid, setInvalid] = useState(false);
  // Filters (D1) + multi-winner (D4)
  const [minMentions, setMinMentions] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [backupCount, setBackupCount] = useState(1);
  const [winners, setWinners] = useState<PostComment[] | null>(null);
  const [backups, setBackups] = useState<PostComment[]>([]);

  async function go() {
    if (loading) return;
    if (!/instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\//i.test(url.trim())) {
      setInvalid(true); setTimeout(() => setInvalid(false), 300);
      return;
    }
    setLoading(true); setError(null); setResult(null); setWinners(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.error) setError(json?.error?.message ?? "Something went wrong — try again.");
      else {
        const data = json.data as ExtractResult;
        if (!data.comments?.length) setError("No comments came back for this post — a giveaway needs comments to pick from.");
        else setResult(data);
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally { setLoading(false); }
  }

  function eligible(): PostComment[] {
    const all = result?.comments ?? [];
    const seen = new Set<string>();
    return all.filter((c) => {
      if (seen.has(c.username)) return false; // one entry per person
      if (minMentions > 0 && (c.text.match(/@[\w.]+/g) ?? []).length < minMentions) return false;
      if (keyword.trim() && !c.text.toLowerCase().includes(keyword.trim().toLowerCase())) return false;
      seen.add(c.username);
      return true;
    });
  }

  function draw() {
    const pool = eligible();
    if (!pool.length) { setError("No comments pass the filters — loosen them and try again."); return; }
    setError(null);
    const picked = cryptoPick(pool, winnerCount + backupCount);
    setWinners(picked.slice(0, winnerCount));
    setBackups(picked.slice(winnerCount));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--ink)",
  };
  const pool = result ? eligible() : [];

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={`bar gwbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><Link2 size={20} strokeWidth={1.5} /></span>
        <input
          value={url} disabled={loading}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Paste your giveaway post's link"
          aria-label="Giveaway post link"
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={go} disabled={loading} style={{ height: 48 }}>
          <Gift size={18} strokeWidth={1.5} />
          <span>{loading ? "Loading…" : "Load entries"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span style={{ color: "var(--err)", flexShrink: 0 }}><AlertTriangle size={20} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {result && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <span className="label" style={{ color: "var(--gold-ink)", display: "block", marginBottom: 14 }}>
            {result.comments?.length ?? 0} recent comments loaded · {pool.length} eligible after filters
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            <div>
              <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>Min @mentions required</span>
              <select value={minMentions} onChange={(e) => setMinMentions(Number(e.target.value))} aria-label="Minimum mentions" style={{ ...inputStyle, appearance: "auto" }}>
                {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n === 0 ? "No requirement" : `Tag ${n}+ friends`}</option>)}
              </select>
            </div>
            <div>
              <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>Must contain (optional)</span>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. done" aria-label="Required keyword" style={inputStyle} />
            </div>
            <div>
              <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>Winners</span>
              <select value={winnerCount} onChange={(e) => setWinnerCount(Number(e.target.value))} aria-label="Number of winners" style={{ ...inputStyle, appearance: "auto" }}>
                {[1, 2, 3, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>Backup winners</span>
              <select value={backupCount} onChange={(e) => setBackupCount(Number(e.target.value))} aria-label="Number of backups" style={{ ...inputStyle, appearance: "auto" }}>
                {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-molten" onClick={draw} style={{ height: 50, justifyContent: "center", width: "100%", marginTop: 16 }}>
            <RotateCw size={18} strokeWidth={1.5} /> Draw {winnerCount > 1 ? `${winnerCount} winners` : "the winner"}
          </button>
        </div>
      )}

      {winners && (
        <div className="card intro-rise" style={{ padding: 24, borderColor: "var(--gold-300)" }}>
          <span className="label" style={{ color: "var(--gold-ink)", display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <Trophy size={14} strokeWidth={1.5} /> {winners.length > 1 ? "Winners" : "Winner"} 🎉
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {winners.map((w, i) => (
              <div key={i} className="well" style={{ padding: 16, borderColor: "var(--gold-300)" }}>
                <b style={{ color: "var(--gold-ink)" }}>@{w.username}</b>
                <span style={{ display: "block", fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>{w.text}</span>
              </div>
            ))}
          </div>
          {backups.length > 0 && (
            <>
              <span className="label" style={{ display: "block", margin: "16px 0 8px" }}>Backups (if a winner doesn&apos;t claim)</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {backups.map((b, i) => <span key={i} className="chip">@{b.username}</span>)}
              </div>
            </>
          )}
          <div style={{ marginTop: 18 }}>
            <Link href={`/winner-certificate?winner=${encodeURIComponent(winners[0]?.username ?? "")}`} className="btn btn-secondary gold" style={{ fontSize: 13, textDecoration: "none" }}>
              <Trophy size={14} strokeWidth={1.5} /> Make a winner certificate
            </Link>
          </div>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 14, lineHeight: 1.6 }}>
            Draw uses your browser&apos;s cryptographic randomness — every eligible entry has an equal chance.
            Pool = the most recent ~40-50 public comments Instagram exposes without login (screen-record for transparency).
          </p>
        </div>
      )}

      <style jsx>{`
        .gwbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .gwbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .gwbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
