"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import GlobalHeader from "./GlobalHeader";
import BottomNav from "./BottomNav";
import BackBar from "./BackBar";
import { navDepth } from "./nav-depth";
import { migrateOnce } from "@/lib/storage";

export const TAB_ROUTES = ["/", "/tools", "/history", "/settings"];
const FREE_PREFIXES = ["/admin", "/offline", "/s/"];

export type ShellKind = "tab" | "detail" | "free";
export function shellKindFor(path: string): ShellKind {
  const p = path.replace(/\/+$/, "") || "/";
  if (FREE_PREFIXES.some((x) => p === x.replace(/\/$/, "") || p.startsWith(x))) return "free";
  return TAB_ROUTES.includes(p) ? "tab" : "detail";
}

/** PRD §4.3 — ek `AppShell` root layout me. URLs same; koi folder move nahi. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    navDepth.value += 1;
  }, [path]);
  useEffect(() => { migrateOnce(); }, []);

  const kind = shellKindFor(path);
  if (kind === "free") return <>{children}</>;
  if (kind === "tab") {
    return (
      <>
        <GlobalHeader />
        <div className="shell-main shell-main--tab">{children}</div>
        <BottomNav />
      </>
    );
  }
  return (
    <>
      <BackBar />
      <div className="shell-main shell-main--detail">{children}</div>
    </>
  );
}
