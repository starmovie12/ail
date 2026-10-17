"use client";
import { useEffect, useState } from "react";
import { Download, X, Share2 } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Centered, premium install modal (not a bottom sheet). Appears only on
 *  browsers that support PWA install, and only once until dismissed. Installing
 *  puts InstaGrab in the Android share sheet (manifest share_target). */
export default function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem("ig-install-dismissed") === "1") return; } catch {}
    if (window.matchMedia("(display-mode: standalone)").matches) return; // already installed
    const onBIP = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setTimeout(() => setOpen(true), 2500); // let the page settle first
    };
    window.addEventListener("beforeinstallprompt", onBIP as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", onBIP as EventListener);
  }, []);

  function dismiss() {
    setOpen(false);
    try { localStorage.setItem("ig-install-dismissed", "1"); } catch {}
  }
  async function install() {
    if (!evt) return;
    setOpen(false);
    try { await evt.prompt(); await evt.userChoice; } catch {}
    try { localStorage.setItem("ig-install-dismissed", "1"); } catch {}
    setEvt(null);
  }

  if (!open || !evt) return null;
  return (
    <div onClick={dismiss} role="dialog" aria-modal="true" style={{
      position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, background: "rgba(10,9,6,.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      animation: "fadeIn 240ms var(--ease-silk)",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{
        maxWidth: 400, width: "100%", padding: 28, textAlign: "center", position: "relative",
        animation: "popIn 300ms var(--ease-coin)",
      }}>
        <button onClick={dismiss} aria-label="Close" className="btn-icon" style={{ position: "absolute", top: 12, right: 12 }}>
          <X size={18} strokeWidth={1.5} />
        </button>
        <span className="medallion" style={{ margin: "0 auto" }}><Share2 size={24} strokeWidth={1.5} /></span>
        <h3 style={{ fontSize: 20, margin: "16px 0 8px" }}>Add InstaGrab to your Share menu</h3>
        <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)", marginBottom: 20 }}>
          Install the app and you can share any reel straight from Instagram — it opens right here with the download ready.
        </p>
        <button className="btn btn-molten" onClick={install} style={{ width: "100%", height: 48 }}>
          <Download size={18} strokeWidth={1.5} /> Install InstaGrab
        </button>
        <button onClick={dismiss} className="mono" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 12, marginTop: 12 }}>
          Maybe later
        </button>
      </div>
      <style jsx>{`
        @keyframes fadeIn{ from{ opacity:0; } to{ opacity:1; } }
        @keyframes popIn{ from{ opacity:0; transform:translateY(12px) scale(.96); } to{ opacity:1; transform:none; } }
      `}</style>
    </div>
  );
}
