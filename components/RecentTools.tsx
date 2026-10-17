"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { TOOLS } from "@/lib/copy";
import { getRecentTools } from "@/lib/retention";

/** "Continue where you left off" row on the homepage — renders nothing on first visit. */
export default function RecentTools() {
  const [recent, setRecent] = useState<typeof TOOLS>([]);

  useEffect(() => {
    const tools = getRecentTools()
      .map((href) => TOOLS.find((t) => t.href === href))
      .filter((t): t is (typeof TOOLS)[number] => !!t)
      .slice(0, 4);
    setRecent(tools);
  }, []);

  if (recent.length === 0) return null;

  return (
    <div className="intro-rise" style={{ marginTop: "clamp(18px, 3vw, 28px)" }}>
      <span className="label" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--gold-ink)", marginBottom: 8, fontSize: "clamp(11px, 10px + .3vw, 12px)" }}>
        <History size={12} strokeWidth={1.5} /> Pick up where you left off
      </span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
        {recent.map((t) => (
          <Link key={t.href} href={t.href} className="chip" style={{ textDecoration: "none" }}>
            <t.Icon size={13} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} />
            {t.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
