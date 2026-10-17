import type { Metadata } from "next";
import QuietPage from "@/components/QuietPage";

export const metadata: Metadata = { title: "DMCA — InstaGrab" };

export default function Page() {
  return (
    <QuietPage title="DMCA & Content Removal" updated="January 2026">
      <p>InstaGrab does not host, store or index any media. Every file is fetched live from Instagram's own servers at the user's request and streamed directly to them. There is nothing on our servers to take down.</p>
      <h2>If your content is being misused</h2>
      <p>The effective remedies are: (1) report the misuse to Instagram, which controls the source; (2) set your account to private, which immediately stops all public fetching including ours.</p>
      <h2>Formal notices</h2>
      <p>If you believe InstaGrab facilitates infringement of your rights, send a notice with the content URL, proof of ownership and your contact details via the <a href="/contact">contact page</a>. We respond within 72 hours.</p>
    </QuietPage>
  );
}
