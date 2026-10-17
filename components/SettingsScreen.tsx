"use client";
/** Settings screen (PRD §13) — Appearance, Download prefs, Advanced (Session ID / Cobalt), App & Storage, Important links. */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ChevronDown, ShieldAlert } from "lucide-react";
import InstallAppButton from "@/components/InstallAppButton";
import { LANGS, useI18n, type Locale } from "@/lib/i18n";
import { DEFAULT_PREFS, clearHistory, getCobaltInstance, getPrefs, getSessionId, resetAllLocalData, setAdvanced, setPrefs, type Prefs } from "@/lib/storage";
import { isSoundOn, setSoundOn } from "@/lib/retention";
import { isIosSafari } from "@/lib/feedback";
import { SPONSOR_LINK } from "@/lib/ads";
import { BRAND } from "@/lib/brand";

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className={`sw ${checked ? "is-on" : ""}`} onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="st-row">
      <div><b>{title}</b>{desc && <small>{desc}</small>}</div>
      {children}
    </div>
  );
}

const LINKS: [string, string][] = [
  ["How to Download", "/how-to-download"], ["Blog / Creator Guides", "/blog"], ["About Us", "/about"], ["Contact", "/contact"],
  ["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms"], ["DMCA", "/dmca"],
];

export default function SettingsScreen() {
  const { lang, setLang, t } = useI18n();
  const [prefs, setP] = useState<Prefs>(DEFAULT_PREFS);
  const [dark, setDark] = useState(true);
  const [sound, setSound] = useState(false);
  const [ios, setIos] = useState(false);
  const [session, setSession] = useState("");
  const [cobalt, setCobalt] = useState("");
  const [showSession, setShowSession] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const [cobaltErr, setCobaltErr] = useState("");
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState<"" | "history" | "reset">("");

  useEffect(() => {
    setP(getPrefs()); setSound(isSoundOn()); setIos(isIosSafari());
    setDark((document.documentElement.dataset.theme ?? "dark") === "dark");
    setSession(getSessionId()); setCobalt(getCobaltInstance());
  }, []);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2400); };
  const upd = (patch: Partial<Prefs>) => setP(setPrefs(patch));

  function toggleTheme(v: boolean) {
    const root = document.documentElement;
    root.classList.add("theming");
    root.dataset.theme = v ? "dark" : "light";
    try { localStorage.setItem("ig-theme", v ? "dark" : "light"); } catch { /* ignore */ }
    setDark(v);
    setTimeout(() => root.classList.remove("theming"), 350);
  }

  function saveAdvanced() {
    const c = cobalt.trim();
    if (c && !/^https:\/\/[^\s]+\.[^\s]+$/i.test(c)) { setCobaltErr("Sirf https:// URL valid hai (jaise https://cobalt.yourdomain.com)"); return; }
    setCobaltErr("");
    setAdvanced(session, c);
    flash("Saved ✓");
  }

  function two(kind: "history" | "reset", run: () => void) {
    if (confirm !== kind) { setConfirm(kind); setTimeout(() => setConfirm((c) => (c === kind ? "" : c)), 4000); return; }
    run(); setConfirm(""); flash(kind === "history" ? "History cleared" : "Local data reset");
  }

  return (
    <main className="stg">
      <div className="container" style={{ maxWidth: 1120 }}>
        <h1>Settings</h1>
        <div className="stg-cols">
          <section className="stg-card">
            <h2>Appearance &amp; Language</h2>
            <Row title="Language">
              <span className="stg-select">
                <select value={lang} onChange={(e) => setLang(e.target.value as Locale)} aria-label={t("language")}>
                  {LANGS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
              </span>
            </Row>
            <Row title="Dark Mode"><Switch checked={dark} onChange={toggleTheme} label="Dark mode" /></Row>
          </section>

          <section className="stg-card">
            <h2>Download Preferences</h2>
            <Row title="Auto-fetch on paste" desc="App page par link paste hote hi fetch shuru"><Switch checked={prefs.autoFetch} onChange={(v) => upd({ autoFetch: v })} label="Auto-fetch on paste" /></Row>
            <Row title="Paste karte hi app page kholo" desc="Home par paste ke baad sahi app page apne aap khulta hai"><Switch checked={prefs.autoRoute} onChange={(v) => upd({ autoRoute: v })} label="Auto route on paste" /></Row>
            <Row title="Auto-save single result" desc="iOS Safari par ek tap lag sakta hai"><Switch checked={prefs.autoSave} onChange={(v) => upd({ autoSave: v })} label="Auto-save" /></Row>
            <Row title="Default quality">
              <span className="stg-select">
                <select value={prefs.quality} onChange={(e) => upd({ quality: e.target.value as Prefs["quality"] })} aria-label="Default quality">
                  <option value="hd">HD (Best)</option><option value="saver">Data Saver</option>
                </select>
              </span>
            </Row>
            <Row title="Clipboard se link suggest" desc="Sirf jab browser ne pehle se permission di ho"><Switch checked={prefs.clipboardSuggest} onChange={(v) => upd({ clipboardSuggest: v })} label="Clipboard suggest" /></Row>
            <Row title="Download sound"><Switch checked={sound} onChange={(v) => { setSound(v); setSoundOn(v); }} label="Download sound" /></Row>
            <Row title="Haptic feedback" desc={ios ? "iOS Safari par Vibration API nahi hoti" : "Android par download par halka vibration"}>
              <Switch checked={ios ? false : prefs.haptics} onChange={(v) => upd({ haptics: v })} label="Haptic feedback" disabled={ios} />
            </Row>
          </section>

          <section className="stg-card">
            <button type="button" className="stg-adv" aria-expanded={advOpen} onClick={() => setAdvOpen((o) => !o)}>
              <h2>Advanced — Power Users</h2><ChevronDown size={20} aria-hidden="true" style={{ transform: advOpen ? "rotate(180deg)" : undefined }} />
            </button>
            {advOpen && (
              <div className="stg-adv__body">
                <label htmlFor="sid">Instagram Session ID (Optional)</label>
                <div className="stg-pw">
                  <input id="sid" type={showSession ? "text" : "password"} value={session} onChange={(e) => setSession(e.target.value)} placeholder="e.g. 54321%3ABcD1234…" autoComplete="off" autoCapitalize="off" spellCheck={false} />
                  <button type="button" onClick={() => setShowSession((s) => !s)} aria-label={showSession ? "Hide session ID" : "Show session ID"}>{showSession ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
                <p className="stg-help">Saved in your browser. Lets you grab stories/posts from accounts you follow and bypasses public rate-limits.</p>
                <p className="stg-warn"><ShieldAlert size={16} aria-hidden="true" /> Ye aapke Instagram login jaisa hai — kisi ko na dein, aur ho sake to alag account use karein.</p>
                {session && <button type="button" className="stg-link" onClick={() => { setSession(""); setAdvanced("", cobalt); flash("Session ID removed"); }}>Remove Session ID</button>}

                <label htmlFor="cob" style={{ marginTop: 16 }}>Custom Cobalt Instance URL (Optional)</label>
                <input id="cob" className="stg-plain" type="url" inputMode="url" value={cobalt} onChange={(e) => { setCobalt(e.target.value); setCobaltErr(""); }} placeholder="https://cobalt.yourdomain.com" autoCapitalize="off" spellCheck={false} />
                {cobaltErr && <p className="stg-warn" role="alert">{cobaltErr}</p>}
                <p className="stg-help">Add a self-hosted Cobalt endpoint as an extra multi-platform fallback resolver.</p>
                <button type="button" className="stg-save" onClick={saveAdvanced}>Save Preferences</button>
              </div>
            )}
          </section>

          <section className="stg-card">
            <h2>App &amp; Storage</h2>
            <InstallAppButton variant="card" />
            <Row title="Clear History" desc="Sirf Recent Grabs hatta deta hai">
              <button type="button" className="stg-danger" onClick={() => two("history", clearHistory)}>{confirm === "history" ? "Tap again to confirm" : "Clear"}</button>
            </Row>
            <Row title="Reset all local data" desc="History, prefs, recent tools, Session ID, Cobalt URL (theme + language bachenge)">
              <button type="button" className="stg-danger" onClick={() => two("reset", () => { resetAllLocalData(); setP(DEFAULT_PREFS); setSession(""); setCobalt(""); setSound(false); })}>{confirm === "reset" ? "Tap again to confirm" : "Reset"}</button>
            </Row>
          </section>

          <section className="stg-card stg-card--wide">
            <h2>Important Links &amp; Legal</h2>
            <ul className="stg-links">
              {LINKS.map(([l, h]) => <li key={h}><Link href={h}>{l}</Link></li>)}
              <li><a href={SPONSOR_LINK} target="_blank" rel="noopener noreferrer sponsored">Support {BRAND.name}</a></li>
            </ul>
            <p className="stg-help">{BRAND.disclaimer}</p>
            <p className="stg-help">
              {BRAND.copyright} · v1.0
              <Link href="/admin" aria-label="Admin" style={{ textDecoration: "none", color: "var(--line)", marginInlineStart: 8 }}>·</Link>
            </p>
          </section>
        </div>
      </div>
      {toast && <div className="pd-toast" role="status">{toast}</div>}
    </main>
  );
}
