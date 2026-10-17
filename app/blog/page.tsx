import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Instagram Growth, Reels & Hashtag Guides | InstaGrab",
  description:
    "Practical guides on Instagram reels, hashtags, captions, and content strategy for creators and social media managers.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <>
      <Nav />
      <main className="container" style={{ padding: "80px 24px 96px", maxWidth: 780 }}>
        <p className="label intro-rise" style={{ color: "var(--gold-ink)" }}>Blog</p>
        <h1 className="intro-rise" style={{ fontSize: "var(--t-h2)", marginTop: 16, ["--dl" as string]: "100ms" }}>
          Notes for <em className="gilded">creators</em>.
        </h1>
        <p className="lead intro-rise" style={{ marginTop: 16, ["--dl" as string]: "200ms" }}>
          Practical, no-fluff guides on reels, hashtags, captions and content strategy.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 48 }}>
          {BLOG_POSTS.map((post, i) => (
            <Reveal key={post.slug} index={i}>
              <Link href={`/blog/${post.slug}`} className="card" style={{
                display: "block", padding: 24, textDecoration: "none", color: "inherit",
              }}>
                <time dateTime={post.date} className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  {post.date}
                </time>
                <h2 style={{ fontSize: "var(--t-h3)", margin: "10px 0 8px" }}>{post.title}</h2>
                <p style={{ color: "var(--ink-2)", fontSize: "var(--t-small)" }}>{post.description}</p>
                <span className="mono" style={{ display: "inline-block", marginTop: 14, fontSize: 13, color: "var(--gold-ink)" }}>
                  Read the guide →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
