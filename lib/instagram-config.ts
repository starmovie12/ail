/**
 * ⚠️ SWAPPABLE EXTRACTOR CONFIG — jab site toote, SIRF ye file edit karo.
 *
 * Instagram apna `doc_id` har 2-4 hafte mein rotate karta hai.
 * Jab extractor empty result dene lage:
 *   1. Chrome DevTools kholo → Network tab
 *   2. Kisi bhi public reel page ko kholo
 *   3. `graphql` request dhundho → uske form data se naya `doc_id` copy karo
 *   4. Neeche paste karo → commit → push → Vercel auto-deploy. 5-minute fix.
 */
export const IG_CONFIG = {
  /** GraphQL query document ID — ye har 2-4 hafte badal sakta hai */
  docId: "20565867659069524",

  /** Instagram web app ID (X-IG-App-ID header) — rarely changes */
  appId: "936619743392459",

  /** LSD token (X-FB-LSD header) — anti-CSRF token, works with generic value */
  lsd: "AVqbxe3J_YA",

  /** Browser-like User-Agent */
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",

  /** GraphQL endpoint (shortcode → post/reel/carousel media) */
  graphqlUrl: "https://www.instagram.com/api/graphql",

  /**
   * Username → profile info (HD profile picture, user id, privacy, bio).
   * Reliable web endpoint; needs the X-IG-App-ID header only.
   */
  webProfileInfoUrl:
    "https://www.instagram.com/api/v1/users/web_profile_info/?username=",

  /**
   * user_id → active stories (24h). Private API path hit with app-id header.
   * Used by Story Downloader + Anonymous Story Viewer.
   */
  reelsMediaUrl:
    "https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=",

  /** user_id → highlights tray (list of highlight albums + cover images). */
  highlightsTrayUrl:
    "https://www.instagram.com/api/v1/highlights/{userId}/highlights_tray/",

  /* ==========================================================
   * FALLBACK API — the reliable fix when Instagram blocks
   * Vercel's data-center IP (PRD §6, the #1 technical risk).
   *
   * How it works:
   *  - Leave `useFallbackApi` false and it runs AUTOMATICALLY: we try
   *    Instagram directly first, and only if that gets blocked do we call
   *    the fallback API. Set it `true` to force the fallback first.
   *  - It stays OFF until you set FALLBACK_API_URL, so nothing breaks
   *    without config.
   *
   * Vercel setup (Project → Settings → Environment Variables):
   *   FALLBACK_API_URL   = the provider endpoint, with {url} or {shortcode}
   *   FALLBACK_API_KEY   = your API key
   *   FALLBACK_API_KEY_HEADER = header name for the key (default x-api-key)
   *
   * Example — ScrapeCreators (free credits, named in the PRD):
   *   FALLBACK_API_URL = https://api.scrapecreators.com/v1/instagram/post?url={url}
   *   FALLBACK_API_KEY = <your key>
   *   FALLBACK_API_KEY_HEADER = x-api-key
   * Example — a RapidAPI Instagram downloader:
   *   FALLBACK_API_URL = https://<host>/media?shortcode={shortcode}
   *   FALLBACK_API_KEY = <your rapidapi key>
   *   FALLBACK_API_KEY_HEADER = x-rapidapi-key
   * ========================================================== */
  useFallbackApi: process.env.USE_FALLBACK_API === "true",
  fallbackApiUrl: process.env.FALLBACK_API_URL ?? "",
  fallbackApiKey: process.env.FALLBACK_API_KEY ?? "",
  fallbackApiKeyHeader: process.env.FALLBACK_API_KEY_HEADER ?? "x-api-key",

  /**
   * Optional PROFILE fallback — used by the username tools (profile viewer,
   * analyzers, stories) when both www and i.instagram.com are blocked.
   * Point it at a provider that returns Instagram's web_profile_info shape
   * (most providers proxy it verbatim). {username} is replaced.
   *   FALLBACK_PROFILE_API_URL = https://<provider>/profile?username={username}
   * Reuses FALLBACK_API_KEY / FALLBACK_API_KEY_HEADER above.
   */
  fallbackProfileApiUrl: process.env.FALLBACK_PROFILE_API_URL ?? "",

  /** Rate limit: per IP per minute */
  rateLimitPerMinute: 10,
};
