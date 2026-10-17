"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PlatformTile } from "@/components/PlatformIcons";
import ToolIcon from "@/components/ToolIcon";
import { REGISTRY, titleForPath } from "@/lib/registry";
import { PLATFORMS } from "@/lib/platforms";
import { navDepth } from "./nav-depth";

const STATIC_TITLES: Record<string, string> = {
  "/how-to-download": "How to Download", "/blog": "Blog", "/about": "About Us", "/contact": "Contact",
  "/privacy-policy": "Privacy Policy", "/terms": "Terms of Service", "/dmca": "DMCA", "/quick-action": "Quick Action",
  "/batch-downloader": "Batch Downloader",
};

/** Back Bar (detail screens): ‹ Back + app/tool icon + naam. Header aur Bottom bar hide hote hain (PRD §4.1, §10.1). */
export default function BackBar() {
  const path = (usePathname() || "/").replace(/\/+$/, "") || "/";
  const router = useRouter();
  const [fallbackTitle, setFallbackTitle] = useState("");

  const staticTitle = STATIC_TITLES[path] ?? (path.startsWith("/blog/") ? "Blog" : path.startsWith("/coming-soon/") ? "Coming Soon" : undefined);
  const title = staticTitle ?? titleForPath(path) ?? fallbackTitle;

  // Registry me na ho to page ka <h1> / metadata title
  useEffect(() => {
    if (staticTitle || titleForPath(path)) return;
    const id = setTimeout(() => {
      const h1 = document.querySelector("main h1")?.textContent?.trim();
      setFallbackTitle(h1 || document.title.split(/[|·—]/)[0].trim() || "Back");
    }, 60);
    return () => clearTimeout(id);
  }, [path, staticTitle]);

  const platform = PLATFORMS.find((p) => p.route === path);
  const tool = REGISTRY.find((t) => t.href === path);
  const isToolish = Boolean(platform || tool || path.startsWith("/ai/"));

  function goBack() {
    if (navDepth.value > 0) { navDepth.value -= 1; router.back(); return; }
    router.push(isToolish ? "/tools" : "/"); // direct link se aaye to fallback
  }

  return (
    <header className="bb" role="banner">
      <div className="bb__in">
        <button type="button" className="bb__back" onClick={goBack} aria-label="Back">
          <ChevronLeft size={24} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <div className="bb__id">
          {platform ? (
            <PlatformTile name={platform.iconKey} size={34} showLabel={false} />
          ) : tool ? (
            <ToolIcon category={tool.category} size={34} />
          ) : null}
          {title && <span className="bb__title">{title}</span>}
        </div>
      </div>
    </header>
  );
}
