import Nav from "./Nav";
import Footer from "./Footer";

/** Quiet template for legal / info pages. */
export default function QuietPage({ title, updated, children }:
  { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="container" style={{ padding: "80px 24px 96px", maxWidth: 780 }}>
        <h1 style={{ fontSize: "var(--t-h2)" }}>{title}</h1>
        {updated && <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 12 }}>Last updated: {updated}</p>}
        <div className="article" style={{ marginTop: 40 }}>{children}</div>
      </main>
      <Footer />
    </>
  );
}
