import Link from "next/link";
import { CircleHelp } from "lucide-react";

/** PRD §7.2 — textbox card ke theek niche, full-width outline (neon border), 52px. */
export default function HowToButton() {
  return (
    <Link href="/how-to-download" className="howto">
      <CircleHelp size={20} strokeWidth={2} aria-hidden="true" />
      <span>How to Download</span>
    </Link>
  );
}
