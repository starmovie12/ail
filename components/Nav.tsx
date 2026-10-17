"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Crown,
  History,
  Settings,
  ShieldCheck,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguagePicker from "./LanguagePicker";
import { bumpStreak } from "@/lib/retention";

const LINKS = [
  { href: "/", label: "Super App" },
  { href: "/reels-downloader", label: "Reels" },
  { href: "/facebook-downloader", label: "Facebook" },
  { href: "/pinterest-downloader", label: "Pinterest" },
  { href: "/caption-extractor", label: "Captions" },
  { href: "/hashtag-extractor", label: "Hashtags" },
  { href: "/profile-viewer", label: "Profile" },
  { href: "/blog", label: "Blog" },
];

export type GrabHistoryItem = {
  id: string;
  shortcode: string;
  platform?: string;
  url: string;
  type?: string;
  caption?: string;
  author?: string;
  thumbnail?: string;
  timestamp: number;
};

/** Daily visit streak badge */
function StreakBadge() {
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    try {
      setStreak(bumpStreak());
    } catch {}
  }, []);
  if (streak < 2) return null;
  return (
    <span
      className="mono"
      title={`${streak}-day creator streak`}
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "var(--gold-ink)",
        background: "color-mix(in srgb, var(--gold-ink) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--gold-ink) 30%, transparent)",
        borderRadius: 999,
        padding: "5px 10px",
        whiteSpace: "nowrap",
      }}
    >
      🔥 {streak}
    </span>
  );
}

/** InstaGrab logo — dark tile, gradient border, viewfinder + download arrow */
function InstaGrabLogo() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
      style={{
        width: "clamp(34px, 20px + 3vw, 44px)",
        height: "clamp(34px, 20px + 3vw, 44px)",
        borderRadius: "clamp(10px, 6px + 1vw, 13px)",
        boxShadow: "0 4px 18px rgb(var(--c-violet-2-rgb) / 0.45)",
        flexShrink: 0,
      }}
    >
      <defs>
        <linearGradient id="ig_logo_stroke" x1="0" y1="44" x2="44" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22E4FF" />
          <stop offset="0.5" stopColor="#6366F1" />
          <stop offset="1" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="42" height="42" rx="12" fill="#050B24" stroke="url(#ig_logo_stroke)" strokeWidth="2" />
      {/* Viewfinder corners */}
      <path
        d="M12 17V14.5C12 13.12 13.12 12 14.5 12H17M27 12H29.5C30.88 12 32 13.12 32 14.5V17M32 27V29.5C32 30.88 30.88 32 29.5 32H27M17 32H14.5C13.12 32 12 30.88 12 29.5V27"
        stroke="url(#ig_logo_stroke)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Download arrow */}
      <path
        d="M22 16.5V26M22 26L18 22M22 26L26 22"
        stroke="url(#ig_logo_stroke)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Nav() {
  const path = usePathname();

  // Quick-Return Header State (Master Prompt v11 Step 2: Slide out on scroll down, slide in on 15px scroll up)
  const [headerHidden, setHeaderHidden] = useState(false);

  // Modals State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Settings State (Compatible with instagrab-main)
  const [sessionId, setSessionId] = useState("");
  const [cobaltInstance, setCobaltInstance] = useState("");
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // History + Undo + 2-Step Confirm State
  const [history, setHistory] = useState<GrabHistoryItem[]>([]);
  const [deletedBackup, setDeletedBackup] = useState<{
    item: GrabHistoryItem;
    index: number;
  } | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // 1. Load Settings & History + Listen for Global Custom Events
  const loadStoredData = () => {
    try {
      setSessionId(localStorage.getItem("instagrab_session_id") || "");
      setCobaltInstance(localStorage.getItem("instagrab_cobalt_instance") || "");
      const rawHistory = localStorage.getItem("instagrab_history");
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {}
  };

  useEffect(() => {
    loadStoredData();

    const handleOpenSettings = () => {
      loadStoredData();
      setShowSettingsModal(true);
    };
    const handleOpenHistory = () => {
      loadStoredData();
      setConfirmClearAll(false);
      setShowHistoryModal(true);
    };
    const handleHistoryUpdated = () => {
      loadStoredData();
    };

    window.addEventListener("omnigrab:open-settings", handleOpenSettings);
    window.addEventListener("omnigrab:open-history", handleOpenHistory);
    window.addEventListener("omnigrab:history-updated", handleHistoryUpdated);

    return () => {
      window.removeEventListener("omnigrab:open-settings", handleOpenSettings);
      window.removeEventListener("omnigrab:open-history", handleOpenHistory);
      window.removeEventListener("omnigrab:history-updated", handleHistoryUpdated);
    };
  }, []);

  // 2. Quick-Return Scroll Listener (15px upward threshold)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let upwardDelta = 0;

    const onScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY;

      if (currentY < 60) {
        setHeaderHidden(false);
        upwardDelta = 0;
      } else if (diff > 6) {
        setHeaderHidden(true);
        upwardDelta = 0;
      } else if (diff < 0) {
        upwardDelta += Math.abs(diff);
        if (upwardDelta >= 15) {
          setHeaderHidden(false);
        }
      }
      lastScrollY = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Save Settings Handler
  const handleSaveSettings = () => {
    try {
      localStorage.setItem("instagrab_session_id", sessionId.trim());
      localStorage.setItem("instagrab_cobalt_instance", cobaltInstance.trim());
      window.dispatchEvent(new CustomEvent("omnigrab:settings-updated"));
    } catch {}
    setSettingsSavedToast(true);
    setTimeout(() => {
      setSettingsSavedToast(false);
      setShowSettingsModal(false);
    }, 900);
  };

  // Single History Item Delete (With Undo Snackbar — Master Prompt v11)
  const handleDeleteSingleItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = history[index];
    if (!target) return;

    const updated = history.filter((_, idx) => idx !== index);
    setHistory(updated);
    setDeletedBackup({ item: target, index });

    try {
      localStorage.setItem("instagrab_history", JSON.stringify(updated));
    } catch {}
  };

  // Undo Single Delete
  const handleUndoDelete = () => {
    if (!deletedBackup) return;
    const restored = [...history];
    restored.splice(deletedBackup.index, 0, deletedBackup.item);
    setHistory(restored);
    setDeletedBackup(null);
    try {
      localStorage.setItem("instagrab_history", JSON.stringify(restored));
    } catch {}
  };

  // Two-Step Destructive Clear All History (Isolated at Bottom of Modal)
  const handleClearAllHistory = () => {
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      return;
    }
    setHistory([]);
    setConfirmClearAll(false);
    setDeletedBackup(null);
    try {
      localStorage.removeItem("instagrab_history");
    } catch {}
  };

  // Trigger Re-Grab from History
  const handleSelectHistoryItem = (item: GrabHistoryItem) => {
    setShowHistoryModal(false);
    window.dispatchEvent(
      new CustomEvent("omnigrab:grab-url", { detail: { url: item.url } })
    );
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 80,
          height: "clamp(52px, 36px + 4.2vw, 68px)",
          background: "color-mix(in srgb, var(--bg) 86%, transparent)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--line)",
          transform: headerHidden ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            height: "100%",
          }}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            aria-label="InstaGrab home"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(8px, 4px + 1vw, 12px)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <InstaGrabLogo />
            <span
              style={{
                fontWeight: 800,
                fontSize: "clamp(20px, 12px + 1.8vw, 26px)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
              }}
            >
              Insta
              <span
                style={{
                  background: "var(--gradient-brand)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Grab
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="nav-desktop"
            aria-label="Primary Navigation"
            style={{ display: "flex", gap: 12, margin: "0 auto" }}
          >
            {LINKS.map((l) => {
              const isActive = path === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--gold-ink)" : "var(--ink-2)",
                    padding: "6px 8px",
                    borderRadius: 8,
                    transition: "color 150ms ease, background 150ms ease",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar: crown (history) + settings gear */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
            <span className="nav-desktop-only">
              <StreakBadge />
              <LanguagePicker />
              <ThemeToggle />
            </span>

            <button
              type="button"
              onClick={() => {
                loadStoredData();
                setConfirmClearAll(false);
                setShowHistoryModal(true);
              }}
              aria-label="Recent grabs"
              title="Recent Grabs"
              style={{
                position: "relative",
                width: "clamp(40px, 28px + 2.4vw, 46px)",
                height: "clamp(40px, 28px + 2.4vw, 46px)",
                borderRadius: "clamp(11px, 8px + .6vw, 14px)",
                background: "color-mix(in srgb, var(--gold-ink) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--gold-ink) 26%, transparent)",
                color: "var(--gold-ink)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Crown size={22} strokeWidth={2} fill="currentColor" fillOpacity={0.9} />
              {history.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "var(--gradient-brand)",
                    color: "var(--on-accent)",
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 999,
                    padding: "1px 5px",
                    lineHeight: 1.2,
                  }}
                >
                  {history.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                loadStoredData();
                setShowSettingsModal(true);
              }}
              aria-label="Settings"
              title="Settings"
              style={{
                width: "clamp(40px, 28px + 2.4vw, 46px)",
                height: "clamp(40px, 28px + 2.4vw, 46px)",
                borderRadius: "clamp(11px, 8px + .6vw, 14px)",
                background: "transparent",
                border: "none",
                color: "var(--ink-2)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Settings size={22} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <style jsx>{`
          .nav-desktop-only {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          @media (max-width: 1023px) {
            .nav-desktop,
            .nav-desktop-only {
              display: none !important;
            }
          }
          @media (min-width: 1024px) {
            .nav-mobile-only {
              display: none !important;
            }
          }
        `}</style>
      </header>

      {/* Settings Modal (Session ID & Cobalt Instance — from instagrab-main) */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 11, 36, 0.72)",
            backdropFilter: "blur(10px)",
            zIndex: 130,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 480,
              maxHeight: "88vh",
              overflowY: "auto",
              padding: 24,
              color: "var(--ink)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.65)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  margin: 0,
                }}
              >
                <Settings size={20} color="var(--gold-ink)" />
                <span>InstaGrab Settings</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                aria-label="Close settings"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--ink-2)",
                  cursor: "pointer",
                  padding: 6,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick navigation + language/theme (phones — the header stays minimal) */}
            <div className="nav-mobile-only" style={{ marginBottom: 20 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink-2)",
                  marginBottom: 10,
                }}
              >
                Quick Navigation
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setShowSettingsModal(false)}
                    style={{
                      textDecoration: "none",
                      padding: "9px 14px",
                      borderRadius: 999,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: path === l.href ? "var(--gold-ink)" : "var(--ink)",
                      background: "var(--surface-2)",
                      border: path === l.href ? "1px solid color-mix(in srgb, var(--gold-ink) 55%, transparent)" : "1px solid var(--line)",
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                <LanguagePicker />
                <ThemeToggle />
              </div>
              <div style={{ height: 1, background: "var(--line)", marginTop: 16 }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13.5,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: "var(--ink)",
                }}
              >
                Instagram Session ID (Optional)
              </label>
              <input
                type="password"
                placeholder="e.g. 54321%3ABcD1234..."
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                style={{
                  width: "100%",
                  height: 46,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 10,
                  padding: "0 14px",
                  color: "var(--ink)",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <p
                style={{
                  fontSize: 12,
                  color: "var(--ink-2)",
                  marginTop: 6,
                  lineHeight: 1.45,
                }}
              >
                <ShieldCheck
                  size={13}
                  color="var(--gold-ink)"
                  style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                />
                Saved strictly in your browser. Lets you grab stories/posts from accounts you follow and bypasses public rate-limits.
              </p>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13.5,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: "var(--ink)",
                }}
              >
                Custom Cobalt Instance URL (Optional)
              </label>
              <input
                type="url"
                placeholder="e.g. https://cobalt.yourdomain.com"
                value={cobaltInstance}
                onChange={(e) => setCobaltInstance(e.target.value)}
                style={{
                  width: "100%",
                  height: 46,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 10,
                  padding: "0 14px",
                  color: "var(--ink)",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <p
                style={{
                  fontSize: 12,
                  color: "var(--ink-2)",
                  marginTop: 6,
                  lineHeight: 1.45,
                }}
              >
                Add a self-hosted Cobalt endpoint as an extra multi-platform fallback resolver.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 12,
                border: "none",
                background: "var(--gradient-button)",
                color: "var(--on-accent)",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Sparkles size={16} />
              <span>{settingsSavedToast ? "Saved! ✓" : "Save Preferences"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Grabs History Modal (With Undo Snackbar & Isolated 2-Step Clear All) */}
      {showHistoryModal && (
        <div
          onClick={() => setShowHistoryModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 11, 36, 0.72)",
            backdropFilter: "blur(10px)",
            zIndex: 130,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 520,
              maxHeight: "86vh",
              padding: 22,
              color: "var(--ink)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.65)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 10,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  margin: 0,
                }}
              >
                <History size={20} color="var(--gold-ink)" />
                <span>Recent Grabs ({history.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                aria-label="Close history"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--ink-2)",
                  cursor: "pointer",
                  padding: 6,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Undo Snackbar inside Modal when a single item is deleted */}
            {deletedBackup && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "color-mix(in srgb, var(--c-magenta) 18%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--c-magenta) 45%, transparent)",
                  fontSize: 13,
                }}
              >
                <span>Removed @{deletedBackup.item.author || "item"} from history</span>
                <button
                  type="button"
                  onClick={handleUndoDelete}
                  style={{
                    background: "var(--c-cyan)",
                    color: "var(--on-accent)",
                    border: "none",
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <RotateCcw size={13} />
                  <span>UNDO</span>
                </button>
              </div>
            )}

            {history.length === 0 ? (
              <p
                style={{
                  color: "var(--ink-2)",
                  textAlign: "center",
                  padding: "28px 12px",
                  fontSize: 14,
                }}
              >
                No recent grabs yet. Paste any Instagram, Facebook, Pinterest or X link in the box to start!
              </p>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {history.map((item, idx) => (
                    <div
                      key={`${item.id}-${item.timestamp}-${idx}`}
                      onClick={() => handleSelectHistoryItem(item)}
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--line)",
                        borderRadius: 14,
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt=""
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 9,
                              objectFit: "cover",
                              background: "var(--surface-2)",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 9,
                              background: "var(--gradient-brand)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: 12,
                              color: "var(--on-accent)",
                              flexShrink: 0,
                            }}
                          >
                            {item.platform === "facebook" ? "FB" : "IG"}
                          </div>
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: "var(--ink)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            @{item.author || "media_post"}
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>
                            {(item.platform || "instagram").toUpperCase()} •{" "}
                            {item.type || "media"} •{" "}
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          aria-label="Reload link"
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 9,
                            background: "color-mix(in srgb, var(--gold-ink) 12%, transparent)",
                            border: "1px solid color-mix(in srgb, var(--gold-ink) 30%, transparent)",
                            color: "var(--gold-ink)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Download size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSingleItem(idx, e)}
                          aria-label="Remove item"
                          title="Remove item (Undo available)"
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 9,
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#F87171",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Isolated Danger Zone at Bottom of History Modal (Master Prompt v11 Rule) */}
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 12,
                    borderTop: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                    Stored locally on your device
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    style={{
                      minHeight: 40,
                      padding: "0 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(239, 68, 68, 0.45)",
                      background: confirmClearAll ? "#EF4444" : "transparent",
                      color: confirmClearAll ? "#FFFFFF" : "#F87171",
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {confirmClearAll
                      ? "⚠️ Tap Again to Confirm Clear All"
                      : "🗑️ Clear All History"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
