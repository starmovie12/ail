"use client";
/** Tools screen (PRD §9): title+count, search, category pills, recently used, tool of the day, Apps row, sections. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, History } from "lucide-react";
import { PlatformTile } from "@/components/PlatformIcons";
import ToolIcon from "@/components/ToolIcon";
import ToolOfTheDay from "@/components/ToolOfTheDay";
import { PLATFORMS } from "@/lib/platforms";
import { TOOL_COUNT, TOOL_PILLS, pillOf, searchTools, toolsForPill, visibleTools, type ToolItem, type ToolPill } from "@/lib/registry";
import { getRecentTools, recordToolVisit } from "@/lib/retention";

const SECTION_ORDER: { id: Exclude<ToolPill, "popular" | "all">; label: string }[] = [
  { id: "downloaders", label: "Downloaders" }, { id: "ai", label: "AI & Creator" }, { id: "analytics", label: "Analytics" },
  { id: "visual", label: "Visual Studio" }, { id: "utilities", label: "Utilities" }, { id: "fun", label: "Fun" },
];

function Tile({ t }: { t: ToolItem }) {
  return (
    <Link href={t.href} className="ts-tile" onClick={() => recordToolVisit(t.href)}>
      <ToolIcon category={t.category} size={56} />
      <span className="ts-tile__name">{t.name}</span>
      <span className="ts-tile__desc">{t.description}</span>
      {t.badge && <span className="ts-badge">{t.badge}</span>}
    </Link>
  );
}

export default function ToolsScreen() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const initialCat = (TOOL_PILLS.some((p) => p.id === sp.get("cat")) ? sp.get("cat") : "popular") as ToolPill;
  const [cat, setCat] = useState<ToolPill>(initialCat);
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [debounced, setDebounced] = useState(q);
  const [recent, setRecent] = useState<ToolItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const id = setTimeout(() => setDebounced(q), 150); return () => clearTimeout(id); }, [q]);
  useEffect(() => {
    setRecent(getRecentTools().map((h) => visibleTools.find((t) => t.href === h)).filter((t): t is ToolItem => !!t).slice(0, 6));
  }, []);
  // URL sync (?cat=&q=) — share/restore
  useEffect(() => {
    const p = new URLSearchParams();
    if (cat !== "popular") p.set("cat", cat);
    if (debounced.trim()) p.set("q", debounced.trim());
    const s = p.toString();
    router.replace(s ? `${path}?${s}` : path, { scroll: false });
  }, [cat, debounced]); // eslint-disable-line react-hooks/exhaustive-deps
  // `/` ya ⌘K = search focus
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const counts = useMemo(() => Object.fromEntries(TOOL_PILLS.map((p) => [p.id, toolsForPill(p.id).length])) as Record<ToolPill, number>, []);
  const searching = debounced.trim().length > 0;
  const results = useMemo(() => searchTools(debounced, toolsForPill(cat === "popular" && searching ? "all" : cat)), [debounced, cat, searching]);
  const showApps = !searching && (cat === "popular" || cat === "all" || cat === "downloaders");
  const clear = useCallback(() => { setQ(""); inputRef.current?.focus(); }, []);

  return (
    <main className="ts">
      <div className="container" style={{ maxWidth: 1120 }}>
        <div className="ts-title">
          <h1>All Tools</h1>
          <span className="ts-count" aria-label={`${TOOL_COUNT} tools`}>{TOOL_COUNT}</span>
        </div>

        <div className="ts-search">
          <Search size={20} strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef} type="search" value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") clear(); }}
            placeholder={`Search ${TOOL_COUNT} tools…`} aria-label="Search tools"
            autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="search"
          />
          {q && <button type="button" onClick={clear} aria-label="Clear search"><X size={18} strokeWidth={2.4} /></button>}
        </div>

        <div className="ts-pills" role="tablist" aria-label="Categories">
          {TOOL_PILLS.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={cat === p.id} className={`ts-pill ${cat === p.id ? "is-on" : ""}`} onClick={() => setCat(p.id)}>
              {p.label}{p.id !== "popular" && p.id !== "all" ? <small> {counts[p.id]}</small> : null}
            </button>
          ))}
        </div>

        {!searching && recent.length > 0 && (
          <section aria-label="Recently used" className="ts-sec">
            <h2 className="ts-h"><History size={14} strokeWidth={2.2} aria-hidden="true" /> Recently used</h2>
            <ul className="ts-grid">{recent.map((t) => <li key={t.href}><Tile t={t} /></li>)}</ul>
          </section>
        )}

        {!searching && <div className="ts-sec"><ToolOfTheDay /></div>}

        {showApps && (
          <section aria-label="Apps" className="ts-sec">
            <h2 className="ts-h">Apps</h2>
            <ul className="ts-apps">
              {PLATFORMS.map((p) => (
                <li key={p.id}>
                  <Link href={p.route} className="ts-app">
                    <PlatformTile name={p.iconKey} size={64} showLabel={false} />
                    <span>{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {searching || (cat !== "popular" && cat !== "all") ? (
          <section className="ts-sec" aria-live="polite">
            {results.length === 0 ? (
              <div className="ts-empty">
                <p><strong>Kuch nahi mila</strong></p>
                <p>“{debounced}” ke liye koi tool nahi. <Link href="/contact">Tool request karein</Link></p>
              </div>
            ) : (
              <ul className="ts-grid">{results.map((t) => <li key={t.href}><Tile t={t} /></li>)}</ul>
            )}
          </section>
        ) : (
          (cat === "popular" ? [{ id: "popular" as const, label: "Popular", list: toolsForPill("popular") }] : SECTION_ORDER.map((s) => ({ id: s.id, label: s.label, list: toolsForPill("all").filter((t) => pillOf(t) === s.id) }))).map((s) => (
            <section key={s.id} className="ts-sec">
              <h2 className="ts-h">{s.label}</h2>
              <ul className="ts-grid">{s.list.map((t) => <li key={t.href}><Tile t={t} /></li>)}</ul>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
