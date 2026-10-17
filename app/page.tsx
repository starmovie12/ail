import type { Metadata } from "next";
import Link from "next/link";
import { TextQuote, Download, GalleryHorizontalEnd, ShieldCheck } from "lucide-react";
import Nav from "@/components/Nav";
import InstallAppButton from "@/components/InstallAppButton";
import Footer from "@/components/Footer";
import GoldenBar from "@/components/GoldenBar";
import { ToolsAutoSupported } from "@/components/PlatformIcons";
import HeroBanner from "@/components/HeroBanner";
import TrustFootBar from "@/components/TrustFootBar";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import AdFrame from "@/components/AdFrame";
import ToolCard from "@/components/ToolCard";
import RecentTools from "@/components/RecentTools";
import ToolOfTheDay from "@/components/ToolOfTheDay";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { TOOL_GROUPS, QUARTET } from "@/lib/copy";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { DEFAULT_FAQ, faqJsonLd, webAppJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "InstaGrab — Instagram Reels, Story, Caption & Hashtag Downloader",
  description:
    "Free Instagram downloader for reels, photos, stories and carousels in HD — plus the full caption and every hashtag. No login. Links never stored.",
  alternates: {
    canonical: "/",
  },
};

const QUARTET_ICONS: Record<string, React.ElementType> = {
  TextQuote,
  Download,
  GalleryHorizontalEnd,
  ShieldCheck,
};

export default function Home() {
  const featuredGuides = BLOG_POSTS.slice(0, 6);

  return (
    <>
      <JsonLd data={webAppJsonLd()} />
      <JsonLd data={faqJsonLd(DEFAULT_FAQ)} />
      <Nav />
      <main>
        {/* ── Hero: install card → banner → paste box (neon) ── */}
        <section style={{ position: "relative", padding: "0 0 clamp(28px, 5vw, 48px)", overflow: "hidden" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 900,
              maxWidth: "100%",
              height: 600,
              pointerEvents: "none",
              background: "radial-gradient(ellipse at center, rgb(var(--c-violet-2-rgb) / .16), transparent 65%)",
            }}
          />
          <div className="container" style={{ position: "relative", maxWidth: 800 }}>
            <InstallAppButton variant="card" />
            <HeroBanner />
            <div style={{ marginTop: "clamp(10px, 6px + 1vw, 16px)" }}>
              <GoldenBar variant="neon" buttonText="Grab Media" footer={<><ToolsAutoSupported /><TrustFootBar /></>} />
            </div>
            <RecentTools />
            <ToolOfTheDay />
          </div>
        </section>

        {/* ── Feature quartet ── */}
        <section className="section section--first">
          <div className="container">
            <div className="grid-quartet">
              {QUARTET.map((f, i) => {
                const Icon = QUARTET_ICONS[f.icon];
                return (
                  <Reveal key={f.t} index={i}>
                    <div
                      className="card feature-card"
                      style={{
                        borderColor: f.signature ? "var(--gold-300)" : undefined,
                      }}
                    >
                      <span className="medallion"><Icon size={24} strokeWidth={1.5} /></span>
                      <h3>{f.t}</h3>
                      <p>{f.d}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* ── Focused Core Tools Grid ── */}
        <section id="tools" className="section" style={{ paddingTop: 0 }}>
          {/* "View All →" (ToolsAutoSupported) is anchor par aata hai; id="tools" pehle jaisa rakha */}
          <div id="all-tools" className="container">
            <Reveal>
              <span className="label">Core Toolkit</span>
              <h2 style={{ marginTop: 12, marginBottom: 8 }}>One bar, every core extractor.</h2>
              <p className="lead" style={{ marginBottom: "clamp(24px, 4vw, 40px)" }}>
                Download HD media, extract captions and hashtags, and view public profiles anonymously.
              </p>
            </Reveal>
            {TOOL_GROUPS.map((group) => (
              <div key={group.heading} style={{ marginBottom: "clamp(32px, 5vw, 48px)" }}>
                <Reveal>
                  <span className="label" style={{ display: "block", marginBottom: "clamp(14px, 3vw, 20px)", color: "var(--gold-ink)" }}>
                    {group.heading}
                  </span>
                </Reveal>
                <div className="grid-tools">
                  {group.tools.map((t, i) => <ToolCard key={t.href} tool={t} index={i} />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Direct Crawl Links to Creator Blog Guides (Fixes "Discovered - currently not indexed") ── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <span className="label">Creator Guides</span>
              <h2 style={{ marginTop: 12, marginBottom: 8 }}>Instagram growth &amp; hashtag research guides</h2>
              <p className="lead" style={{ marginBottom: 32 }}>
                Practical playbooks for reels, captions, hashtags, and content repurposing.
              </p>
            </Reveal>
            <div className="grid-guides">
              {featuredGuides.map((post, i) => (
                <Reveal key={post.slug} index={i}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: 24,
                      height: "100%",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div>
                      <time dateTime={post.date} className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        {post.date}
                      </time>
                      <h3 style={{ fontSize: 18, margin: "10px 0 8px" }}>{post.title}</h3>
                      <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{post.description}</p>
                    </div>
                    <span className="mono" style={{ display: "inline-block", marginTop: 14, fontSize: 13, color: "var(--gold-ink)" }}>
                      Read guide →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div className="container" style={{ marginBottom: "var(--section-y)" }}>
          <AdFrame slotH={110} />
        </div>

        <FAQ />
      </main>
      <Footer />
    </>
  );
}
