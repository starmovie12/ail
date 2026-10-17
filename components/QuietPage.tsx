import LegalFoot from "@/components/LegalFoot";

/** Quiet template for legal / info pages. */
export default function QuietPage({ title, updated, children }:
  { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <>
      <main className="container" style={{ padding: "24px 24px 48px", maxWidth: 780 }}>
        <h1 style={{ fontSize: "var(--t-h2)" }}>{title}</h1>
        {updated && <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 12 }}>Last updated: {updated}</p>}
        <div className="article" style={{ marginTop: 40 }}>{children}</div>
      </main>
      <LegalFoot />
    </>
  );
}
