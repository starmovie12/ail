"use client";
/** Download success feedback — particle burst + haptic (ResultCard.celebrate se). reduced-motion me band; haptic Prefs se. */
import { getPrefs } from "./storage";
import { playCoin } from "./retention";

export function haptic(ms = 12) {
  try { if (getPrefs().haptics) navigator.vibrate?.(ms); } catch { /* iOS Safari: nahi hota */ }
}

export function celebrate(x: number, y: number) {
  haptic();
  playCoin();
  if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 8; i++) {
    const p = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.6;
    const dist = 26 + Math.random() * 22;
    p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:5px;height:5px;border-radius:99px;pointer-events:none;z-index:99;background:linear-gradient(135deg,var(--c-cyan),var(--c-magenta));transition:transform 600ms cubic-bezier(.16,1,.3,1),opacity 600ms;`;
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`;
      p.style.opacity = "0";
    });
    setTimeout(() => p.remove(), 700);
  }
}

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
