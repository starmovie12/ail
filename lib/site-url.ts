/**
 * The canonical site origin — used by the sitemap, robots.txt, canonical
 * tags and JSON-LD. Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL   (set this when you attach a custom domain)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel sets this automatically to the
 *      production domain (e.g. "instagrabs.vercel.app"), so the sitemap and
 *      canonicals can never point at the wrong host again.
 *   3. Hardcoded fallback (current production domain).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://instagrabs.vercel.app")
).replace(/\/$/, "");
