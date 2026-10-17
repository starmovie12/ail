import type { Metadata } from "next";
import QuietPage from "@/components/QuietPage";

export const metadata: Metadata = { title: "Terms of Service — InstaGrab" };

export default function Page() {
  return (
    <QuietPage title="Terms of Service" updated="January 2026">
      <p>By using InstaGrab you agree to these terms.</p>
      <h2>Acceptable use</h2>
      <p>Download only content <strong>you own or have permission to use</strong>. Respect the rights of creators. You are solely responsible for how you use downloaded material.</p>
      <h2>What InstaGrab is</h2>
      <p>A technical tool that fetches publicly available media and text from Instagram's servers on your request. We host no content, claim no rights over any content, and are not affiliated with Instagram™ or Meta.</p>
      <h2>No warranty</h2>
      <p>The service is provided as-is. Instagram changes its systems frequently; downloads may fail from time to time while we patch.</p>
      <h2>Rate limits</h2>
      <p>Automated or excessive use may be throttled or blocked.</p>
      <h2>Takedowns</h2>
      <p>Rights holders can request removal assistance via our <a href="/dmca">DMCA page</a>.</p>
    </QuietPage>
  );
}
