import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AdBanner300 from "@/components/AdBanner300";
import { BLOG_POSTS, getPost } from "@/lib/blog-posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | InstaGrab`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <Nav />
      <main className="container" style={{ padding: "80px 24px 96px", maxWidth: 780 }}>
        <p className="label intro-rise" style={{ color: "var(--gold-ink)" }}>Blog</p>
        <h1 className="intro-rise" style={{ fontSize: "var(--t-h2)", marginTop: 16, ["--dl" as string]: "100ms" }}>
          {post.title}
        </h1>
        <time dateTime={post.date} className="mono intro-rise" style={{ display: "block", fontSize: 12, color: "var(--ink-3)", marginTop: 14, ["--dl" as string]: "200ms" }}>
          {post.date}
        </time>
        <div className="article intro-rise" style={{ marginTop: 40, ["--dl" as string]: "300ms" }}>
          {post.content.map((block, i) => {
            const node =
              block.type === "h2" ? <h2 key={i}>{block.text}</h2>
              : block.type === "ul" ? (
                  <ul key={i}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                )
              : <p key={i}>{block.text}</p>;
            // Drop a 300×250 banner once, after the 2nd block — mid-article,
            // where readers are engaged but not interrupted at the very top.
            if (i === 2) {
              return (
                <div key={`wrap-${i}`}>
                  {node}
                  <AdBanner300 />
                </div>
              );
            }
            return node;
          })}
          <p>
            <strong>Try it now:</strong>{" "}
            <Link href="/">Download any reel with its caption + hashtags free →</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
