import { Suspense } from "react";
import Link from "next/link";
import PlatformDownloader from "@/components/PlatformDownloader";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import LegalFoot from "@/components/LegalFoot";
import ToolIcon from "@/components/ToolIcon";
import { platformById, type PlatformId } from "@/lib/platforms";
import { visibleTools } from "@/lib/registry";
import { DEFAULT_FAQ, faqJsonLd, type QA } from "@/lib/seo";

/**
 * App page shell (PRD §10, §10.9, §17.1) — Back Bar AppShell se; yahan: PlatformDownloader (fold ke upar),
 * fold ke neeche SEO prose + FAQ + Related tools normal HTML me (JS-only hide nahi).
 * Purane SEO URLs jaise hain waise; Instagram preset + pill preselected.
 */
export default function PlatformPage({
  platform, pill, h1, lead, faq, children, self,
}: {
  platform: PlatformId;
  pill?: string;
  eyebrow?: string;
  h1: React.ReactNode;
  lead: string;
  faq?: QA[];
  children?: React.ReactNode;
  /** is page ka apna href (Related tools se hatane ke liye) */
  self?: string;
}) {
  const def = platformById(platform)!;
  const formats = def.pills.filter((p) => p.id !== "auto");
  const related = visibleTools.filter((t) => t.href !== self && t.href !== def.route && (platform === "instagram" ? t.category === "downloaders" : t.category === "platforms")).slice(0, 6);
  return (
    <>
      <JsonLd data={faqJsonLd(faq ?? DEFAULT_FAQ)} />
      <main>
        <section style={{ position: "relative", padding: "clamp(12px, 3vw, 24px) 0 clamp(24px, 5vw, 40px)" }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <Suspense fallback={null}>
              <PlatformDownloader platform={platform} presetPill={pill} h1={h1} lead={lead} />
            </Suspense>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <Reveal>
              <span className="label">Supported formats</span>
              <ul className="pp-formats">
                {formats.map((f) => <li key={f.id}>{f.label}</li>)}
              </ul>
            </Reveal>
          </div>
        </section>

        <HowItWorks />

        {children && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container"><Reveal><div className="article">{children}</div></Reveal></div>
          </section>
        )}

        <FAQ items={faq} />

        {related.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container">
              <span className="label">Related tools</span>
              <ul className="pp-related">
                {related.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href}><ToolIcon category={t.category} size={40} /><span>{t.name}</span></Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <LegalFoot />
      <style>{`
        .pp-formats { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
        .pp-formats li { padding: 8px 14px; border-radius: 999px; font-weight: 700; font-size: 14px; color: var(--gold-ink); background: rgb(var(--c-cyan-rgb) / .08); border: 1px solid var(--line-strong); }
        .pp-related { list-style: none; margin: 12px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .pp-related a { display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 12px; border-radius: 16px; text-decoration: none; color: var(--ink); font-weight: 600; background: var(--bg-surface); border: 1px solid var(--line); }
      `}</style>
    </>
  );
}
