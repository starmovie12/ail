import type { Metadata } from "next";
import QuietPage from "@/components/QuietPage";

export const metadata: Metadata = { title: "Contact — InstaGrab" };

export default function Page() {
  return (
    <QuietPage title="Contact">
      <p>For support, feedback, legal notices or partnership queries:</p>
      <p><a href="mailto:starmovienight@gmail.com" className="mono" style={{ color: "var(--gold-ink)" }}>starmovienight@gmail.com</a></p>
      <p>We usually reply within 72 hours. For takedown requests, include the content URL and proof of ownership — see the <a href="/dmca">DMCA page</a>.</p>
    </QuietPage>
  );
}
