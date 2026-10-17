"use client";
import { useEffect, useState } from "react";
import { Lock, AlertTriangle, Wrench, Timer, CircleDashed, WifiOff, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export type ErrorCode = "PRIVATE" | "INVALID_URL" | "EXTRACTOR_DOWN" | "RATE_LIMITED" | "STORY_EXPIRED" | "OFFLINE" | "NOT_FOUND";

const META = {
  PRIVATE: { Icon: Lock, t: "errPrivateT", b: "errPrivateB" },
  INVALID_URL: { Icon: AlertTriangle, t: "errInvalidT", b: "errInvalidB" },
  EXTRACTOR_DOWN: { Icon: Wrench, t: "errDownT", b: "errDownB" },
  RATE_LIMITED: { Icon: Timer, t: "errRateT", b: "errRateB" },
  STORY_EXPIRED: { Icon: CircleDashed, t: "errStoryT", b: "errStoryB" },
  NOT_FOUND: { Icon: CircleDashed, t: "errNotFoundT", b: "errNotFoundB" },
  OFFLINE: { Icon: WifiOff, t: "errOfflineT", b: "errOfflineB" },
} as const;

/** H10 — transient errors get a friendly countdown-retry instead of a dead end. */
const RETRY_AFTER: Partial<Record<ErrorCode, number>> = {
  EXTRACTOR_DOWN: 15,
  RATE_LIMITED: 30,
  OFFLINE: 5,
};

/** Quiet error card (§9.9) — never a red banner, never an alert(). */
export default function ErrorCard({ code, onRetry }: { code: ErrorCode; onRetry?: () => void }) {
  const { t } = useI18n();
  const e = META[code] ?? META.EXTRACTOR_DOWN;
  const wait = onRetry ? RETRY_AFTER[code] : undefined;
  const [left, setLeft] = useState(wait ?? 0);

  useEffect(() => {
    if (!wait) return;
    setLeft(wait);
    const id = setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [wait, code]);

  return (
    <div className="card intro-rise" role="alert" style={{
      display: "flex", gap: 16, alignItems: "flex-start", padding: 20, maxWidth: 720, margin: "0 auto",
      borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5,
    }}>
      <span className="medallion" style={{ flexShrink: 0, color: "var(--err)" }}>
        <e.Icon size={24} strokeWidth={1.5} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: "block", marginBottom: 2 }}>{t(e.t)}</strong>
        <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{t(e.b)}</span>
        {wait !== undefined && (
          <span style={{ display: "block", marginTop: 12 }}>
            <button className={`btn ${left === 0 ? "btn-molten" : "btn-secondary"}`} onClick={onRetry}
              disabled={left > 0} style={{ fontSize: 13 }}>
              <RefreshCw size={14} strokeWidth={1.5} />
              {left > 0 ? `Retry in ${left}s…` : "Retry now"}
            </button>
          </span>
        )}
      </span>
    </div>
  );
}
