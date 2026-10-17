import { MetadataRoute } from "next";
import { REGISTRY } from "@/lib/registry";
import { BLOG_POSTS } from "@/lib/blog-posts";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://instagrabs.vercel.app").replace(/\/$/, "");

/**
 * Sitemap registry se banta hai (PRD §17.2) — naya tool jodte hi apne aap aata hai.
 * Noindex pages (history, settings, quick-action, coming-soon) bahar. Hidden tools (hindi SEO pages) SEO ke liye andar.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const top: { path: string; priority: number }[] = [
    { path: "", priority: 1.0 },
    { path: "/tools", priority: 0.9 },
    { path: "/how-to-download", priority: 0.8 },
    { path: "/blog", priority: 0.8 },
  ];
  const hot = new Set(["/instagram-downloader", "/caption-extractor", "/hashtag-extractor", "/reels-downloader", "/story-downloader", "/photo-downloader"]);
  const seen = new Set<string>(top.map((t) => t.path));
  const tools = REGISTRY.filter((t) => t.href !== "/quick-action").map((t) => ({ path: t.href, priority: hot.has(t.href) ? 0.9 : 0.7 }))
    .filter((t) => (seen.has(t.path) ? false : (seen.add(t.path), true)));
  const info = ["/about", "/privacy-policy", "/terms", "/contact", "/dmca"].map((path) => ({ path, priority: 0.5 }));

  return [
    ...top.map((i) => ({ url: `${SITE_URL}${i.path}`, lastModified, changeFrequency: "weekly" as const, priority: i.priority })),
    ...tools.map((i) => ({ url: `${SITE_URL}${i.path}`, lastModified, changeFrequency: "weekly" as const, priority: i.priority })),
    ...info.map((i) => ({ url: `${SITE_URL}${i.path}`, lastModified, changeFrequency: "monthly" as const, priority: i.priority })),
    ...BLOG_POSTS.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date(`${p.date}T00:00:00.000Z`), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
