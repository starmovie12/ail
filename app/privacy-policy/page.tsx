import type { Metadata } from "next";
import QuietPage from "@/components/QuietPage";

export const metadata: Metadata = { title: "Privacy Policy — InstaGrab" };

export default function Page() {
  return (
    <QuietPage title="Privacy Policy" updated="January 2026">
      <p>InstaGrab is built to know as little about you as possible.</p>
      <h2>What we process</h2>
      <p>When you paste an Instagram link, it is sent to our server, used once to fetch the public media and text, and discarded. <strong>Links are never written to a database.</strong> We keep no download history and have no user accounts.</p>
      <h2>What we log</h2>
      <p>Standard, short-lived server logs (IP address, timestamp, status code) for abuse prevention and rate limiting. These rotate automatically.</p>
      <h2>Cookies &amp; ads</h2>
      <p>We set one localStorage key for your theme preference. Advertising partners may set their own cookies subject to their policies; ads are clearly labeled <em>Sponsored</em>.</p>
      <h2>Your content</h2>
      <p>We host nothing. Media is streamed from Instagram's CDN directly to your device.</p>
      <h2>Contact</h2>
      <p>Questions: see the <a href="/contact">contact page</a>.</p>
    </QuietPage>
  );
}
