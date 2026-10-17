import { Download, Wand2, BarChart3, Palette, Wrench, Flame, Globe2 } from "lucide-react";
import type { ToolItem } from "@/lib/registry";

/** Category ke hisaab se gradient tile + lucide vector icon (PRD §3.4) — emoji production UI me nahi. */
const CAT: Record<ToolItem["category"], { Icon: React.ElementType; g: string }> = {
  downloaders: { Icon: Download, g: "linear-gradient(135deg,#FF3D8B,#FF7A59)" },   // pink
  platforms:   { Icon: Globe2,   g: "linear-gradient(135deg,#FF3D8B,#FF7A59)" },
  ai:          { Icon: Wand2,    g: "linear-gradient(135deg,#7C3AED,#D946EF)" },   // violet
  analytics:   { Icon: BarChart3, g: "linear-gradient(135deg,#0EA5A4,#22E4FF)" },  // teal
  visual:      { Icon: Palette,  g: "linear-gradient(135deg,#FF7A3D,#F5B83D)" },   // orange
  utilities:   { Icon: Wrench,   g: "linear-gradient(135deg,#3B82F6,#6366F1)" },   // blue
  fun:         { Icon: Flame,    g: "linear-gradient(135deg,#10B981,#34D399)" },    // green
};

export const CATEGORY_ICON = Object.fromEntries(Object.entries(CAT).map(([k, v]) => [k, v.Icon])) as Record<ToolItem["category"], React.ElementType>;

export default function ToolIcon({ category, size = 56 }: { category: ToolItem["category"]; size?: number }) {
  const { Icon, g } = CAT[category] ?? CAT.utilities;
  return (
    <span className="ticon" aria-hidden="true" style={{ width: size, height: size, background: g, borderRadius: Math.round(size * 0.29) }}>
      <Icon size={Math.round(size * 0.46)} strokeWidth={2} />
    </span>
  );
}
