"use client";
import { useState } from "react";
import { AtSign, Search, CheckCircle2, XCircle, AlertTriangle, BadgeCheck, Sparkles } from "lucide-react";
import { dl } from "@/lib/media";
import { useI18n } from "@/lib/i18n";

const VALID_RE = /^[a-z0-9._]{1,30}$/;

type Verdict =
  | { state: "available"; name: string }
  | { state: "taken"; name: string; fullName?: string; pic?: string; verified?: boolean }
  | { state: "invalid"; name: string; reason: string };

function validate(name: string): string | null {
  if (name.length < 1) return "Enter a username to check.";
  if (name.length > 30) return "Instagram usernames max out at 30 characters.";
  if (!VALID_RE.test(name)) return "Only lowercase letters, numbers, dots and underscores are allowed.";
  if (name.startsWith(".") || name.endsWith(".")) return "Usernames can't start or end with a dot.";
  if (name.includes("..")) return "Usernames can't contain two dots in a row.";
  return null;
}

function suggest(name: string): string[] {
  const base = name.replace(/\.+$/, "");
  const year = new Date().getFullYear().toString().slice(-2);
  const raw = [
    `${base}.official`, `the.${base}`, `${base}_in`, `its.${base}`,
    `${base}.co`, `real.${base}`, `${base}${year}`, `${base}.x`,
  ];
  return [...new Set(raw)].filter((s) => s !== name && !validate(s)).slice(0, 8);
}

export default function UsernameChecker() {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [invalid, setInvalid] = useState(false);

  async function check(input?: string) {
    if (loading) return;
    const name = (input ?? value).trim().replace(/^@/, "").toLowerCase();
    if (input) setValue(input);
    if (!name) { setInvalid(true); setTimeout(() => setInvalid(false), 300); return; }
    const problem = validate(name);
    if (problem) { setVerdict({ state: "invalid", name, reason: problem }); setError(null); return; }

    setLoading(true); setError(null); setVerdict(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dp", username: name }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.username) {
        setVerdict({ state: "taken", name, fullName: json.fullName, pic: json.profilePicHd, verified: json.isVerified });
      } else if (res.status === 404 && json?.code === "NOT_FOUND") {
        setVerdict({ state: "available", name });
      } else {
        setError(json?.error ?? "Couldn't check right now — please try again in a moment.");
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
      <div className={`bar ucbar ${loading ? "loading" : ""} ${invalid ? "shake" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, height: 64, padding: "8px 8px 8px 20px" }}>
        <span style={{ color: "var(--ink-3)", display: "inline-flex", flexShrink: 0 }}><AtSign size={20} strokeWidth={1.5} /></span>
        <input
          value={value} disabled={loading}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="Type a username to check availability"
          aria-label="Username to check"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", fontSize: 15, color: "var(--ink)" }}
        />
        <button className="btn btn-molten" onClick={() => check()} disabled={loading} style={{ height: 48 }}>
          <Search size={18} strokeWidth={1.5} /> <span>{loading ? t("fetching") : "Check"}</span>
        </button>
      </div>

      {error && (
        <div className="card intro-rise" role="alert" style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 20, margin: "24px auto 0", textAlign: "left", borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
          <span className="medallion" style={{ flexShrink: 0, color: "var(--err)" }}><AlertTriangle size={24} strokeWidth={1.5} /></span>
          <span style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{error}</span>
        </div>
      )}

      {verdict && (
        <div className="card intro-rise" style={{ padding: 24, margin: "24px auto 0", textAlign: "left" }}>
          {verdict.state === "available" && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span className="medallion" style={{ color: "var(--ok)", flexShrink: 0 }}><CheckCircle2 size={24} strokeWidth={1.5} /></span>
              <div>
                <b style={{ fontSize: 17 }}>@{verdict.name} looks available! 🎉</b>
                <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)", marginTop: 6 }}>
                  No public profile answers to this handle right now. Grab it in the Instagram app before someone else does —
                  handles from deactivated accounts can stay reserved for a while, so the app has the final word.
                </p>
              </div>
            </div>
          )}

          {verdict.state === "taken" && (
            <div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
                <span className="medallion" style={{ color: "var(--err)", flexShrink: 0 }}><XCircle size={24} strokeWidth={1.5} /></span>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  {verdict.pic && (
                    <span style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--gold-300)", flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={dl(verdict.pic, "avatar")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </span>
                  )}
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      @{verdict.name} is taken
                      {verdict.verified && <BadgeCheck size={16} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} />}
                    </b>
                    {verdict.fullName && <span className="mono" style={{ display: "block", fontSize: 12, color: "var(--ink-3)" }}>{verdict.fullName}</span>}
                  </span>
                </div>
              </div>
              <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Sparkles size={14} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} /> Try one of these — tap to check
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {suggest(verdict.name).map((s) => (
                  <button key={s} className="chip" onClick={() => check(s)} disabled={loading} style={{ cursor: "pointer" }}>@{s}</button>
                ))}
              </div>
            </div>
          )}

          {verdict.state === "invalid" && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span className="medallion" style={{ color: "var(--warn)", flexShrink: 0 }}><AlertTriangle size={24} strokeWidth={1.5} /></span>
              <div>
                <b>@{verdict.name} isn&apos;t a valid Instagram username</b>
                <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)", marginTop: 6 }}>{verdict.reason}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .ucbar:focus-within{ border-color:var(--gold-400); box-shadow:var(--focus-ring); }
        .ucbar.loading:focus-within{ box-shadow:none; }
        @media (max-width:639px){
          .ucbar{ flex-wrap:wrap; height:auto !important; border-radius:24px; padding:12px !important; }
        }
      `}</style>
    </div>
  );
}
