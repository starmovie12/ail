import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { PlatformTile } from "@/components/PlatformIcons";
import { PLATFORMS, type PlatformId } from "@/lib/platforms";

/** PRD §7.3 — Tools & Platforms: 8 tiles, is order me. Sirf wo apps jinka backend chalta hai. */
const ORDER: PlatformId[] = ["instagram", "facebook", "youtube", "tiktok", "pinterest", "x", "threads"];

export default function HomeToolsGrid() {
  const apps = ORDER.map((id) => PLATFORMS.find((p) => p.id === id)!).filter(Boolean);
  return (
    <section className="htg" aria-labelledby="htg-title">
      <div className="htg__head">
        <h2 id="htg-title">Tools &amp; Platforms</h2>
        <Link href="/tools" className="htg__all">View All <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" /></Link>
      </div>
      <ul className="htg__grid">
        {apps.map((p) => (
          <li key={p.id}>
            <Link href={p.route} className="htg__tile">
              <PlatformTile name={p.iconKey} size={56} showLabel={false} withStyles />
              <span className="htg__name">{p.name}</span>
              <span className="htg__sub">{p.tagline}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/tools" className="htg__tile">
            <span className="htg__all-ico" aria-hidden="true"><LayoutGrid size={28} strokeWidth={2} /></span>
            <span className="htg__name">All Tools</span>
            <span className="htg__sub">Everything in one place</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
