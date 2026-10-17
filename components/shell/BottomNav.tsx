"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, History, Settings } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/tools", label: "Tools", Icon: LayoutGrid },
  { href: "/history", label: "History", Icon: History },
  { href: "/settings", label: "Settings", Icon: Settings },
] as const;

/** Keyboard khulne par bar hide (visualViewport 150px+ ghate, ya input focus) — PRD §6. */
function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    let focused = false;
    let vvOpen = false;
    const apply = () => setOpen(focused || vvOpen);
    const onVv = () => { vvOpen = vv ? window.innerHeight - vv.height > 150 : false; apply(); };
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !["checkbox", "radio", "button", "submit", "range"].includes((el as HTMLInputElement).type);
    const onIn = (e: FocusEvent) => { if (isField(e.target) && window.matchMedia("(max-width: 1023px)").matches) { focused = true; apply(); } };
    const onOut = () => { focused = false; apply(); };
    vv?.addEventListener("resize", onVv);
    window.addEventListener("focusin", onIn);
    window.addEventListener("focusout", onOut);
    return () => { vv?.removeEventListener("resize", onVv); window.removeEventListener("focusin", onIn); window.removeEventListener("focusout", onOut); };
  }, []);
  return open;
}

export default function BottomNav() {
  const path = usePathname() || "/";
  const hidden = useKeyboardOpen();
  return (
    <nav className="bn" aria-label="Primary" data-hidden={hidden ? "true" : "false"}>
      <div className="bn__in">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href} className="bn__item" aria-current={active ? "page" : undefined}>
              <Icon strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
