"use client";
import { useEffect, useState } from "react";

/** Ad Frame (§9.11) — every ad lives inside a labeled hairline frame.
 *
 *  Wired to the Adsterra/Monetag native banner script. The vendor script fills
 *  exactly ONE container id per page, so the FIRST AdFrame mounted "claims"
 *  the ad: it renders the container and (re)injects the invoke script so
 *  client-side navigations get a fresh fill too. Every other AdFrame on the
 *  page renders NOTHING — no empty gold boxes cluttering the layout.
 *
 *  Pass `children` to drop a different ad unit (e.g. an Adsterra 300×250
 *  iframe banner) into a specific slot — child slots always render. */

const SCRIPT_SRC =
  "https://pl30307334.effectivecpmnetwork.com/5b1394bab6b1e0e9f59f9dc1686475d7/invoke.js";
const CONTAINER_ID = "container-5b1394bab6b1e0e9f59f9dc1686475d7";

let claimed = false; // which AdFrame instance (if any) owns CONTAINER_ID this page load

export default function AdFrame({ slotH = 110, children }: { slotH?: number; children?: React.ReactNode }) {
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (children || claimed) return; // caller supplied their own unit, or another AdFrame already claimed the ad
    claimed = true;
    setIsHost(true);
    return () => { claimed = false; }; // free the claim so the next page's AdFrame can host
  }, [children]);

  useEffect(() => {
    if (!isHost) return;
    // Re-inject per page view: the invoke script fills the container when it
    // executes, so SPA navigations need a fresh script element to refill.
    document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)?.remove();
    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = SCRIPT_SRC;
    document.body.appendChild(script);
  }, [isHost]);

  if (children) {
    return (
      <div className="ad-frame" style={{ ["--slot-h" as string]: `${slotH}px` }}>
        {children}
      </div>
    );
  }
  // Non-host frames vanish entirely — fewer, better ads beats empty boxes.
  if (!isHost) return null;
  return (
    <div className="ad-frame" style={{ ["--slot-h" as string]: `${slotH}px` }}>
      <div id={CONTAINER_ID} style={{ width: "100%", minHeight: slotH }} />
    </div>
  );
}
