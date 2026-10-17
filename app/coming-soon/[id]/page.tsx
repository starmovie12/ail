import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatformTile } from "@/components/PlatformIcons";
import LegalFoot from "@/components/LegalFoot";
import { PLATFORMS, SOON_PLATFORMS, soonById } from "@/lib/platforms";

export const dynamicParams = false;
export function generateStaticParams() { return SOON_PLATFORMS.map((p) => ({ id: p.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = soonById(id);
  return { title: p ? `${p.name} support coming soon | InstaGrab` : "Coming soon", robots: { index: false, follow: false } };
}

/** PRD §7.6.9 — backend nahi wale apps ka link paste karne par: kabhi dead-end nahi. Link yahan save/show nahi hota. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = soonById(id);
  if (!p) notFound();
  return (
    <>
      <main className="container" style={{ maxWidth: 640, padding: "32px var(--gutter) 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><PlatformTile name={p.iconKey} size={72} showLabel={false} /></div>
        <h1 style={{ fontSize: "clamp(1.5rem, 1.2rem + 1.6vw, 2.2rem)", margin: "16px 0 8px" }}><em className="gilded">{p.name}</em> support jald aa raha hai</h1>
        <p style={{ color: "var(--ink-2)" }}>Abhi hum in apps ke liye kaam karte hain:</p>
        <ul style={{ listStyle: "none", padding: 0, margin: "18px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))", gap: 14 }}>
          {PLATFORMS.map((a) => (
            <li key={a.id}>
              <Link href={a.route} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", color: "var(--ink)", fontWeight: 700, fontSize: 13, minHeight: 44 }}>
                <PlatformTile name={a.iconKey} size={56} showLabel={false} />{a.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", minHeight: 48, padding: "0 22px", borderRadius: 999, fontWeight: 700, textDecoration: "none", color: "var(--ink)", background: "var(--bg-surface)", border: "1px solid var(--line-strong)" }}>
          Is app ki priority badhaane ke liye batayein
        </Link>
      </main>
      <LegalFoot />
    </>
  );
}
