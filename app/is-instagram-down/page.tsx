import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import IgDownChecker from "@/components/IgDownChecker";

export const metadata: Metadata = {
  title: "Is Instagram Down Right Now? — Live Status Check | InstaGrab",
  description:
    "Check if Instagram is down right now. Live server status check with response time — find out in seconds whether it's an outage or just your connection.",
  alternates: { canonical: "/is-instagram-down" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Instagram status"
      h1={<>Is Instagram <em className="gilded">down</em> — or is it just you?</>}
      lead="We ping Instagram's servers live and tell you in seconds whether it's an outage or your connection."
      tool={<IgDownChecker />}
      faq={[
        { q: "How does the check work?", a: "Our server pings Instagram's web and CDN endpoints and measures the response. If Instagram's servers answer, they're up — and your problem is local (connection, app cache, or a regional issue)." },
        { q: "Instagram is up but not working for me — why?", a: "Try in order: force-close and reopen the app, switch between Wi-Fi and mobile data, clear the app cache (Android), and update the app. Account-specific action blocks can also look like outages." },
        { q: "How long do Instagram outages last?", a: "Most major outages resolve within 30–90 minutes. There's nothing to fix on your side — don't reinstall the app or change your password mid-outage." },
        { q: "Does this check my account status?", a: "No — it checks Instagram's servers only. If your account specifically is restricted or action-blocked, the servers will look fine here while the app misbehaves." },
      ]}
    >
      <h2>Outage or just you?</h2>
      <p>When feeds stop loading, the first question is always the same. This page answers it with a live probe of Instagram&apos;s servers — if they respond, the problem is on your side; if they don&apos;t, it&apos;s a real outage and waiting is the only fix.</p>
      <h2>What to do during an outage</h2>
      <p>Nothing — genuinely. Don&apos;t reinstall, don&apos;t reset your password, don&apos;t log out (you may struggle to log back in mid-outage). Check back here, and post when it recovers: reach is often unusually good in the first hour after an outage as everyone floods back.</p>
      <h2>What to do when it&apos;s just you</h2>
      <p>Force-close the app, toggle between Wi-Fi and data, clear the cache on Android, and make sure the app is updated. Still broken? Instagram sometimes rolls out breaking changes region-by-region — the web version at instagram.com is a good fallback test.</p>
    </SimpleToolLanding>
  );
}
