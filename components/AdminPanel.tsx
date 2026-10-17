"use client";
import { useEffect, useState } from "react";
import { Lock, ShieldCheck, LogOut, Save, Check, AlertTriangle, RefreshCw, Eye, EyeOff } from "lucide-react";

type Session = { enabled: boolean; authed: boolean; kvConfigured: boolean };
type ConfigData = {
  override: Record<string, string | boolean>;
  defaults: Record<string, string | boolean>;
  kvConfigured: boolean;
};

const FIELDS: { id: string; label: string; hint: string; wide?: boolean }[] = [
  { id: "docId", label: "doc_id", hint: "The main GraphQL query id — the one you keep updating. Post/reel downloads use this.", wide: true },
  { id: "lsd", label: "LSD token", hint: "X-FB-LSD anti-CSRF token. Usually stays the same.", wide: true },
  { id: "appId", label: "App ID (X-IG-App-ID)", hint: "Instagram web app id. Rarely changes.", wide: true },
  { id: "userAgent", label: "User-Agent", hint: "Browser UA string sent to Instagram.", wide: true },
  { id: "fallbackApiUrl", label: "Fallback API URL (posts)", hint: "Provider endpoint with {url} or {shortcode}. Used when Instagram blocks the server.", wide: true },
  { id: "fallbackProfileApiUrl", label: "Fallback API URL (profiles)", hint: "Provider endpoint with {username}. Powers username tools when blocked.", wide: true },
  { id: "fallbackApiKey", label: "Fallback API key", hint: "Your provider API key (shared by both fallback URLs).", wide: true },
  { id: "fallbackApiKeyHeader", label: "Fallback key header name", hint: "e.g. x-api-key or x-rapidapi-key." },
];

export default function AdminPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ConfigData | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [useFallback, setUseFallback] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadSession() {
    const res = await fetch("/api/admin/login", { cache: "no-store" });
    const s = (await res.json()) as Session;
    setSession(s);
    if (s.authed) loadConfig();
  }
  useEffect(() => { loadSession(); }, []);

  async function loadConfig() {
    const res = await fetch("/api/admin/config", { cache: "no-store" });
    if (!res.ok) return;
    const d = (await res.json()) as ConfigData;
    setData(d);
    const f: Record<string, string> = {};
    for (const field of FIELDS) f[field.id] = (d.override[field.id] as string) ?? "";
    setForm(f);
    setUseFallback(Boolean(d.override.useFallbackApi));
  }

  async function login() {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.error ?? "Login failed."); return; }
      setPassword("");
      await loadSession();
    } catch { setError("Network error — try again."); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setData(null);
    loadSession();
  }

  async function save() {
    if (busy) return;
    setBusy(true); setError(null); setSaved(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, useFallbackApi: useFallback }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.error ?? "Save failed."); return; }
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      loadConfig();
    } catch { setError("Network error — try again."); }
    finally { setBusy(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-mono)",
  };

  // ── Loading ──
  if (!session) {
    return <div className="mono" style={{ textAlign: "center", color: "var(--ink-3)", padding: 40 }}>Loading…</div>;
  }

  // ── Admin not configured on the server ──
  if (!session.enabled) {
    return (
      <div className="card" style={{ padding: 28, maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <span className="medallion" style={{ margin: "0 auto 14px", color: "var(--warn)" }}><AlertTriangle size={24} strokeWidth={1.5} /></span>
        <b style={{ fontSize: 17 }}>Admin not set up yet</b>
        <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)", marginTop: 10, lineHeight: 1.6 }}>
          Add an <code className="mono">ADMIN_PASSWORD</code> environment variable in Vercel
          (Settings → Environment Variables, min 6 characters), redeploy, then log in here.
        </p>
      </div>
    );
  }

  // ── Login form ──
  if (!session.authed) {
    return (
      <div className="card" style={{ padding: 28, maxWidth: 400, margin: "0 auto" }}>
        <span className="medallion" style={{ margin: "0 auto 14px" }}><Lock size={24} strokeWidth={1.5} /></span>
        <h1 style={{ fontSize: 20, textAlign: "center", marginBottom: 18 }}>Admin login</h1>
        <div style={{ position: "relative" }}>
          <input type={showPw ? "text" : "password"} value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Password" aria-label="Admin password" autoFocus
            style={{ ...inputStyle, fontFamily: "inherit", paddingRight: 42 }} />
          <button onClick={() => setShowPw((s) => !s)} aria-label="Toggle password"
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)" }}>
            {showPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
          </button>
        </div>
        {error && <p className="mono" style={{ color: "var(--err)", fontSize: 13, marginTop: 10 }}>{error}</p>}
        <button className="btn btn-molten" onClick={login} disabled={busy} style={{ width: "100%", height: 46, justifyContent: "center", marginTop: 16 }}>
          <ShieldCheck size={16} strokeWidth={1.5} /> {busy ? "Checking…" : "Log in"}
        </button>
      </div>
    );
  }

  // ── Authenticated: config editor ──
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <span className="label" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gold-ink)" }}>
          <ShieldCheck size={14} strokeWidth={1.5} /> Logged in · Instagram config
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={loadConfig} style={{ fontSize: 13 }}>
            <RefreshCw size={14} strokeWidth={1.5} /> Reload
          </button>
          <button className="btn btn-secondary" onClick={logout} style={{ fontSize: 13 }}>
            <LogOut size={14} strokeWidth={1.5} /> Log out
          </button>
        </span>
      </div>

      {data && !data.kvConfigured && (
        <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start", borderColor: "color-mix(in srgb, var(--warn) 45%, var(--line))", borderWidth: 1.5 }}>
          <AlertTriangle size={18} strokeWidth={1.5} style={{ color: "var(--warn)", flexShrink: 0 }} />
          <span style={{ fontSize: "var(--t-small)", color: "var(--ink-2)" }}>
            Storage not connected — add <code className="mono">UPSTASH_REDIS_REST_URL</code> and{" "}
            <code className="mono">UPSTASH_REDIS_REST_TOKEN</code> in Vercel so saves persist. Until then this editor is read-only.
          </span>
        </div>
      )}

      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {FIELDS.map((f) => (
          <div key={f.id}>
            <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>{f.label}</span>
            <input value={form[f.id] ?? ""} onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
              placeholder={(data?.defaults[f.id] as string) || "(not set)"} aria-label={f.label}
              autoCapitalize="none" autoCorrect="off" spellCheck={false} style={inputStyle} />
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginTop: 4 }}>{f.hint}</span>
          </div>
        ))}

        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--ink-2)", cursor: "pointer" }}>
          <input type="checkbox" checked={useFallback} onChange={(e) => setUseFallback(e.target.checked)}
            style={{ accentColor: "var(--gold-ink)", width: 16, height: 16 }} />
          Always use the fallback API first (skip direct Instagram)
        </label>

        {error && <p className="mono" style={{ color: "var(--err)", fontSize: 13 }}>{error}</p>}

        <button className={`btn btn-molten ${saved ? "tick" : ""}`} onClick={save}
          disabled={busy || (data ? !data.kvConfigured : true)} style={{ height: 48, justifyContent: "center" }}>
          {saved ? <Check size={16} strokeWidth={2} className="coin-in" /> : <Save size={16} strokeWidth={1.5} />}
          {saved ? "Saved — live in ~1 minute" : busy ? "Saving…" : "Save config"}
        </button>
      </div>

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Blank fields fall back to the built-in defaults (shown as placeholders). Changes apply site-wide within
        about a minute — no redeploy needed. Tip: when downloads break, usually you only need to paste a fresh <b>doc_id</b>.
      </p>
    </div>
  );
}
