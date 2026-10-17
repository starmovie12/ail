"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link2, Sparkles, Search, X, ArrowRight } from "lucide-react";

const KEY = "ig.tourDone";

const STEPS = [
  {
    Icon: Link2,
    title: "One bar, everything",
    body: "Paste any Instagram link — reel, photo, story — or just a @username. The golden bar figures out the rest.",
  },
  {
    Icon: Sparkles,
    title: "AI that speaks Hinglish",
    body: "Captions, bios, reel scripts and hooks — generated in English, हिन्दी or full desi Hinglish. Nobody else does this.",
  },
  {
    Icon: Search,
    title: "80+ tools, one shortcut",
    body: "Press Ctrl+K (or the gold button, bottom-right) to jump to any tool in a second. Your recent tools stay on top.",
  },
];

/** I7 — 3-step first-visit tour. Shows once on the homepage, fully skippable. */
export default function OnboardingTour() {
  const pathname = usePathname();
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (!localStorage.getItem(KEY)) {
        const t = setTimeout(() => setStep(0), 1200);
        return () => clearTimeout(t);
      }
    } catch { /* storage unavailable — skip the tour */ }
  }, [pathname]);

  function finish() {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setStep(-1);
  }

  if (step < 0 || pathname !== "/") return null;
  const s = STEPS[step];

  return (
    <div onClick={finish} role="dialog" aria-modal="true" aria-label="Welcome tour"
      style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(10,9,6,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="card intro-rise"
        style={{ width: "100%", maxWidth: 400, padding: 28, textAlign: "center", position: "relative" }}>
        <button className="btn-icon" onClick={finish} aria-label="Skip tour"
          style={{ position: "absolute", top: 12, right: 12 }}>
          <X size={16} strokeWidth={1.5} />
        </button>
        <span className="medallion" style={{ margin: "0 auto 16px" }}><s.Icon size={24} strokeWidth={1.5} /></span>
        <b style={{ display: "block", fontSize: 19, marginBottom: 8 }}>{s.title}</b>
        <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)", lineHeight: 1.6 }}>{s.body}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
          <span style={{ display: "flex", gap: 6 }}>
            {STEPS.map((_, i) => (
              <span key={i} aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 99, background: i === step ? "var(--molten)" : "var(--line-strong, var(--line))" }} />
            ))}
          </span>
          <span style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={finish} style={{ fontSize: 13 }}>Skip</button>
            <button className="btn btn-molten" onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : finish())} style={{ fontSize: 13 }}>
              {step < STEPS.length - 1 ? <>Next <ArrowRight size={14} strokeWidth={1.75} /></> : "Let's go ✨"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
