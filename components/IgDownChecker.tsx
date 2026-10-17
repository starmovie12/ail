"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff, CheckCircle2, ServerCrash } from "lucide-react";

type Status = { up: boolean; latencyMs: number | null; checkedAt: string } | null;

export default function IgDownChecker() {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const check = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res = await fetch("/api/ig-status", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (res.ok && json && typeof json.up === "boolean") setStatus(json);
      else setError(true);
    } catch {
      setError(true);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { check(); }, [check]);

  const offline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
      <div className="card intro-rise" style={{ padding: 32, textAlign: "center" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span className="medallion" style={{ animation: "spin 1.2s linear infinite" }}>
              <RefreshCw size={24} strokeWidth={1.5} />
            </span>
            <span className="label">Pinging Instagram’s servers…</span>
          </div>
        ) : error || offline ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span className="medallion" style={{ color: "var(--warn)" }}><WifiOff size={26} strokeWidth={1.5} /></span>
            <b style={{ fontSize: 20 }}>We couldn&apos;t run the check</b>
            <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)", maxWidth: "42ch" }}>
              {offline
                ? "You look offline — so if Instagram isn't loading, it's probably your connection, not Instagram."
                : "The status probe didn't respond. Give it another try in a moment."}
            </p>
          </div>
        ) : status?.up ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span className="medallion" style={{ color: "var(--ok)" }}><CheckCircle2 size={26} strokeWidth={1.5} /></span>
            <b style={{ fontSize: 22 }}>Instagram is <span style={{ color: "var(--ok)" }}>UP</span> ✅</b>
            <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)", maxWidth: "46ch" }}>
              Instagram&apos;s servers answered in <b className="mono">{status.latencyMs} ms</b>.
              If the app isn&apos;t working for you, it&apos;s likely your connection, an app-level glitch
              (force-close and reopen), or a partial outage in your region.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span className="medallion" style={{ color: "var(--err)" }}><ServerCrash size={26} strokeWidth={1.5} /></span>
            <b style={{ fontSize: 22 }}>Instagram looks <span style={{ color: "var(--err)" }}>DOWN</span> 🚨</b>
            <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)", maxWidth: "46ch" }}>
              Instagram&apos;s servers didn&apos;t respond to our probe — it&apos;s not just you.
              Outages usually resolve within an hour; there&apos;s nothing to fix on your side.
            </p>
          </div>
        )}

        <div style={{ marginTop: 22, display: "flex", justifyContent: "center", gap: 10 }}>
          <button className="btn btn-secondary gold" onClick={check} disabled={loading}>
            <RefreshCw size={15} strokeWidth={1.5} /> Check again
          </button>
        </div>
        {status && !loading && (
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 14 }}>
            <Wifi size={11} strokeWidth={1.5} style={{ verticalAlign: "-1px" }} /> Last checked {new Date(status.checkedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
      <style jsx>{`
        @keyframes spin{ to{ transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
