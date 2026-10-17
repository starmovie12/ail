import { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://instagrabs.vercel.app"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-14T00:00:00.000Z");

  // PRD ke hisaab se mukhya tool pages (high priority)
  const coreTools = [
    { path: "", priority: 1.0 },
    { path: "/caption-extractor", priority: 0.9 },
    { path: "/hashtag-extractor", priority: 0.9 },
    { path: "/reels-downloader", priority: 0.9 },
    { path: "/story-downloader", priority: 0.9 },
    { path: "/photo-downloader", priority: 0.9 },
    { path: "/carousel-downloader", priority: 0.8 },
    { path: "/video-downloader", priority: 0.8 },
    { path: "/profile-picture-downloader", priority: 0.8 },
    { path: "/highlights-downloader", priority: 0.8 },
  ];

  // AdSense aur trust ke liye zaroori pages
  const infoPages = [
    { path: "/blog", priority: 0.8 },
    { path: "/about", priority: 0.6 },
    { path: "/privacy-policy", priority: 0.5 },
    { path: "/terms", priority: 0.5 },
    { path: "/contact", priority: 0.5 },
    { path: "/dmca", priority: 0.5 },
  ];

  // SEO blog articles
  const blogArticles = [
    { slug: "how-to-download-instagram-reels-with-caption", date: "2026-07-04" },
    { slug: "best-time-to-post-reels", date: "2026-07-03" },
    { slug: "find-trending-hashtags-instagram", date: "2026-07-02" },
    { slug: "repurpose-instagram-content-legally", date: "2026-07-01" },
    { slug: "instagram-story-vs-reel-vs-post", date: "2026-06-30" },
    { slug: "instagram-reels-hd-vs-4k-quality", date: "2026-07-06" },
    { slug: "download-instagram-stories-anonymously", date: "2026-07-05" },
    { slug: "instagram-hashtag-strategy-2026", date: "2026-07-05" },
    { slug: "copy-instagram-caption-full-text", date: "2026-07-06" },
    { slug: "download-instagram-profile-picture-hd", date: "2026-07-06" },
    { slug: "get-brand-deals-small-creator-india", date: "2026-07-09" },
    { slug: "viral-reel-script-formula", date: "2026-07-08" },
    { slug: "spot-fake-followers-before-collab", date: "2026-07-07" },
    { slug: "instagram-seo-alt-text-keywords", date: "2026-07-06" },
    { slug: "instagram-giveaway-guide-india", date: "2026-07-05" },
  ];

  return [
    ...coreTools.map((item) => ({
      url: `${SITE_URL}${item.path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: item.priority,
    })),
    ...infoPages.map((item) => ({
      url: `${SITE_URL}${item.path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: item.priority,
    })),
    ...blogArticles.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
