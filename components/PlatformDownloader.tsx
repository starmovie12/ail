"use client";
/**
 * PlatformDownloader (PRD §10) — har app ka page: hero card, URL box, Paste + Download, sub-tool pills,
 * Auto-detect rules R1–R15, result, errors. Instagram hub + Facebook/TikTok/YouTube/Pinterest/X/Threads sab isi se.
 * Back-bar-aware: Header/Bottom bar AppShell hide karta hai; yahan sirf page ka content.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Link2, ClipboardPaste, X, Check, Info } from "lucide-react";
import { PlatformTile } from "@/components/PlatformIcons";
import ErrorCard from "@/components/ErrorCard";
import ResultPanel from "@/components/ResultPanel";
import ProfileExtras from "@/components/ProfileExtras";
import AdFrame from "@/components/AdFrame";
import { grab, type GrabErr } from "@/lib/api";
import { resolveRoute } from "@/lib/router";
import { KIND_LABEL } from "@/lib/detect";
import { platformById, type PlatformId } from "@/lib/platforms";
import { addHistory, getPrefs, setHandoff, takeHandoff, type GrabKind, type GrabPlatform } from "@/lib/storage";
import type { ExtractedResult } from "@/lib/normalize";
import { buildDownloadProxyUrl } from "@/lib/normalize";
import { isIosSafari } from "@/lib/feedback";

type Phase = "idle" | "fetching" | "success" | "error";

/** link kind → pill id (app page par) */
const KIND_TO_PILL: Record<string, string> = {
  reel: "reel", story: "story", highlights: "highlights", post: "photo", video: "video", photo: "photo", profile: "profile", thumbnail: "thumbnail", image: "image",
};

function histKind(kind: string | undefined, r: ExtractedResult): GrabKind {
  if (r.type === "profile") return "profile";
  if (r.type === "thumbnail") return "thumbnail";
  if ((r.media?.length ?? 0) > 1) return "carousel";
  if (kind === "reel" || kind === "story" || kind === "video") return kind;
  if (kind === "highlights") return "story";
  if (r.type === "video" || r.type === "reel") return "video";
  if (r.type === "story") return "story";
  return r.media?.[0]?.type === "image" ? "photo" : "other";
}

export default function PlatformDownloader({
  platform, presetPill, h1, lead,
}: {
  platform: PlatformId;
  /** SEO URL (reels-downloader…) ke liye pehle se chuna hua pill */
  presetPill?: string;
  h1?: React.ReactNode;
  lead?: string;
}) {
  const def = platformById(platform)!;
  const router = useRouter();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recent = useRef<Map<string, number>>(new Map());   // R9
  const booted = useRef(false);

  const [input, setInput] = useState("");
  const [pill, setPill] = useState(presetPill && def.pills.some((p) => p.id === presetPill) ? presetPill : "auto");
  const [autoSelected, setAutoSelected] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ExtractedResult | null>(null);
  const [error, setError] = useState<GrabErr | null>(null);
  const [banner, setBanner] = useState<React.ReactNode>(null);
  const [toast, setToast] = useState("");
  const [pulse, setPulse] = useState(false);
  const [shake, setShake] = useState(false);
  const lastKind = useRef<string | undefined>(undefined);

  const showToast = (t: string) => { setToast(t); setTimeout(() => setToast(""), 4000); };

  // ── fetch (R12: naya request purane ko cancel) ──
  const run = useCallback(async (raw: string, opts: { mode?: string; kind?: string; force?: boolean } = {}) => {
    const value = raw.trim();
    if (!value) return;
    if (!opts.force && recent.current.get(value) && Date.now() - recent.current.get(value)! < 10_000 && phase === "success") return; // R9
    recent.current.set(value, Date.now());
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setPhase("fetching"); setError(null); setResult(null); setPulse(false);
    try {
      const r = await grab({ input: value, platform, mode: opts.mode, signal: ac.signal });
      if (ac.signal.aborted) return;
      if (!r.ok) { setError(r); setPhase("error"); return; }
      setResult(r.data); setPhase("success");
      const k = opts.kind ?? lastKind.current;
      // R14: link ka asli kind fetch ke baad alag nikle (jaise /p/ carousel) to pill chupchap theek ho
      if ((r.data.media?.length ?? 0) > 1 && def.pills.some((p) => p.id === "photo") && pill === "auto") setAutoSelected(false);
      // R11: har success → unified History
      addHistory({
        platform: (platform as GrabPlatform), kind: histKind(k, r.data), url: value.startsWith("@") ? value : value,
        author: r.data.author?.username ? "@" + r.data.author.username : undefined, title: r.data.title,
        thumbnail: r.data.thumbnail && !r.data.thumbnail.startsWith("data:") ? r.data.thumbnail : undefined,
      });
      // R7 / R8: single media + Auto-save
      const prefs = getPrefs();
      const single = (r.data.media?.length ?? 0) === 1 && r.data.type !== "profile" && r.data.type !== "thumbnail";
      if (single && prefs.autoSave) {
        if (isIosSafari()) setPulse(true);
        else {
          const m = r.data.media![0];
          const a = document.createElement("a");
          a.href = buildDownloadProxyUrl(m.url, m.filename || `${platform}-${Date.now()}.${m.type === "video" ? "mp4" : "jpg"}`);
          a.download = "";
          document.body.appendChild(a); a.click(); a.remove();
          showToast("Download shuru ho gaya ✓");
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError({ ok: false, code: "EXTRACTOR_DOWN", message: "" }); setPhase("error");
    }
  }, [platform, def.pills, pill, phase]);

  // ── mismatch / kind checks, phir fetch ──
  const start = useCallback((raw: string, o: { fromHome?: boolean; redirected?: boolean; kindHint?: string } = {}) => {
    const route = resolveRoute(raw, { allowBareUsername: false });
    if (route.type !== "app") { run(raw, { kind: o.kindHint }); return; }
    // R3: platform mismatch
    if (route.platform !== platform) {
      const target = platformById(route.platform)!;
      if (pill === "auto" && !o.redirected) {
        setHandoff({ url: route.url, kind: route.kind, src: "home" });
        showToast(`${target.name} link mila — ${target.name} page par le ja rahe hain`);
        const qs = new URLSearchParams({ src: "home", r: "1" });
        if (route.kind) qs.set("kind", route.kind);
        router.replace(`${target.route}?${qs.toString()}`); // R13: ek hi baar
        return;
      }
      setBanner(<>Ye {target.name} link hai — <Link href={target.route}>{target.name} page par jayein</Link></>);
      return;
    }
    setBanner(null);
    // R4: kind mismatch (non-blocking banner + 1-tap switch)
    const wanted = route.kind ? KIND_TO_PILL[route.kind] : undefined;
    if (pill !== "auto" && wanted && wanted !== pill && def.pills.some((p) => p.id === wanted)) {
      setBanner(<>Ye {KIND_LABEL[route.kind!] ?? "link"} ka link lagta hai — <button type="button" className="pd-link" onClick={() => { setPill(wanted); setBanner(null); }}>{def.pills.find((p) => p.id === wanted)?.label} par switch karein</button> ya <button type="button" className="pd-link" onClick={() => { setPill("auto"); setBanner(null); }}>Auto</button></>);
    }
    lastKind.current = route.kind;
    if (platform === "instagram" && route.kind === "profile") { run(raw, { mode: "profile", kind: "profile" }); return; }
    run(route.url.startsWith("@") ? raw : route.url, { kind: route.kind, mode: pill === "profile" ? "profile" : undefined });
  }, [platform, pill, router, run, def.pills]);

  // ── boot: handoff (src=home/history), ?url= param, kind preselect (R2, R14, R15) ──
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const src = params.get("src");
    const kind = params.get("kind") || undefined;
    const redirected = params.get("r") === "1";
    const more = Number(params.get("more") || 0);
    if (more > 0) showToast(`${more} aur link${more > 1 ? "s" : ""} mile — unhe alag se paste karein`);
    if (kind && KIND_TO_PILL[kind] && def.pills.some((p) => p.id === KIND_TO_PILL[kind])) { setPill(KIND_TO_PILL[kind]); setAutoSelected(true); }
    const handoff = src ? takeHandoff() : null;
    const urlParam = params.get("url");
    const link = handoff?.url || urlParam || "";
    if (link) {
      setInput(link);
      // Home/History se aaye → Auto-fetch setting ignore. ?url= → setting ke hisaab se.
      if (handoff || getPrefs().autoFetch) start(link, { fromHome: Boolean(handoff), redirected, kindHint: kind });
      // Refresh par dobara start na ho: query saaf (R15)
      try { window.history.replaceState(window.history.state, "", window.location.pathname); } catch { /* ignore */ }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // typing 500ms → auto-fetch (sirf valid link)
  const onChange = (v: string) => {
    setInput(v);
    if (debounce.current) clearTimeout(debounce.current);
    setBanner(null);
    if (!getPrefs().autoFetch) return;
    if (resolveRoute(v, { allowBareUsername: false }).type !== "app") return;
    debounce.current = setTimeout(() => start(v), 500);
  };

  const clear = () => {
    abortRef.current?.abort();
    if (debounce.current) clearTimeout(debounce.current);
    setInput(""); setResult(null); setError(null); setPhase("idle"); setBanner(null); setPulse(false);
    inputRef.current?.focus();
  };

  const paste = async () => {
    try {
      const t = (await navigator.clipboard.readText()).trim();
      if (t) { setInput(t); if (debounce.current) clearTimeout(debounce.current); start(t); return; }
    } catch { /* deny */ }
    inputRef.current?.focus();
    setBanner("Long-press → Paste karke link daalein");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounce.current) clearTimeout(debounce.current);
    if (!input.trim()) { setShake(true); setTimeout(() => setShake(false), 320); inputRef.current?.focus(); return; }
    const v = input.trim();
    const route = resolveRoute(v, { allowBareUsername: platform === "instagram" });
    if (route.type !== "app") { setBanner(`Ye ${def.name} ka link nahi lag raha — sahi link paste karein`); return; }
    start(v);
  };

  const placeholder = useMemo(() => (pill === "story" ? "Paste Story link or @username…" : pill === "profile" ? "Enter @username or profile link…" : def.placeholder), [pill, def.placeholder]);
  const profileName = result?.type === "profile" ? result.author?.username : undefined;

  return (
    <div className="pd">
      <style dangerouslySetInnerHTML={{ __html: PD_STYLES }} />

      {/* Hero card (§10.2) */}
      <section className="pd-hero">
        <PlatformTile name={def.iconKey} size={56} showLabel={false} />
        <div className="pd-hero__txt">
          {h1 ? <h1>{h1}</h1> : <h1>{def.name} Downloader</h1>}
          <p>{lead ?? def.desc}</p>
          <ul className="pd-chips" aria-label="Features">
            {def.chips.map((c) => <li key={c}><Check size={13} strokeWidth={3} aria-hidden="true" /> {c}</li>)}
          </ul>
        </div>
      </section>

      {/* URL box + Paste + Download (§10.3) */}
      <form onSubmit={submit} className="pd-form" noValidate>
        <div className={`pd-field ${shake ? "shake" : ""}`}>
          <Link2 size={20} strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef} type="text" value={input} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} aria-label={`${def.name} link`}
            inputMode="url" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} enterKeyHint="go"
          />
          {input && <button type="button" className="pd-x" onClick={clear} aria-label="Clear input"><X size={18} strokeWidth={2.4} /></button>}
        </div>
        <div className="pd-actions">
          <button type="button" className="pd-btn pd-btn--sec" onClick={paste}><ClipboardPaste size={20} strokeWidth={2} aria-hidden="true" /> Paste</button>
          <button type="submit" className="pd-btn pd-btn--pri" disabled={phase === "fetching"} aria-busy={phase === "fetching"}>
            {phase === "fetching" ? <><span className="pd-spin" aria-hidden="true" /> Fetching…</> : <><Download size={20} strokeWidth={2.2} aria-hidden="true" /> Download</>}
          </button>
        </div>
      </form>

      {/* Live "Detected" chip */}
      <p className="pd-detected" aria-live="polite">
        {(() => {
          const r = input.trim() ? resolveRoute(input, { allowBareUsername: false }) : null;
          return r && r.type === "app" && r.platform === platform ? <><Check size={15} strokeWidth={3} aria-hidden="true" /> {r.label} pehchana</> : null;
        })()}
      </p>

      {/* Sub-tools pills (§10.4) */}
      <div className="pd-pills" role="tablist" aria-label="Download type">
        {def.pills.map((p) => (
          <button
            key={p.id} type="button" role="tab" aria-selected={pill === p.id}
            className={`pd-pill ${pill === p.id ? "is-on" : ""}`}
            onClick={() => { setPill(p.id); setAutoSelected(false); setBanner(null); }}
          >
            {p.label}{pill === p.id && autoSelected && p.id !== "auto" ? <small> · Auto-selected</small> : null}
          </button>
        ))}
      </div>

      {platform === "youtube" && <p className="pd-note"><Info size={15} aria-hidden="true" /> YouTube video download abhi nahi — thumbnail mil raha hai.</p>}
      {banner && <div className="pd-banner" role="status">{banner}</div>}
      {toast && <div className="pd-toast" role="status">{toast}</div>}

      {phase === "error" && error && (
        <div style={{ marginTop: 16 }}>
          <ErrorCard code={error.code} onRetry={() => run(input, { force: true })} />
          {error.code === "PRIVATE" && platform === "instagram" && (
            <p className="pd-note" style={{ justifyContent: "center" }}>Private account? <Link href="/settings">Session ID Settings me daalein</Link></p>
          )}
        </div>
      )}

      {phase === "success" && result && (
        <div style={{ marginTop: 16 }}>
          <ResultPanel result={result} platformName={def.name} pulseSave={pulse} onAnother={clear}>
            {profileName && <ProfileExtras username={profileName} />}
          </ResultPanel>
          <div style={{ marginTop: 18 }}><AdFrame slotH={280} /></div>
        </div>
      )}
    </div>
  );
}

const PD_STYLES = `
  .pd { width: 100%; max-width: 720px; margin: 0 auto; text-align: left; }
  .pd-hero { display: flex; gap: 14px; align-items: flex-start; padding: 16px; border-radius: 20px; background: var(--bg-surface); border: 1px solid var(--line-strong); box-shadow: var(--shadow-glow); }
  .pd-hero__txt h1 { font-size: clamp(1.35rem, 1.1rem + 1.2vw, 1.9rem); line-height: 1.15; margin: 0 0 6px; }
  .pd-hero__txt p { margin: 0 0 10px; color: var(--ink-2); font-size: 15px; }
  .pd-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .pd-chips li { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; color: var(--gold-ink); background: rgb(var(--c-cyan-rgb) / .08); border: 1px solid var(--line-strong); }
  .pd-form { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }
  .pd-field { display: flex; align-items: center; gap: 10px; min-height: 56px; padding: 0 8px 0 16px; border-radius: 999px; background: var(--bg-surface); border: 1px solid var(--line-strong); color: var(--ink-3); }
  .pd-field:focus-within { border-color: var(--border-focus); box-shadow: var(--focus-ring); }
  .pd-field input { flex: 1; min-width: 0; height: 52px; background: none; border: 0; outline: 0; color: var(--ink); font-size: 16px; }
  .pd-x { width: 44px; height: 44px; border-radius: 50%; border: 0; background: transparent; color: var(--ink-2); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
  .pd-actions { display: grid; grid-template-columns: 1fr 1.4fr; gap: 12px; }
  .pd-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; border-radius: 999px; cursor: pointer; font-weight: 800; font-size: 16px; }
  .pd-btn--sec { color: var(--ink); background: var(--bg-surface); border: 1px solid var(--line-strong); }
  .pd-btn--pri { color: var(--on-accent); background: var(--gradient-button); border: 0; }
  .pd-btn:disabled { opacity: .75; cursor: default; }
  .pd-btn:focus-visible { outline: 0; box-shadow: var(--focus-ring); }
  .pd-spin { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid currentColor; border-top-color: transparent; animation: pdSpin .7s linear infinite; }
  @keyframes pdSpin { to { transform: rotate(360deg); } }
  .pd-detected { min-height: 24px; margin: 8px 4px 0; font-size: 14px; font-weight: 600; color: var(--ok); display: flex; align-items: center; gap: 6px; }
  .pd-pills { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 8px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .pd-pills::-webkit-scrollbar { display: none; }
  .pd-pill { flex: 0 0 auto; min-height: 44px; padding: 0 16px; border-radius: 999px; cursor: pointer; font-weight: 700; font-size: 14px; color: var(--ink-2); background: var(--bg-surface); border: 1px solid var(--border-color); white-space: nowrap; }
  .pd-pill small { font-weight: 600; opacity: .8; }
  .pd-pill.is-on { color: var(--on-accent); background: var(--gradient-button); border-color: transparent; }
  .pd-pill:focus-visible { outline: 0; box-shadow: var(--focus-ring); }
  .pd-note { margin: 8px 4px 0; font-size: 14px; color: var(--ink-2); display: flex; align-items: center; gap: 6px; }
  .pd-note a, .pd-banner a, .pd-link { color: var(--gold-ink); font-weight: 700; }
  .pd-link { background: none; border: 0; padding: 0; cursor: pointer; font-size: inherit; text-decoration: underline; }
  .pd-banner { margin-top: 10px; padding: 12px 14px; border-radius: 14px; font-size: 14px; background: rgb(var(--c-violet-2-rgb) / .12); border: 1px solid var(--line-strong); color: var(--ink); }
  .pd-toast { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(var(--sab) + 24px); z-index: var(--z-toast); padding: 12px 18px; border-radius: 14px; font-size: 14px; font-weight: 600; background: var(--surface-3); color: var(--ink); border: 1px solid var(--line-strong); box-shadow: var(--shadow-md); max-width: 92vw; }
  @media (max-width: 479px) { .pd-hero { flex-direction: column; } }
`;
