"use client";
/**
 * Smart Link Box — Home ka textbox ab ROUTER hai (PRD §7.1, §7.6). Download/fetch yahan kabhi nahi hota.
 * Design: GoldenBar ka neon card — markup + CSS bilkul wahi (GOLDEN_BAR_STYLES + gbn-* classes), sirf behaviour naya.
 * Paste Link / Grab Media / Enter / Ctrl+V / drop → resolveRoute() → sahi app page (auto-start).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ClipboardPaste, Download, Link2, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { track } from "@vercel/analytics";
import { GOLDEN_BAR_STYLES } from "@/components/GoldenBar";
import { resolveRoute, type Route } from "@/lib/router";
import { PLATFORMS, soonById } from "@/lib/platforms";
import { getPrefs, setHandoff } from "@/lib/storage";

type Trigger = "paste_btn" | "grab" | "paste_event" | "drop";
type Status =
  | { kind: "none" }
  | { kind: "routing"; label: string; cancellable: boolean }
  | { kind: "error"; text: string; chips: boolean; request?: boolean };

const MSG = {
  empty: "Link ya @username daalein",
  notlink: "Ye link nahi lag raha — kisi post ya reel ka link paste karein",
  unknown: "Ye link abhi supported nahi",
  self: "Ye hamari hi site ka link hai",
  scheme: "Ye link sahi nahi hai",
  fbStory: "Facebook Stories / Albums abhi supported nahi — video, reel ya photo ka link paste karein",
  hint: "Long-press → Paste karke link daalein",
};

export default function SmartLinkBox({ footer }: { footer?: React.ReactNode }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "none" });
  const [shake, setShake] = useState(false);

  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  useEffect(() => clearTimer, []);

  // /how-to-download ka "Ab try karein" → Home textbox focus
  useEffect(() => {
    try { if (new URLSearchParams(location.search).get("focus") === "1") inputRef.current?.focus(); } catch { /* ignore */ }
  }, []);

  // Ctrl/⌘+K = focus
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Clipboard prefill — sirf jab permission pehle se ho (kabhi prompt nahi)
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        if (!getPrefs().clipboardSuggest || !navigator.permissions?.query || !navigator.clipboard?.readText) return;
        const st = await navigator.permissions.query({ name: "clipboard-read" as PermissionName });
        if (st.state !== "granted" || dead) return;
        const text = (await navigator.clipboard.readText()).trim();
        if (!dead && text && resolveRoute(text).type === "app") setInput((cur) => cur || text);
      } catch { /* silent */ }
    })();
    return () => { dead = true; };
  }, []);

  const selfHosts = useCallback(() => (typeof location !== "undefined" ? [location.hostname] : []), []);

  const fail = useCallback((text: string, chips = false, request = false) => {
    setStatus({ kind: "error", text, chips, request });
  }, []);

  const go = useCallback((route: Route, trigger: Trigger) => {
    const evt = (outcome: string, platform?: string, kind?: string) => { try { track("home_route", { platform: platform ?? "-", kind: kind ?? "-", trigger, outcome }); } catch { /* ignore */ } };
    switch (route.type) {
      case "app": {
        const qs = new URLSearchParams();
        if (route.kind) qs.set("kind", route.kind);
        qs.set("src", "home");
        if (route.extraLinks) qs.set("more", String(route.extraLinks));
        // Link URL me nahi — sessionStorage handoff (sessionStorage block ho to ?url= fallback)
        const ok = setHandoff({ url: route.url, kind: route.kind, src: "home" });
        if (!ok) qs.set("url", route.url);
        const path = `${route.path}?${qs.toString()}`;
        router.prefetch(route.path);
        setStatus({ kind: "routing", label: `${route.label} pehchana · Khol rahe hain…`, cancellable: false });
        evt("routed", route.platform, route.kind);
        router.push(path);
        return;
      }
      case "batch": {
        const ok = setHandoff({ url: route.urls.join("\n"), kind: "batch", src: "home" });
        setStatus({ kind: "routing", label: `${route.urls.length} Instagram links pehchane · Batch page khol rahe hain…`, cancellable: false });
        evt("routed", "instagram", "batch");
        router.push(ok ? "/batch-downloader?src=home" : `/batch-downloader?src=home&url=${encodeURIComponent(route.urls.join("\n"))}`);
        return;
      }
      case "soon": {
        evt("soon", route.platform);
        router.push(`/coming-soon/${route.platform}`);
        return;
      }
      case "unsupported": fail(MSG.fbStory, true); evt("unknown", route.platform); return;
      case "rejected": fail(route.reason === "self" ? MSG.self : MSG.scheme); evt("unknown"); return;
      case "empty":
        setShake(true); setTimeout(() => setShake(false), 320);
        fail(MSG.empty); inputRef.current?.focus(); evt("unknown"); return;
      case "notlink": fail(MSG.notlink, true); evt("unknown"); return;
      default: fail(MSG.unknown, true, true); evt("unknown");
    }
  }, [router, fail]);

  const submit = useCallback((raw: string, trigger: Trigger) => {
    clearTimer();
    const route = resolveRoute(raw, { allowBareUsername: trigger === "grab", selfHosts: selfHosts() });
    go(route, trigger);
  }, [go, selfHosts]);

  // Paste event / drop — typing par kabhi nahi. autoRoute ON ho to 600ms chip + Cancel
  const maybeAutoRoute = useCallback((raw: string, trigger: "paste_event" | "drop") => {
    clearTimer();
    const route = resolveRoute(raw, { allowBareUsername: false, selfHosts: selfHosts() });
    if (route.type === "app") router.prefetch(route.path);
    if (!getPrefs().autoRoute) return;
    if (route.type !== "app" && route.type !== "soon" && route.type !== "batch") return;
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const label = route.type === "app" ? `${route.label} pehchana` : route.type === "batch" ? "Instagram links pehchane" : `${soonById(route.platform)?.name ?? "App"} pehchana`;
    setStatus({ kind: "routing", label: `${label} · Khol rahe hain…`, cancellable: true });
    timer.current = setTimeout(() => { timer.current = null; go(route, trigger); }, reduce ? 300 : 600);
  }, [go, router, selfHosts]);

  const cancel = () => {
    clearTimer();
    setStatus({ kind: "none" });
    try { track("home_route", { platform: "-", kind: "-", trigger: "paste_event", outcome: "cancelled" }); } catch { /* ignore */ }
  };

  const pasteButton = async () => {
    clearTimer();
    setStatus({ kind: "none" });
    try {
      const text = navigator.clipboard && typeof navigator.clipboard.readText === "function" ? (await navigator.clipboard.readText()).trim() : "";
      if (text) {
        setInput(text);
        const route = resolveRoute(text, { allowBareUsername: false, selfHosts: selfHosts() });
        if (route.type === "app" || route.type === "soon" || route.type === "batch" || route.type === "unsupported") { go(route, "paste_btn"); return; }
        inputRef.current?.focus();
        fail(route.type === "unknown" ? MSG.unknown : MSG.notlink, true, route.type === "unknown");
        return;
      }
    } catch { /* deny / unsupported */ }
    inputRef.current?.focus();
    setStatus({ kind: "error", text: MSG.hint, chips: false });
  };

  const hasText = input.length > 0;
  const statusLine = useMemo(() => {
    if (status.kind === "routing") {
      return (
        <p className="slb-status slb-status--ok" role="status" aria-live="polite">
          <Check size={16} strokeWidth={2.6} aria-hidden="true" />
          <span>{status.label}</span>
          {status.cancellable && (
            <button type="button" className="slb-cancel" onClick={cancel} aria-label="Cancel">
              <X size={14} strokeWidth={2.6} aria-hidden="true" /> Cancel
            </button>
          )}
        </p>
      );
    }
    if (status.kind === "error") {
      return (
        <div className="slb-status slb-status--err" role="alert">
          <span>{status.text}</span>
          {status.chips && (
            <span className="slb-chips">
              {PLATFORMS.map((p) => <Link key={p.id} href={p.route} className="slb-chip">{p.name}</Link>)}
              {status.request && <Link href="/contact" className="slb-chip slb-chip--ghost">Is app ki request karein</Link>}
            </span>
          )}
        </div>
      );
    }
    return null;
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const t = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
        if (!t) return;
        e.preventDefault();
        setInput(t.trim());
        maybeAutoRoute(t.trim(), "drop");
      }}
    >
      <div className="gb-wrapper gb-neon">
        <style dangerouslySetInnerHTML={{ __html: GOLDEN_BAR_STYLES + SLB_STYLES }} />
        <div className="gbn-card" data-loading="false">
          <form onSubmit={(e) => { e.preventDefault(); submit(input, "grab"); }} className="gbn-form" noValidate>
            {/* A) Input pill: link icon → input → ✕ (sirf text hone par) */}
            <div className={`gbn-field ${shake ? "shake" : ""}`}>
              <span className="gbn-field__icon" aria-hidden="true">
                <Link2 size={22} strokeWidth={2} />
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="url"
                enterKeyHint="go"
                autoCapitalize="off"
                value={input}
                onChange={(e) => { setInput(e.target.value); clearTimer(); if (status.kind !== "none") setStatus({ kind: "none" }); }}
                onPaste={(e) => {
                  const t = e.clipboardData.getData("text").trim();
                  if (t) setTimeout(() => maybeAutoRoute(t, "paste_event"), 0);
                }}
                placeholder="Paste Instagram, Facebook, or any link..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="gbn-input"
                aria-label="Paste a link or @username"
              />
              {hasText && (
                <button
                  type="button"
                  onClick={() => { clearTimer(); setInput(""); setStatus({ kind: "none" }); inputRef.current?.focus(); }}
                  className="gbn-clear"
                  aria-label="Clear input"
                  title="Clear"
                >
                  <X size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* B) Paste Link (secondary) + Grab Media (primary) */}
            <div className="gbn-actions">
              <button type="button" onClick={() => { void pasteButton(); }} className="gbn-btn gbn-btn--paste" title="Paste from clipboard">
                <span className="gbn-btn__icon" aria-hidden="true"><ClipboardPaste size={22} strokeWidth={2} /></span>
                <span className="gbn-btn__label">Paste Link</span>
                <span className="gbn-btn__tail" aria-hidden="true"><ArrowRight size={20} strokeWidth={2.2} /></span>
              </button>

              <button type="submit" className="gbn-btn gbn-btn--grab">
                <span className="gbn-btn__icon" aria-hidden="true"><Download size={22} strokeWidth={2.2} /></span>
                <span className="gbn-btn__label">Grab Media</span>
                <span className="gbn-btn__tail" aria-hidden="true"><Sparkles size={20} strokeWidth={2} /></span>
              </button>
            </div>
          </form>

          {/* B2) Trust row */}
          <ul className="gbn-trust" aria-label="Why people trust InstaGrab">
            <li className="gbn-trust__item">
              <span className="gbn-trust__icon" aria-hidden="true"><ShieldCheck size={20} strokeWidth={2} /></span>
              <span>100% Anonymous &amp; Safe</span>
            </li>
            <li className="gbn-trust__item">
              <span className="gbn-trust__icon" aria-hidden="true"><Sparkles size={20} strokeWidth={2} /></span>
              <span>Full HD / 4K Original Quality</span>
            </li>
            <li className="gbn-trust__item">
              <span className="gbn-trust__icon" aria-hidden="true"><Zap size={20} strokeWidth={2} fill="currentColor" /></span>
              <span>No Login or Watermark</span>
            </li>
          </ul>

          {/* C) Sub-card slot: <ToolsAutoSupported /> + <TrustFootBar /> */}
          {footer}
        </div>
      </div>
      {/* Status line — card ke bahar, jagah pehle se reserved (CLS = 0) */}
      <div className="slb-slot" aria-live="polite">{statusLine}</div>
    </div>
  );
}

const SLB_STYLES = `
  .slb-slot { min-height: 36px; margin-top: 10px; }
  .slb-status { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin: 0; font-size: 14px; line-height: 1.4; }
  .slb-status--ok { color: var(--ok); font-weight: 600; }
  .slb-status--err { color: var(--ink-2); }
  .slb-cancel { display: inline-flex; align-items: center; gap: 4px; min-height: 36px; padding: 0 12px; border-radius: 999px; cursor: pointer;
    background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--ink); font-size: 13px; font-weight: 600; }
  .slb-chips { display: flex; flex-wrap: wrap; gap: 6px; width: 100%; }
  .slb-chip { display: inline-flex; align-items: center; min-height: 36px; padding: 0 12px; border-radius: 999px; text-decoration: none;
    font-size: 13px; font-weight: 600; color: var(--gold-ink); background: rgb(var(--c-cyan-rgb) / .08); border: 1px solid var(--line-strong); }
  .slb-chip--ghost { color: var(--ink-2); background: transparent; }
`;
