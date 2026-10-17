"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { TOOLS } from "@/lib/copy";

/** H5 — deterministic daily spotlight: same tool for everyone all day, rotates at local midnight. */
export default function ToolOfTheDay() {
  const [tool, setTool] = useState<(typeof TOOLS)[number] | null>(null);

  useEffect(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000);
    setTool(TOOLS[dayOfYear % TOOLS.length]);
  }, []);

  if (!tool) return null;

  return (
    <Link href={tool.href} className="card" style={{
      display: "flex", alignItems: "center", gap: "clamp(10px, 8px + .6vw, 16px)", padding: "clamp(10px, 7px + 1vw, 16px) clamp(12px, 8px + 1vw, 20px)", textDecoration: "none",
      borderColor: "var(--gold-300)", maxWidth: 720, margin: "28px auto 0",
    }}>
      <span className="medallion" style={{ flexShrink: 0 }}><tool.Icon size={22} strokeWidth={1.5} /></span>
      <span style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
        <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold-ink)", fontSize: 11 }}>
          <Sparkles size={10} strokeWidth={1.5} /> Tool of the day
        </span>
        <b style={{ display: "block", fontSize: "clamp(14px, 13px + .3vw, 15px)", color: "var(--ink)", marginTop: 2 }}>{tool.title}</b>
        <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.desc}</span>
      </span>
      <ArrowRight size={18} strokeWidth={1.5} style={{ color: "var(--gold-ink)", flexShrink: 0 }} />
    </Link>
  );
}
