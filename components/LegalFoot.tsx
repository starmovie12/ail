import Link from "next/link";
import { BRAND } from "@/lib/brand";

/** Detail pages ke ant me chhoti disclaimer + legal links (purane Footer ki jagah — PRD §17.4). */
export default function LegalFoot() {
  return (
    <footer className="legalfoot">
      <p>{BRAND.disclaimer}</p>
      <nav aria-label="Legal">
        <Link href="/how-to-download">How to Download</Link>
        <Link href="/privacy-policy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/dmca">DMCA</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </footer>
  );
}
