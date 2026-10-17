import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

export type Badge = "Signature" | "New" | "Hot" | "World-first";

export type Tool = {
  href: string; title: string; desc: string;
  Icon: React.ElementType; signature?: boolean; badge?: Badge;
};

const BADGE_STYLE: Record<Badge, React.CSSProperties> = {
  Signature: { color: "var(--gold-ink)", background: "color-mix(in srgb, var(--gold-ink) 12%, transparent)", borderColor: "var(--line)" },
  New: { color: "var(--gold-ink)", background: "color-mix(in srgb, var(--gold-300) 22%, transparent)", borderColor: "var(--gold-300)" },
  Hot: { color: "var(--on-accent)", background: "var(--molten)", borderColor: "transparent" },
  "World-first": { color: "var(--on-accent)", background: "linear-gradient(100deg, var(--c-sky), var(--c-magenta))", borderColor: "transparent" },
};

export function ToolBadge({ badge }: { badge: Badge }) {
  return (
    <span className="label" style={{
      borderStyle: "solid", borderWidth: 1, borderRadius: 999, padding: "4px 10px", fontSize: 10,
      ...BADGE_STYLE[badge],
    }}>{badge}</span>
  );
}

export default function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const badge = tool.badge ?? (tool.signature ? "Signature" : undefined);
  return (
    <Reveal index={index}>
      <Link href={tool.href} className="card tool-card">
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="medallion"><tool.Icon size={24} strokeWidth={1.5} /></span>
          {badge && <ToolBadge badge={badge} />}
        </span>
        <span>
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>{tool.title}</h3>
          <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{tool.desc}</p>
        </span>
        <span className="arrow" style={{ color: "var(--gold-ink)", display: "inline-flex" }}>
          <ArrowRight size={20} strokeWidth={1.5} />
        </span>
      </Link>
    </Reveal>
  );
}
