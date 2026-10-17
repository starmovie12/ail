"use client";
/**
 * Quick Action — PWA share-target (/quick-action) + browser extension (PRD A21, §10.10).
 * Pehle sirf Instagram regex tha; ab shared text `resolveRoute()` se guzarta hai → sahi app page par handoff.
 */
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Link2, ArrowRight } from "lucide-react";
import { resolveRoute, type Route } from "@/lib/router";
import { setHandoff } from "@/lib/storage";

function openRoute(route: Route, router: ReturnType<typeof useRouter>): boolean {
  if (route.type === "app") {
    const qs = new URLSearchParams({ src: "home" });
    if (route.kind) qs.set("kind", route.kind);
    if (!setHandoff({ url: route.url, kind: route.kind, src: "home" })) qs.set("url", route.url);
    router.replace(`${route.path}?${qs.toString()}`);
    return true;
  }
  if (route.type === "batch") {
    const ok = setHandoff({ url: route.urls.join("\n"), kind: "batch", src: "home" });
    router.replace(ok ? "/batch-downloader?src=home" : `/batch-downloader?src=home&url=${encodeURIComponent(route.urls.join("\n"))}`);
    return true;
  }
  if (route.type === "soon") { router.replace(`/coming-soon/${route.platform}`); return true; }
  return false;
}

export default function QuickAction() {
  const params = useSearchParams();
  const router = useRouter();
  const [manual, setManual] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    // Share sheet link `text`, `url` ya `title` me aata hai
    const shared = ["url", "text", "title"].map((k) => params.get(k) ?? "").filter(Boolean).join("\n");
    if (shared) {
      const route = resolveRoute(shared, { allowBareUsername: false });
      if (openRoute(route, router)) return;
      setMsg("Ye link abhi supported nahi — neeche sahi link paste karein.");
    }
    setBusy(false);
  }, [params, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const route = resolveRoute(manual, { allowBareUsername: true });
    if (!openRoute(route, router)) setMsg(route.type === "empty" ? "Link ya @username daalein" : "Ye link abhi supported nahi");
  }

  return (
    <div className="container" style={{ maxWidth: 560, padding: "32px var(--gutter)", textAlign: "center" }}>
      {busy ? (
        <p style={{ color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: 8 }}><Loader2 size={18} className="qa-spin" aria-hidden="true" /> Opening…</p>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Quick download</h1>
          <label className="pd-field" style={{ display: "flex" }}>
            <Link2 size={20} aria-hidden="true" />
            <input value={manual} onChange={(e) => { setManual(e.target.value); setMsg(""); }} placeholder="Paste any link…" inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false}
              style={{ flex: 1, minWidth: 0, height: 52, background: "none", border: 0, outline: 0, color: "var(--ink)", fontSize: 16 }} aria-label="Link" />
          </label>
          {msg && <p role="alert" style={{ color: "var(--ink-2)", margin: 0, fontSize: 14 }}>{msg}</p>}
          <button type="submit" className="pd-btn pd-btn--pri">Go <ArrowRight size={18} aria-hidden="true" /></button>
        </form>
      )}
      <style>{`.qa-spin{animation:qaSpin .8s linear infinite}@keyframes qaSpin{to{transform:rotate(360deg)}}.pd-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;border-radius:999px;cursor:pointer;font-weight:800;font-size:16px;border:0}.pd-btn--pri{color:var(--on-accent);background:var(--gradient-button)}.pd-field{display:flex;align-items:center;gap:10px;min-height:56px;padding:0 12px 0 16px;border-radius:999px;background:var(--bg-surface);border:1px solid var(--line-strong);color:var(--ink-3)}`}</style>
    </div>
  );
}
