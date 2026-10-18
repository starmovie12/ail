/**
 * Facebook video / reel extractor — EK jagah, taaki /api/extract aur /api/og-extract dono yahi use karein.
 *
 * Kyun alag file: pehle GoldenBar Facebook links ko /api/og-extract par bhejta tha (sirf og:image/og:video
 * tags padhta tha) — isliye Facebook par aksar video ki jagah thumbnail milta tha. Ab dono routes isi
 * multi-engine extractor se guzarte hain.
 *
 * Tareeka:
 *  1. Short link (fb.watch / fb.me / share) ko asli URL me badlo.
 *  2. Video ID mil jaye to https://www.facebook.com/reel/{id} (halka page, anonymous par bhi aksar
 *     browser_native_hd_url deta hai) + watch/?v={id} + web.facebook.com/user/videos/{id} bhi try karo.
 *  3. Alag-alag User-Agent (desktop / Facebook-bot / mobile) ek saath, pehla video-wala jawab jeeta.
 *  4. Phir bhi na mile → SnapSave, public resolvers, Cobalt (last resort).
 *  Video link par sirf thumbnail mile to usse "photo" bana ke NAHI dete (galat download hota tha).
 */
import {
  fetchViaSnapSave,
  fetchViaPublicResolver,
  fetchViaCobalt,
  resolveFacebookShortlink,
} from './instagram-extractor';

export class FbError extends Error {
  code: 'INVALID_URL' | 'NOT_FOUND';
  constructor(message: string, code: 'INVALID_URL' | 'NOT_FOUND' = 'NOT_FOUND') {
    super(message);
    this.name = 'FbError';
    this.code = code;
  }
}

export type FbVersion = { label: string; url: string };

export type FbResult = {
  id: string;
  canonicalUrl: string;
  kind: 'video' | 'image';
  /** best media URL */
  url: string;
  thumbnail: string | null;
  title: string;
  caption: string;
  versions: FbVersion[];
  engine: string;
};

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36';
const BOT_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';

function headersFor(ua: string): Record<string, string> {
  return {
    'User-Agent': ua,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  };
}

/* ───────────────────────── parsing helpers (pure — test-friendly) ───────────────────────── */

function htmlDecode(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function unescapeJsonString(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`);
  } catch {
    return raw.replace(/\\\//g, '/').replace(/\\u0025/g, '%').replace(/\\u0026/g, '&');
  }
}

/** `"key":"value"` ya `key:"value"` — pehla match, JSON-unescaped. */
function readKey(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const m = html.match(new RegExp(`["']?${key}["']?\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (m && m[1]) {
      const v = unescapeJsonString(m[1]);
      if (/^https?:\/\//i.test(v)) return v;
    }
  }
  return null;
}

export function metaContent(html: string, prop: string): string | null {
  const p = prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m =
    html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${p}["']`, 'i'));
  return m ? htmlDecode(m[1]) : null;
}

export type FbPage = {
  hd: string | null;
  sd: string | null;
  ogVideo: string | null;
  thumbnail: string | null;
  title: string;
  caption: string;
};

export function parseFacebookHtml(html: string): FbPage {
  const hd = readKey(html, ['browser_native_hd_url', 'playable_url_quality_hd', 'hd_src_no_ratelimit', 'hd_src']);
  const sd = readKey(html, ['browser_native_sd_url', 'playable_url', 'sd_src_no_ratelimit', 'sd_src']);
  const ogVideo = metaContent(html, 'og:video:secure_url') || metaContent(html, 'og:video') || metaContent(html, 'og:video:url');
  let thumbnail = metaContent(html, 'og:image') || metaContent(html, 'twitter:image');
  if (!thumbnail) {
    const m = html.match(/https:[^"'\s\\]+fbcdn\.net[^"'\s\\]+\.(?:jpg|jpeg|png|webp)[^"'\s\\]*/i);
    if (m) thumbnail = unescapeJsonString(m[0]);
  }
  const title = (metaContent(html, 'og:title') || metaContent(html, 'twitter:title') || '').replace(/\s*\|\s*Facebook$/i, '').trim();
  const caption = metaContent(html, 'og:description') || metaContent(html, 'twitter:description') || title;
  return { hd, sd, ogVideo: ogVideo && /^https?:\/\//i.test(ogVideo) ? ogVideo : null, thumbnail, title, caption };
}

/** Link se numeric video ID (reel/ videos/ watch?v= / video.php?v=). */
export function facebookVideoId(url: string): string | null {
  const m =
    url.match(/[?&]v=(\d{8,})/) ||
    url.match(/\/videos\/(?:[^/?#]+\/)?(\d{8,})/) ||
    url.match(/\/reels?\/(\d{8,})/) ||
    url.match(/\/watch\/(\d{8,})/);
  return m ? m[1] : null;
}

const PHOTO_LIKE = /\/photo|\/photos\/|\/posts\/|story\.php|\/permalink/i;

/** Page ke candidate URLs (priority order). */
export function candidateUrls(resolved: string): { url: string; ua: string }[] {
  const id = facebookVideoId(resolved);
  const mobile = resolved.replace(/^(https?:\/\/)(?:www\.|web\.)?facebook\.com/i, '$1m.facebook.com');
  const list: { url: string; ua: string }[] = [];
  if (id) list.push({ url: `https://www.facebook.com/reel/${id}`, ua: DESKTOP_UA });
  list.push({ url: resolved, ua: DESKTOP_UA });
  if (id) list.push({ url: `https://www.facebook.com/watch/?v=${id}`, ua: DESKTOP_UA });
  if (id) list.push({ url: `https://www.facebook.com/reel/${id}`, ua: BOT_UA });
  list.push({ url: resolved, ua: BOT_UA });
  if (mobile !== resolved) list.push({ url: mobile, ua: MOBILE_UA });
  if (id) list.push({ url: `https://web.facebook.com/user/videos/${id}`, ua: DESKTOP_UA });
  // duplicates hatao
  const seen = new Set<string>();
  return list.filter((c) => {
    const k = c.url + '|' + c.ua;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function fetchPage(url: string, ua: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: headersFor(ua),
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, 3_000_000);
  } catch {
    return null;
  }
}

/* ───────────────────────── main ───────────────────────── */

function within<T>(p: Promise<T | null>, ms: number): Promise<T | null> {
  return Promise.race([p.catch(() => null), new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

type LegacyMedia = { type: 'video' | 'image'; url: string; thumbnail?: string; qualities?: FbVersion[] };
type LegacyResult = { success?: boolean; engine?: string; caption?: string; media?: LegacyMedia[] } | null;

function fromLegacy(r: LegacyResult, id: string, canonicalUrl: string): FbResult | null {
  const m = r?.success ? r.media?.find((x) => x?.url) : null;
  if (!r || !m) return null;
  const versions = m.qualities?.length ? m.qualities : [{ label: m.type === 'video' ? 'HD' : 'Original', url: m.url }];
  return {
    id,
    canonicalUrl,
    kind: m.type === 'video' ? 'video' : 'image',
    url: m.url,
    thumbnail: m.thumbnail || null,
    title: '',
    caption: r.caption || '',
    versions,
    engine: r.engine || 'third_party',
  };
}

/* Chhota in-memory cache (per serverless instance): GoldenBar fail hone par dusre route se wahi link dobara
   bhejta hai — tab poora scrape dubara na ho. Success 3 min, failure 45 s. */
const memo = new Map<string, { at: number; ok: FbResult | null; err?: FbError }>();

export async function extractFacebookVideo(rawUrl: string, cobaltInstance?: string | null): Promise<FbResult> {
  const key = rawUrl.trim();
  const now = Date.now();
  const hit = memo.get(key);
  if (hit && now - hit.at < (hit.ok ? 180_000 : 45_000)) {
    if (hit.ok) return hit.ok;
    if (hit.err) throw hit.err;
  }
  if (memo.size > 200) memo.clear();
  try {
    const out = await extractFacebookVideoUncached(key, cobaltInstance);
    memo.set(key, { at: Date.now(), ok: out });
    return out;
  } catch (e) {
    if (e instanceof FbError && e.code === 'NOT_FOUND') memo.set(key, { at: Date.now(), ok: null, err: e });
    throw e;
  }
}

async function extractFacebookVideoUncached(rawUrl: string, cobaltInstance?: string | null): Promise<FbResult> {
  const input = rawUrl.trim();
  const resolved = await resolveFacebookShortlink(input);
  let host = '';
  try {
    host = new URL(resolved).hostname;
  } catch {
    throw new FbError("That doesn't look like a valid link.", 'INVALID_URL');
  }
  if (!/(^|\.)(facebook\.com|fb\.watch|fb\.me)$/i.test(host)) {
    throw new FbError("That doesn't look like a Facebook link.", 'INVALID_URL');
  }

  const id = facebookVideoId(resolved) || resolved.match(/[?&](?:story_fbid|fbid)=(\d+)/)?.[1] || `fb_${Date.now().toString(36)}`;
  const photoLike = PHOTO_LIKE.test(resolved);

  // Phase 1 — Facebook ke pages, saare ek saath (har ek ≤ 8s). Priority order mein pehla video-wala.
  const attempts = candidateUrls(resolved);
  const pages = await Promise.all(
    attempts.map(async (a) => {
      const html = await fetchPage(a.url, a.ua);
      return html ? { a, page: parseFacebookHtml(html) } : null;
    })
  );

  for (const hit of pages) {
    if (!hit) continue;
    const { page } = hit;
    const best = page.hd || page.sd || page.ogVideo;
    if (!best) continue;
    const versions: FbVersion[] = [];
    if (page.hd) versions.push({ label: 'HD', url: page.hd });
    if (page.sd && page.sd !== page.hd) versions.push({ label: 'SD', url: page.sd });
    if (!versions.length) versions.push({ label: 'HD', url: best });
    return {
      id,
      canonicalUrl: resolved,
      kind: 'video',
      url: best,
      thumbnail: page.thumbnail,
      title: page.title,
      caption: page.caption || page.title,
      versions,
      engine: 'facebook_page',
    };
  }

  // Phase 2 — third-party engines (ek saath, ≤ 10s). Link sirf yahin bahar jata hai.
  const cobalt = cobaltInstance || process.env.COBALT_INSTANCE || null;
  const third = await Promise.all([
    within(fetchViaSnapSave(resolved, id, 'facebook'), 10000),
    within(fetchViaPublicResolver(resolved, id, 'facebook'), 10000),
    cobalt ? within(fetchViaCobalt(resolved, id, cobalt, process.env.COBALT_API_KEY || null, 'facebook'), 10000) : Promise.resolve(null),
  ]);
  for (const r of third) {
    const out = fromLegacy(r as LegacyResult, id, resolved);
    // third-party se "image" tabhi lo jab link photo/post ka ho
    if (out && (out.kind === 'video' || photoLike)) {
      const thumb = pages.find((p) => p?.page.thumbnail)?.page.thumbnail ?? null;
      return { ...out, thumbnail: out.thumbnail || thumb, title: out.title || pages.find((p) => p?.page.title)?.page.title || '' };
    }
  }

  // Phase 3 — photo / post link: og:image theek hai
  if (photoLike) {
    for (const hit of pages) {
      if (hit?.page.thumbnail) {
        return {
          id,
          canonicalUrl: resolved,
          kind: 'image',
          url: hit.page.thumbnail,
          thumbnail: hit.page.thumbnail,
          title: hit.page.title,
          caption: hit.page.caption,
          versions: [{ label: 'Original', url: hit.page.thumbnail }],
          engine: 'facebook_photo',
        };
      }
    }
  }

  throw new FbError(
    'Unable to extract this Facebook link. Please make sure the video or reel is public (not private / friends-only).',
    'NOT_FOUND'
  );
}

/* ───────────────────────── diagnostics (/api/diag) ───────────────────────── */

export type FbDiagRow = { attempt: string; ok: boolean; ms: number; note: string };

/** Har page/User-Agent attempt ka haal + third-party engines. Koi secret output me nahi. */
export async function diagnoseFacebook(rawUrl: string): Promise<{ resolvedUrl: string; videoId: string | null; rows: FbDiagRow[] }> {
  const resolved = await resolveFacebookShortlink(rawUrl.trim());
  const id = facebookVideoId(resolved);
  const rows: FbDiagRow[] = await Promise.all(
    candidateUrls(resolved).map(async (a): Promise<FbDiagRow> => {
      const t0 = Date.now();
      const label = `${a.ua === DESKTOP_UA ? 'desktop' : a.ua === BOT_UA ? 'fb-bot' : 'mobile'} ${a.url.replace(/^https:\/\//, '').slice(0, 60)}`;
      try {
        const res = await fetch(a.url, { headers: headersFor(a.ua), redirect: 'follow', cache: 'no-store', signal: AbortSignal.timeout(8000) });
        const html = (await res.text().catch(() => '')).slice(0, 3_000_000);
        const p = parseFacebookHtml(html);
        const loginWall = /id="login_form"|\/login\/\?next=|You must log in|log in to continue/i.test(html);
        return {
          attempt: label,
          ok: !!(p.hd || p.sd || p.ogVideo),
          ms: Date.now() - t0,
          note: `HTTP ${res.status}${res.redirected ? ' (redirected)' : ''}; ${html.length} bytes; hd=${!!p.hd} sd=${!!p.sd} og:video=${!!p.ogVideo} thumb=${!!p.thumbnail} loginWall=${loginWall}`,
        };
      } catch (e) {
        return { attempt: label, ok: false, ms: Date.now() - t0, note: String((e as Error)?.message || e).slice(0, 100) };
      }
    })
  );
  const t = async (name: string, fn: () => Promise<unknown>): Promise<FbDiagRow> => {
    const t0 = Date.now();
    const r = await within(fn() as Promise<unknown | null>, 10000);
    return { attempt: name, ok: !!r, ms: Date.now() - t0, note: r ? 'media found' : 'nothing' };
  };
  rows.push(
    ...(await Promise.all([
      t('third-party:snapsave', () => fetchViaSnapSave(resolved, id || 'diag', 'facebook')),
      t('third-party:public-resolver', () => fetchViaPublicResolver(resolved, id || 'diag', 'facebook')),
    ]))
  );
  return { resolvedUrl: resolved, videoId: id, rows };
}
