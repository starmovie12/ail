import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LangProvider } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-url";
import PwaRegister from "@/components/PwaRegister";
import InstallPrompt from "@/components/InstallPrompt";
import CommandPalette from "@/components/CommandPalette";
import OnboardingTour from "@/components/OnboardingTour";
import AppShell from "@/components/shell/AppShell";
import "./globals.css";
import "./shell.css";

const display = Fraunces({
  subsets: ["latin"], style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"], variable: "--font-display", display: "swap",
});
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "InstaGrab — Download anything from Instagram, beautifully",
    template: "%s · InstaGrab",
  },
  description:
    "Download Instagram reels, photos, stories and carousels in HD — plus the full caption and every hashtag, one click away. Free, no login, links never stored.",
  keywords: [
    "instagram downloader", "reels download", "instagram video downloader",
    "instagram story downloader", "instagram highlights downloader",
    "instagram profile picture downloader", "instagram caption extractor", "instagram hashtag extractor",
  ],
  openGraph: { siteName: "InstaGrab", type: "website" },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "InstaGrab", statusBarStyle: "black-translucent" },
  verification: {
    google: "qAW2AZhiMoIodGgJHNgUVgfEBJmoS9d0zNubWAZkgHE",
  },
};

export const viewport: Viewport = {
  // notch / home-bar ke liye (PRD §14.2) — env(safe-area-inset-*) shell.css me
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F6FF" },
    { media: "(prefers-color-scheme: dark)", color: "#050B24" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* FOUC-proof theme — runs before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ig-theme')||'dark';document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {/* Slow banner-style colour flow — fixed, behind everything, decorative only */}
        <div className="ambient-glow" aria-hidden="true">
          <span className="ambient-glow__blob ambient-glow__blob--a" />
          <span className="ambient-glow__blob ambient-glow__blob--b" />
          <span className="ambient-glow__blob ambient-glow__blob--c" />
          <span className="ambient-glow__blob ambient-glow__blob--d" />
        </div>
        <LangProvider><AppShell>{children}</AppShell></LangProvider>
        <PwaRegister />
        <InstallPrompt />
        <CommandPalette />
        <OnboardingTour />
        <Analytics />
        {/* Adsterra Social Bar — site-wide floating unit, no container needed.
            NOTE: the Popunder unit was removed on purpose — popunder scripts
            hijack the user's first click, which broke download buttons (and
            intrusive-ad signals also hurt Google ranking). Don't re-add it. */}
        <Script
          src="https://pl30280133.effectivecpmnetwork.com/0c/f9/53/0cf9534424ebc32da0ad62ff5cfd5888.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
