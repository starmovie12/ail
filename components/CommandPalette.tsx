"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, CornerDownLeft, History } from "lucide-react";
import { visibleTools } from "@/lib/registry";
import { CATEGORY_ICON } from "@/components/ToolIcon";
import { recordToolVisit, getRecentTools } from "@/lib/retention";

/** Registry se (PRD A17) — copy.ts ki 12-tool list nahi. */
const TOOLS = visibleTools.map((t) => ({ title: t.name, desc: t.description, href: t.href, Icon: CATEGORY_ICON[t.category] }));

/**
 * Global Cmd+K / Ctrl+K palette: jump to any tool in a second. Also the
 * central place that records tool-page visits for the "recently used" row.
 */
export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [recent, setRecent] = useState<string[]>([]);

  // Record visits to tool pages (retention: powers the "recently used" row).
  useEffect(() => {
    if (pathname && TOOLS.some((t) => t.href === pathname)) recordToolVisit(pathname);
  }, [pathname]);

  const openPalette = useCallback(() => {
    setRecent(getRecentTools());
    setQuery(""); setActive(0); setOpen(true);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => { if (!o) { setRecent(getRecentTools()); setQuery(""); setActive(0); } return !o; });
        return;
      }
      // H9 — "/" opens the palette when you're not typing in a field.
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT" && !(e.target as HTMLElement | null)?.isContentEditable) {
        e.preventDefault();
        setRecent(getRecentTools()); setQuery(""); setActive(0); setOpen(true);
        return;
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recents = recent
        .map((href) => TOOLS.find((t) => t.href === href))
        .filter((t): t is (typeof TOOLS)[number] => !!t)
        .slice(0, 4);
      const rest = TOOLS.filter((t) => !recents.includes(t));
      return { recents, tools: rest };
    }
    return {
      recents: [],
      tools: TOOLS.filter((t) => (t.title + " " + t.desc + " " + t.href).toLowerCase().includes(q)),
    };
  }, [query, recent]);

  const flat = [...results.recents, ...results.tools];

  function pick(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && flat[active]) { e.preventDefault(); pick(flat[active].href); }
  }

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) {
    // Floating button hata diya — Tools tab ka search + Ctrl/⌘+K hi kaafi hai (bottom nav ke saath overlap nahi)
    return null;
  }

  return (
    <div
      onClick={() => setOpen(false)}
      role="dialog" aria-modal="true" aria-label="Tool search"
      style={{ position: "fixed", inset: 0, zIndex: 130, background: "rgba(5,11,36,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12vh 16px 16px" }}>
      <div onClick={(e) => e.stopPropagation()} className="card intro-rise"
        style={{ width: "100%", maxWidth: 560, padding: 0, overflow: "hidden", boxShadow: "0 20px 60px rgba(5,11,36,.45)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
          <Search size={17} strokeWidth={1.5} style={{ color: "var(--gold-ink)", flexShrink: 0 }} />
          <input
            ref={inputRef} value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onInputKey}
            placeholder="Search 80+ tools…"
            aria-label="Search tools"
            style={{ flex: 1, background: "none", border: "none", fontSize: 15, color: "var(--ink)", outline: "none" }}
          />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", border: "1px solid var(--line)", borderRadius: 6, padding: "2px 6px" }}>esc</span>
        </div>

        <div ref={listRef} style={{ maxHeight: 380, overflowY: "auto", padding: 8 }}>
          {results.recents.length > 0 && (
            <div className="label" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px 4px", color: "var(--gold-ink)" }}>
              <History size={12} strokeWidth={1.5} /> Recently used
            </div>
          )}
          {flat.length === 0 && (
            <p style={{ padding: "24px 16px", textAlign: "center", color: "var(--ink-3)", fontSize: "var(--t-small)" }}>
              Nothing matches “{query}” — try “download”, “caption” or “calculator”.
            </p>
          )}
          {flat.map((t, i) => {
            const isRecentHeaderBoundary = results.recents.length > 0 && i === results.recents.length;
            return (
              <div key={t.href}>
                {isRecentHeaderBoundary && (
                  <div className="label" style={{ padding: "10px 12px 4px" }}>All tools</div>
                )}
                <button
                  data-idx={i}
                  onClick={() => pick(t.href)}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                    padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: i === active ? "var(--surface-2)" : "transparent",
                    outline: i === active ? "1px solid var(--gold-300)" : "none",
                  }}>
                  <span style={{ color: "var(--gold-ink)", display: "inline-flex", flexShrink: 0 }}>
                    <t.Icon size={17} strokeWidth={1.5} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{t.title}</span>
                    <span style={{ display: "block", fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.desc}</span>
                  </span>
                  {i === active && <CornerDownLeft size={14} strokeWidth={1.5} style={{ color: "var(--ink-3)", flexShrink: 0 }} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
