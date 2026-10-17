import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="container" style={{ padding: "120px 24px 140px", textAlign: "center", maxWidth: 640 }}>
        <p className="label intro-rise" style={{ color: "var(--gold-ink)" }}>404</p>
        <h1 className="intro-rise" style={{ fontSize: "var(--t-h2)", marginTop: 16, ["--dl" as string]: "100ms" }}>
          This page doesn&apos;t <em className="gilded">exist</em>.
        </h1>
        <p className="lead intro-rise" style={{ margin: "20px auto 0", ["--dl" as string]: "200ms" }}>
          The link may be old, or the page has moved. The bar on the home page still works on any Instagram link.
        </p>
        <div className="intro-rise" style={{ marginTop: 36, ["--dl" as string]: "300ms" }}>
          <Link href="/" className="btn btn-molten" style={{ height: 48, display: "inline-flex" }}>
            Back to the home page
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
