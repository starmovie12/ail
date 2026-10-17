"use client";
import { useEffect } from "react";

/** Registers the service worker so the site is installable (and can appear in
 *  the Android share sheet via the manifest's share_target). No-op if the
 *  browser doesn't support service workers. */
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);
  return null;
}
