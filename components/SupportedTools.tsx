"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

import { ALL_SUPPORTED_TOOLS } from "@/lib/registry";
import type { ToolCategory, ToolBadge, ToolItem } from "@/lib/registry";
export type { ToolCategory, ToolBadge, ToolItem } from "@/lib/registry";

export interface SupportedToolsProps {
  currentTool?: string;
  initialCategory?: ToolCategory;
  category?: string;
  showSearch?: boolean;
  compact?: boolean;
  initialLimit?: number;
  limit?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  [key: string]: unknown;
}

export { ALL_SUPPORTED_TOOLS };
export const SUPPORTED_TOOLS = ALL_SUPPORTED_TOOLS;
export const TOOLS = ALL_SUPPORTED_TOOLS;

const CATEGORIES: { id: ToolCategory; label: string; icon: string }[] = [
  { id: "all", label: "All Tools", icon: "✨" },
  { id: "downloaders", label: "IG Downloaders", icon: "⬇️" },
  { id: "platforms", label: "Multi-Platform", icon: "🌐" },
  { id: "ai", label: "AI & Creator", icon: "🪄" },
  { id: "analytics", label: "Audit & Stats", icon: "📊" },
  { id: "visual", label: "Grid & Visuals", icon: "🎨" },
  { id: "utilities", label: "Text & Utilities", icon: "🛠️" },
  { id: "fun", label: "Fun & Viral", icon: "🔥" },
];

const BADGE_STYLES: Record<ToolBadge, { bg: string; color: string; border: string }> = {
  Popular: {
    bg: "rgb(var(--c-violet-2-rgb) / 0.14)",
    color: "var(--gold-ink)",
    border: "rgb(var(--c-violet-2-rgb) / 0.35)",
  },
  AI: {
    bg: "rgb(var(--c-violet-2-rgb) / 0.16)",
    color: "#a78bfa",
    border: "rgb(var(--c-violet-2-rgb) / 0.38)",
  },
  Hot: {
    bg: "rgb(var(--c-magenta-rgb) / 0.16)",
    color: "var(--gold-ink)",
    border: "rgb(var(--c-magenta-rgb) / 0.40)",
  },
  New: {
    bg: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    border: "rgba(16, 185, 129, 0.35)",
  },
  Hindi: {
    bg: "rgb(var(--c-sky-rgb) / 0.15)",
    color: "#60a5fa",
    border: "rgb(var(--c-sky-rgb) / 0.35)",
  },
};

const COMPONENT_STYLES = `
  .st-root {
    width: 100%;
    padding: 3.5rem 1rem;
  }
  .st-compact {
    padding: 2rem 0.75rem;
  }
  .st-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  .st-header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 2rem;
  }
  .st-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: rgb(var(--c-violet-2-rgb) / 0.1);
    border: 1px solid rgb(var(--c-violet-2-rgb) / 0.25);
    color: var(--c-violet-2);
    margin-bottom: 0.85rem;
  }
  .st-pill-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--c-violet-2);
    box-shadow: 0 0 8px var(--c-violet-2);
  }
  .st-title {
    font-size: clamp(1.65rem, 3.2vw, 2.35rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.2;
    margin: 0 0 0.65rem;
    color: inherit;
  }
  .st-subtitle {
    font-size: 0.98rem;
    line-height: 1.6;
    opacity: 0.76;
    margin: 0;
  }
  .st-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .st-search-wrap {
    position: relative;
    max-width: 560px;
    width: 100%;
    margin: 0 auto;
  }
  .st-search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.95rem;
    pointer-events: none;
    opacity: 0.7;
  }
  .st-search-input {
    width: 100%;
    padding: 0.82rem 2.6rem 0.82rem 2.75rem;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.04);
    color: inherit;
    font-size: 0.94rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .st-search-input:focus {
    border-color: var(--c-violet-2);
    box-shadow: 0 0 0 3px rgb(var(--c-violet-2-rgb) / 0.15);
  }
  .st-clear-btn {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: rgba(148, 163, 184, 0.2);
    color: inherit;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .st-tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  .st-tab {
    display: inline-flex;
    align-items: center;
    gap: 0.42rem;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(148, 163, 184, 0.06);
    color: inherit;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .st-tab:hover {
    border-color: rgb(var(--c-violet-2-rgb) / 0.45);
    transform: translateY(-1px);
  }
  .st-tab-active {
    background: linear-gradient(135deg, var(--c-violet-2), var(--c-violet-2));
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 6px 18px rgb(var(--c-violet-2-rgb) / 0.28);
  }
  .st-tab-count {
    font-size: 0.72rem;
    padding: 0.1rem 0.42rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.14);
    opacity: 0.9;
  }
  .st-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
    gap: 1rem;
  }
  .st-card {
    display: flex;
    flex-direction: column;
    padding: 1.15rem 1.2rem;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(148, 163, 184, 0.04);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .st-card:hover {
    transform: translateY(-3px);
    border-color: rgb(var(--c-violet-2-rgb) / 0.45);
    background: rgb(var(--c-violet-2-rgb) / 0.04);
    box-shadow: 0 12px 28px -10px rgb(var(--c-violet-2-rgb) / 0.22);
  }
  .st-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }
  .st-icon-box {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: rgb(var(--c-violet-2-rgb) / 0.1);
    border: 1px solid rgb(var(--c-violet-2-rgb) / 0.2);
  }
  .st-card-meta {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }
  .st-badge {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.18rem 0.52rem;
    border-radius: 999px;
    border: 1px solid;
  }
  .st-arrow {
    font-size: 0.95rem;
    opacity: 0.45;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .st-card:hover .st-arrow {
    transform: translate(2px, -2px);
    opacity: 0.95;
    color: var(--c-violet-2);
  }
  .st-card-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.38rem;
    line-height: 1.35;
  }
  .st-card-desc {
    font-size: 0.84rem;
    line-height: 1.5;
    opacity: 0.74;
    margin: 0;
  }
  .st-empty {
    text-align: center;
    padding: 3rem 1rem;
    border-radius: 16px;
    border: 1px dashed rgba(148, 163, 184, 0.3);
  }
  .st-empty-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.35rem;
  }
  .st-empty-sub {
    font-size: 0.88rem;
    opacity: 0.7;
    margin: 0 0 1rem;
  }
  .st-reset-btn,
  .st-expand-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.35rem;
    border-radius: 999px;
    border: 1px solid rgb(var(--c-violet-2-rgb) / 0.4);
    background: rgb(var(--c-violet-2-rgb) / 0.1);
    color: inherit;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .st-reset-btn:hover,
  .st-expand-btn:hover {
    background: linear-gradient(135deg, var(--c-violet-2), var(--c-violet-2));
    color: #ffffff;
    border-color: transparent;
    transform: translateY(-1px);
  }
  .st-footer {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
  @media (max-width: 640px) {
    .st-root {
      padding: 2.25rem 0.85rem;
    }
    .st-grid {
      grid-template-columns: 1fr;
    }
    .st-tabs {
      justify-content: flex-start;
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 0.35rem;
    }
    .st-tab {
      white-space: nowrap;
    }
  }
`;

export function SupportedTools({
  currentTool,
  initialCategory = "all",
  category,
  showSearch = true,
  compact = false,
  initialLimit = 18,
  limit,
  title = "Complete Instagram & Creator Toolkit",
  subtitle = "Explore 70+ free downloaders, AI generators, profile audits, and visual grid utilities — no login required.",
  className = "",
}: SupportedToolsProps) {
  const resolvedInitialCategory = (
    category && CATEGORIES.some((c) => c.id === category)
      ? category
      : initialCategory
  ) as ToolCategory;

  const resolvedLimit = typeof limit === "number" ? limit : initialLimit;

  const [activeCategory, setActiveCategory] = useState<ToolCategory>(
    resolvedInitialCategory
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredTools = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return ALL_SUPPORTED_TOOLS.filter((tool) => {
      if (currentTool && tool.href === currentTool) {
        return false;
      }

      const matchesCategory =
        activeCategory === "all" || tool.category === activeCategory;

      if (!matchesCategory) return false;

      if (!normalizedQuery) return true;

      const inName = tool.name.toLowerCase().includes(normalizedQuery);
      const inDesc = tool.description.toLowerCase().includes(normalizedQuery);
      const inKeywords = tool.keywords?.some((k) =>
        k.toLowerCase().includes(normalizedQuery)
      );

      return inName || inDesc || Boolean(inKeywords);
    });
  }, [activeCategory, searchQuery, currentTool]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ToolCategory, number> = {
      all: 0,
      downloaders: 0,
      platforms: 0,
      ai: 0,
      analytics: 0,
      visual: 0,
      utilities: 0,
      fun: 0,
    };

    for (const tool of ALL_SUPPORTED_TOOLS) {
      if (currentTool && tool.href === currentTool) continue;
      counts.all += 1;
      counts[tool.category] += 1;
    }

    return counts;
  }, [currentTool]);

  const shouldTruncate =
    !isExpanded &&
    !searchQuery.trim() &&
    activeCategory === "all" &&
    filteredTools.length > resolvedLimit;

  const visibleTools = useMemo(() => {
    if (!shouldTruncate) return filteredTools;
    const featuredFirst = [
      ...filteredTools.filter((t) => t.featured),
      ...filteredTools.filter((t) => !t.featured),
    ];
    return featuredFirst.slice(0, resolvedLimit);
  }, [filteredTools, shouldTruncate, resolvedLimit]);

  return (
    <section
      className={`st-root ${compact ? "st-compact" : ""} ${className}`}
      aria-label="Supported Instagram Tools"
    >
      <style dangerouslySetInnerHTML={{ __html: COMPONENT_STYLES }} />

      <div className="st-container">
        <div className="st-header">
          <div className="st-pill">
            <span className="st-pill-dot" />
            <span>{ALL_SUPPORTED_TOOLS.length}+ Free Creator Tools</span>
          </div>
          <h2 className="st-title">{title}</h2>
          {!compact && <p className="st-subtitle">{subtitle}</p>}
        </div>

        <div className="st-controls">
          {showSearch && (
            <div className="st-search-wrap">
              <span className="st-search-icon" aria-hidden="true">
                🔎
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isExpanded) setIsExpanded(true);
                }}
                placeholder="Search any tool (e.g., Reels, Shadowban, Kundli, DP, MP3)..."
                className="st-search-input"
                aria-label="Search tools"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="st-clear-btn"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="st-tabs" role="tablist" aria-label="Tool categories">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id !== "all") setIsExpanded(true);
                  }}
                  className={`st-tab ${isActive ? "st-tab-active" : ""}`}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="st-tab-count">{categoryCounts[cat.id]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {visibleTools.length > 0 ? (
          <div className="st-grid">
            {visibleTools.map((tool) => {
              const badgeStyle = tool.badge ? BADGE_STYLES[tool.badge] : null;

              return (
                <Link key={tool.href} href={tool.href} className="st-card">
                  <div className="st-card-top">
                    <div className="st-icon-box" aria-hidden="true">
                      {tool.icon}
                    </div>
                    <div className="st-card-meta">
                      {tool.badge && badgeStyle && (
                        <span
                          className="st-badge"
                          style={{
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.color,
                            borderColor: badgeStyle.border,
                          }}
                        >
                          {tool.badge}
                        </span>
                      )}
                      <span className="st-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </div>
                  </div>

                  <h3 className="st-card-title">{tool.name}</h3>
                  <p className="st-card-desc">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="st-empty">
            <p className="st-empty-title">
              No tool found for &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="st-empty-sub">
              Try searching with another keyword or reset the category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="st-reset-btn"
            >
              Show All Tools
            </button>
          </div>
        )}

        {filteredTools.length > resolvedLimit &&
          !searchQuery.trim() &&
          activeCategory === "all" && (
            <div className="st-footer">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="st-expand-btn"
              >
                {isExpanded ? (
                  <>
                    <span>Show Featured Tools Only</span>
                    <span aria-hidden="true">↑</span>
                  </>
                ) : (
                  <>
                    <span>
                      Explore All {filteredTools.length} Tools (+
                      {filteredTools.length - visibleTools.length} More)
                    </span>
                    <span aria-hidden="true">↓</span>
                  </>
                )}
              </button>
            </div>
          )}
      </div>
    </section>
  );
}

export default SupportedTools;
