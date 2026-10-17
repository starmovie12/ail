import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff, History, ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "You're offline | InstaGrab",
  description: "No connection right now — your saved history is still here.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <section style={{ padding: "110px 0 90px", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: 560 }}>
            <span className="medallion" style={{ margin: "0 auto 20px", color: "var(--warn)" }}>
              <WifiOff size={26} strokeWidth={1.5} />
            </span>
            <h1 style={{ fontSize: "var(--t-h2)" }}>You&apos;re <em className="gilded">offline</em>.</h1>
            <p className="lead" style={{ margin: "18px auto 0" }}>
              Downloads need the internet — but everything already saved on this device is still yours.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
              <Link href="/history" className="btn btn-molten" style={{ textDecoration: "none" }}>
                <History size={16} strokeWidth={1.5} /> Open download history
              </Link>
              <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>
                Try again <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
            </div>
            <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 28, lineHeight: 1.7 }}>
              Tip: the on-device studio tools (resizer, compressor, filters, collage) work offline
              once their pages have been visited before.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
