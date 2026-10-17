import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Admin",
  // Keep the panel out of Google entirely.
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <>
      <Nav />
      <main className="container" style={{ padding: "72px 24px 96px", minHeight: "60vh" }}>
        <AdminPanel />
      </main>
      <Footer />
    </>
  );
}
