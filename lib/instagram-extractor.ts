import { getLiveConfig } from './runtime-config';

const ENCODING_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function decodeEscaped(str?: string | null): string | null {
  if (!str) return null;
  let s = str.replace(/\\\//g, '/').replace(/\\u0025/g, '%').replace(/\\u0026/g, '&');
  try {
    s = JSON.parse(`"${str}"`);
  } catch {}
  return s.replace(/&amp;/g, '&');
}

function getMetaContent(html: string, attrValue: string): string | null {
  const escaped = attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const r1 = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i');
  const r2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i');
  const m = html.match(r1) || html.match(r2);
  return m ? decodeEscaped(m[1]) : null;
}

export function shortcodeToPk(shortcode: string): string {
  let cleanCode = shortcode;
  if (cleanCode.length > 28) {
    cleanCode = cleanCode.slice(0, -28);
  }
  const base = BigInt(64);
  let pk = BigInt(0);
  for (let i = 0; i < cleanCode.length; i++) {
    const char = cleanCode[i];
    const index = BigInt(ENCODING_CHARS.indexOf(char));
    if (index === BigInt(-1)) continue;
    pk = pk * base + index;
  }
  return pk.toString();
}

export function detectPlatform(input: string): 'facebook' | 'instagram' | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/(?:facebook\.com|fb\.watch|fb\.me)\b/i.test(trimmed)) {
    return 'facebook';
  }
  if (/(?:instagram\.com|instagr\.am)\b/i.test(trimmed) || /^[A-Za-z0-9_-]{9,20}$/.test(trimmed)) {
    return 'instagram';
  }
  return null;
}

export function parseInstagramUrl(input: string) {
  if (!input || typeof input !== 'string') return null;

  const urlMatch =
    input.match(/https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv|share\/[a-zA-Z0-9_-]+)\/([A-Za-z0-9_-]+)/i) ||
    input.match(/https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:[a-zA-Z0-9._-]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);

  if (urlMatch) {
    const shortcode = urlMatch[1];
    return {
      platform: 'instagram' as const,
      shortcode,
      id: shortcode,
      canonicalUrl: `https://www.instagram.com/p/${shortcode}/`,
      type: input.includes('/reel/') || input.includes('/reels/') ? 'reel' : 'post',
    };
  }

  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{9,20}$/.test(trimmed)) {
    return {
      platform: 'instagram' as const,
      shortcode: trimmed,
      id: trimmed,
      canonicalUrl: `https://www.instagram.com/p/${trimmed}/`,
      type: 'post',
    };
  }

  return null;
}

export function parseFacebookUrl(input: string) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  const isFb = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(?:facebook\.com|fb\.watch|fb\.me)\b/i.test(trimmed);
  if (!isFb) return null;

  const urlMatch = trimmed.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:facebook\.com|fb\.watch|fb\.me)\/[^\s<>"']+/i);
  const targetUrl = urlMatch ? urlMatch[0] : trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;

  let type = 'video';
  if (targetUrl.includes('/reel/') || targetUrl.includes('/share/r/')) {
    type = 'reel';
  } else if (targetUrl.includes('/photo') || targetUrl.includes('/photos/')) {
    type = 'photo';
  } else if (targetUrl.includes('/posts/') || targetUrl.includes('/story.php')) {
    type = 'post';
  }

  let id = 'facebook_media';
  const idMatch =
    targetUrl.match(/(?:videos|reel|watch|posts|photos|r|v)\/(?:[^\s/?#]+\/)?([0-9A-Za-z_-]+)/i) ||
    targetUrl.match(/[?&](?:v|story_fbid|fbid)=([0-9A-Za-z_-]+)/i) ||
    targetUrl.match(/fb\.watch\/([0-9A-Za-z_-]+)/i);

  if (idMatch) {
    id = idMatch[1];
  } else {
    id = `fb_${Date.now()}`;
  }

  return {
    platform: 'facebook' as const,
    id,
    shortcode: id,
    canonicalUrl: targetUrl,
    type,
  };
}

export function parseSocialUrl(input: string) {
  const platform = detectPlatform(input);
  if (platform === 'facebook') return parseFacebookUrl(input);
  if (platform === 'instagram') return parseInstagramUrl(input);
  return null;
}

async function fetchViaInstagramSession(shortcode: string, sessionId?: string | null) {
  if (!sessionId) return null;
  const pk = shortcodeToPk(shortcode);

  let cookieHeader = sessionId.trim();
  const userIdMatch =
    cookieHeader.match(/(\d{6,})%3A/) ||
    cookieHeader.match(/(\d{6,}):/) ||
    cookieHeader.match(/ds_user_id=(\d+)/);
  if (!cookieHeader.includes('sessionid=')) {
    cookieHeader = `sessionid=${cookieHeader}`;
  }
  if (userIdMatch && !cookieHeader.includes('ds_user_id=')) {
    cookieHeader = `${cookieHeader}; ds_user_id=${userIdMatch[1]}`;
  }

  try {
    const apiUrl = `https://i.instagram.com/api/v1/media/${pk}/info/`;
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Instagram 319.0.0.38.109 (iPhone14,3; iOS 17_4; en_US; en-US; scale=3.00; 1284x2778; 576822237)',
        'X-IG-App-ID': '124024574287414',
        'X-ASBD-ID': '359341',
        'X-IG-WWW-Claim': '0',
        Cookie: cookieHeader,
        Accept: '*/*',
        'Accept-Language': 'en-US',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.items && data.items.length > 0) {
        const item = data.items[0];
        const author = {
          username: item.user?.username || 'instagram_user',
          fullName: item.user?.full_name || '',
          avatar: item.user?.profile_pic_url || null,
        };
        const caption = item.caption?.text || '';

        if (item.carousel_media && Array.isArray(item.carousel_media) && item.carousel_media.length > 0) {
          const media = item.carousel_media.map((child: any, idx: number) => {
            const isVideo = child.media_type === 2 || !!child.video_versions;
            const downloadUrl =
              isVideo && child.video_versions?.[0]
                ? child.video_versions[0].url
                : child.image_versions2?.candidates?.[0]?.url;
            const thumb = child.image_versions2?.candidates?.[0]?.url || downloadUrl;
            return {
              type: isVideo ? ('video' as const) : ('image' as const),
              url: downloadUrl,
              thumbnail: thumb,
              width: child.original_width || 1080,
              height: child.original_height || 1080,
              filename: `grabflow_${shortcode}_${idx + 1}.${isVideo ? 'mp4' : 'jpg'}`,
            };
          });

          return {
            success: true,
            platform: 'instagram' as const,
            engine: 'instagram_authenticated_mobile',
            shortcode,
            id: shortcode,
            url: `https://www.instagram.com/p/${shortcode}/`,
            type: 'carousel' as const,
            author,
            caption,
            media,
          };
        }

        const isVideo = item.media_type === 2 || !!item.video_versions;
        const downloadUrl =
          isVideo && item.video_versions?.[0]
            ? item.video_versions[0].url
            : item.image_versions2?.candidates?.[0]?.url;
        const thumb = item.image_versions2?.candidates?.[0]?.url || downloadUrl;

        return {
          success: true,
          platform: 'instagram' as const,
          engine: 'instagram_authenticated_mobile',
          shortcode,
          id: shortcode,
          url: `https://www.instagram.com/p/${shortcode}/`,
          type: isVideo ? ('video' as const) : ('image' as const),
          author,
          caption,
          media: [
            {
              type: isVideo ? ('video' as const) : ('image' as const),
              url: downloadUrl,
              thumbnail: thumb,
              width: item.original_width || 1080,
              height: item.original_height || 1920,
              filename: `grabflow_${shortcode}_1.${isVideo ? 'mp4' : 'jpg'}`,
            },
          ],
        };
      }
    }
  } catch {}

  try {
    const gqlUrl = `https://www.instagram.com/graphql/query/?doc_id=20565867659069524&variables=${encodeURIComponent(JSON.stringify({ shortcode }))}`;
    const gqlRes = await fetch(gqlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        'X-ASBD-ID': '129477',
        Cookie: cookieHeader,
        Accept: '*/*',
      },
    });

    if (gqlRes.ok) {
      const gqlData = await gqlRes.json();
      const mediaData = gqlData?.data?.xdt_shortcode_media;
      if (mediaData) {
        const author = {
          username: mediaData.owner?.username || 'instagram_user',
          fullName: mediaData.owner?.full_name || '',
          avatar: mediaData.owner?.profile_pic_url || null,
        };
        const caption = mediaData.edge_media_to_caption?.edges?.[0]?.node?.text || '';

        if (mediaData.edge_sidecar_to_children?.edges?.length > 0) {
          const media = mediaData.edge_sidecar_to_children.edges.map((edge: any, idx: number) => {
            const node = edge.node;
            const isVideo = node.is_video || !!node.video_url;
            const downloadUrl = isVideo ? node.video_url : node.display_url;
            return {
              type: isVideo ? ('video' as const) : ('image' as const),
              url: downloadUrl,
              thumbnail: node.display_url || downloadUrl,
              filename: `grabflow_${shortcode}_${idx + 1}.${isVideo ? 'mp4' : 'jpg'}`,
            };
          });

          return {
            success: true,
            platform: 'instagram' as const,
            engine: 'instagram_authenticated_web',
            shortcode,
            id: shortcode,
            url: `https://www.instagram.com/p/${shortcode}/`,
            type: 'carousel' as const,
            author,
            caption,
            media,
          };
        }

        const isVideo = mediaData.is_video || !!mediaData.video_url;
        const downloadUrl = isVideo ? mediaData.video_url : mediaData.display_url;
        return {
          success: true,
          platform: 'instagram' as const,
          engine: 'instagram_authenticated_web',
          shortcode,
          id: shortcode,
          url: `https://www.instagram.com/p/${shortcode}/`,
          type: isVideo ? ('video' as const) : ('image' as const),
          author,
          caption,
          media: [
            {
              type: isVideo ? ('video' as const) : ('image' as const),
              url: downloadUrl,
              thumbnail: mediaData.display_url || downloadUrl,
              filename: `grabflow_${shortcode}_1.${isVideo ? 'mp4' : 'jpg'}`,
            },
          ],
        };
      }
    }
  } catch {}

  return null;
}

async function fetchViaInstagramEmbed(shortcode: string) {
  try {
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const html = await res.text();

    const userMatch = html.match(/class=["'][^"']*UsernameText[^"']*["'][^>]*>([^<]+)</i);
    const username = userMatch ? userMatch[1].trim() : 'instagram_user';

    const avatarMatch = html.match(/class=["'][^"']*EmbeddedMediaAvatarImage[^"']*["'][^>]+src=["']([^"']+)["']/i);
    const avatar = avatarMatch ? decodeEscaped(avatarMatch[1]) : null;

    const capMatch = html.match(/class=["'][^"']*Caption["'][^>]*>([\s\S]*?)<\/div>/i);
    const caption = capMatch
      ? capMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim()
      : '';

    const videoMatches = [...html.matchAll(/"video_url":\s*"([^"]+)"/g)]
      .map((m) => decodeEscaped(m[1]))
      .filter(Boolean) as string[];

    if (videoMatches.length > 0) {
      const displayMatches = [...html.matchAll(/"display_url":\s*"([^"]+)"/g)]
        .map((m) => decodeEscaped(m[1]))
        .filter(Boolean) as string[];
      return {
        success: true,
        platform: 'instagram' as const,
        engine: 'embed_regex_video',
        shortcode,
        id: shortcode,
        url: `https://www.instagram.com/p/${shortcode}/`,
        type: 'video' as const,
        author: { username, fullName: '', avatar },
        caption,
        media: [
          {
            type: 'video' as const,
            url: videoMatches[0],
            thumbnail: displayMatches[0] || videoMatches[0],
            filename: `grabflow_${shortcode}_1.mp4`,
          },
        ],
      };
    }

    const imgMatch = html.match(/class=["'][^"']*EmbeddedMediaImage[^"']*["'][^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      const cleanImg = decodeEscaped(imgMatch[1]) || imgMatch[1];
      return {
        success: true,
        platform: 'instagram' as const,
        engine: 'embed_image',
        shortcode,
        id: shortcode,
        url: `https://www.instagram.com/p/${shortcode}/`,
        type: 'image' as const,
        author: { username, fullName: '', avatar },
        caption,
        media: [
          {
            type: 'image' as const,
            url: cleanImg,
            thumbnail: cleanImg,
            filename: `grabflow_${shortcode}_1.jpg`,
          },
        ],
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function resolveFacebookShortlink(url: string): Promise<string> {
  if (!url || typeof url !== 'string') return url;
  const isShortlink = /(?:fb\.watch|fb\.me|\/share\/[rv]?\/)/i.test(url);
  if (!isShortlink) return url;

  async function tryResolve(target: string) {
    try {
      const res = await fetch(target, {
        redirect: 'manual',
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(6000),
      });
      const location = res.headers.get('location');
      if (location) {
        return location.startsWith('http') ? location : new URL(location, 'https://www.facebook.com').toString();
      }
    } catch {}
    return null;
  }

  const resolved = await tryResolve(url);
  return resolved || url;
}

async function fetchViaNativeFacebook(url: string, id: string) {
  const targetUrlResolved = await resolveFacebookShortlink(url);

  async function parseHtml(targetUrl: string, userAgent: string) {
    const res = await fetch(targetUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const html = await res.text();

    const rawTitle =
      getMetaContent(html, 'og:title') ||
      getMetaContent(html, 'twitter:title') ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      'Facebook Media';
    const title = rawTitle.replace(/\s*\|\s*Facebook$/i, '').trim();
    const caption = getMetaContent(html, 'og:description') || getMetaContent(html, 'twitter:description') || title;

    const hdMatch =
      html.match(/browser_native_hd_url["']?\s*:\s*["']([^"']+)["']/i) ||
      html.match(/playable_url_quality_hd["']?\s*:\s*["']([^"']+)["']/i) ||
      html.match(/hd_src["']?\s*:\s*["']([^"']+)["']/i) ||
      html.match(/hd_src_no_ratelimit["']?\s*:\s*["']([^"']+)["']/i);

    const sdMatch =
      html.match(/browser_native_sd_url["']?\s*:\s*["']([^"']+)["']/i) ||
      html.match(/playable_url["']?\s*:\s*["']([^"']+)["']/i) ||
      html.match(/sd_src["']?\s*:\s*["']([^"']+)["']/i) ||
      html.match(/sd_src_no_ratelimit["']?\s*:\s*["']([^"']+)["']/i);

    const ogVideo =
      getMetaContent(html, 'og:video') ||
      getMetaContent(html, 'og:video:secure_url') ||
      getMetaContent(html, 'og:video:url');

    const hdUrl = decodeEscaped(hdMatch?.[1]);
    const sdUrl = decodeEscaped(sdMatch?.[1]);
    const videoUrl = hdUrl || sdUrl || ogVideo;

    let thumbnail =
      getMetaContent(html, 'og:image') ||
      getMetaContent(html, 'og:image:secure_url') ||
      getMetaContent(html, 'twitter:image') ||
      null;

    if (!thumbnail) {
      const imgMatch = html.match(/https:[^"'\s\\]+fbcdn\.net[^"'\s\\]+\.(?:jpg|jpeg|png|webp)[^"'\s\\]*/i);
      if (imgMatch) thumbnail = decodeEscaped(imgMatch[0]);
    }

    let authorName = 'facebook_creator';
    const pipeParts = title.split('|').map((s) => s.trim()).filter(Boolean);
    if (pipeParts.length > 1) {
      const lastPart = pipeParts[pipeParts.length - 1];
      if (!lastPart.toLowerCase().includes('facebook') && lastPart.length < 60) {
        authorName = lastPart;
      }
    }

    if (videoUrl) {
      return {
        success: true,
        platform: 'facebook' as const,
        engine: 'facebook_native',
        id,
        shortcode: id,
        url: targetUrl,
        type: 'video' as const,
        author: { username: authorName, fullName: authorName, avatar: thumbnail },
        caption: caption || title,
        media: [
          {
            type: 'video' as const,
            url: videoUrl,
            thumbnail: thumbnail || videoUrl,
            quality: hdUrl ? 'HD' : 'SD',
            filename: `facebook_${id}_${hdUrl ? 'HD' : 'SD'}.mp4`,
          },
        ],
      };
    }

    if (thumbnail) {
      return {
        success: true,
        platform: 'facebook' as const,
        engine: 'facebook_native_photo',
        id,
        shortcode: id,
        url: targetUrl,
        type: 'image' as const,
        author: { username: authorName, fullName: authorName, avatar: thumbnail },
        caption: caption || title,
        media: [
          {
            type: 'image' as const,
            url: thumbnail,
            thumbnail,
            filename: `facebook_${id}.jpg`,
          },
        ],
      };
    }

    return null;
  }

  try {
    const desktopResult = await parseHtml(
      targetUrlResolved,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
    if (desktopResult) return desktopResult;
  } catch {}

  try {
    const mobileUrl = targetUrlResolved.replace(/(?:www\.|web\.)?facebook\.com/, 'm.facebook.com');
    const mobileResult = await parseHtml(
      mobileUrl,
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    );
    if (mobileResult) return mobileResult;
  } catch {}

  return null;
}

async function fetchViaPublicResolver(url: string, shortcode: string, platform: 'instagram' | 'facebook' = 'instagram') {
  const mirrors = [
    `https://api.vkrdownloader.com/server?vkr=${encodeURIComponent(url)}`,
    `https://backend1.tioo.eu.org/igdl?url=${encodeURIComponent(url)}`,
  ];
  const filePrefix = platform === 'facebook' ? 'facebook' : 'grabflow';

  for (const mirror of mirrors) {
    try {
      const res = await fetch(mirror, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const data = await res.json();

      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const media = data.data
          .filter((item: any) => item.url)
          .map((item: any, idx: number) => {
            const isVid = item.type === 'video' || item.url.includes('.mp4');
            return {
              type: isVid ? ('video' as const) : ('image' as const),
              url: item.url,
              thumbnail: item.thumbnail || item.url,
              filename: `${filePrefix}_${shortcode}_${idx + 1}.${isVid ? 'mp4' : 'jpg'}`,
            };
          });
        if (media.length > 0) {
          return {
            success: true,
            platform,
            engine: 'public_resolver',
            shortcode,
            id: shortcode,
            url,
            type: media.length > 1 ? ('carousel' as const) : media[0].type,
            author: { username: `${platform}_creator`, fullName: '', avatar: null },
            caption: data.title || '',
            media,
          };
        }
      }

      if (data?.result && Array.isArray(data.result) && data.result.length > 0) {
        const media = data.result
          .filter((item: any) => item.url && item.url.length > 5)
          .map((item: any, idx: number) => {
            const isVid = item.url.includes('.mp4');
            return {
              type: isVid ? ('video' as const) : ('image' as const),
              url: item.url,
              thumbnail: item.thumbnail || item.url,
              filename: `${filePrefix}_${shortcode}_${idx + 1}.${isVid ? 'mp4' : 'jpg'}`,
            };
          });
        if (media.length > 0) {
          return {
            success: true,
            platform,
            engine: 'public_resolver',
            shortcode,
            id: shortcode,
            url,
            type: media.length > 1 ? ('carousel' as const) : media[0].type,
            author: { username: `${platform}_creator`, fullName: '', avatar: null },
            caption: '',
            media,
          };
        }
      }
    } catch {}
  }
  return null;
}

async function fetchViaCobalt(
  url: string,
  shortcode: string,
  customInstance?: string | null,
  apiKey?: string | null,
  platform: 'instagram' | 'facebook' = 'instagram'
) {
  const instance = (customInstance || process.env.COBALT_INSTANCE || '').trim().replace(/\/$/, '');
  if (!instance) return null;
  const filePrefix = platform === 'facebook' ? 'facebook' : 'grabflow';

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (apiKey) headers['Authorization'] = `Api-Key ${apiKey}`;

    const res = await fetch(`${instance}/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (data.status === 'redirect' || data.status === 'tunnel') {
      const isVid = data.url.includes('.mp4') || !data.url.includes('.jpg');
      return {
        success: true,
        platform,
        engine: 'cobalt',
        shortcode,
        id: shortcode,
        url,
        type: isVid ? ('video' as const) : ('image' as const),
        author: { username: `${platform}_creator`, fullName: '', avatar: null },
        caption: data.filename || '',
        media: [
          {
            type: isVid ? ('video' as const) : ('image' as const),
            url: data.url,
            thumbnail: data.url,
            filename: `${filePrefix}_${shortcode}_1.${isVid ? 'mp4' : 'jpg'}`,
          },
        ],
      };
    }

    if (data.status === 'picker' && Array.isArray(data.picker)) {
      const media = data.picker.map((item: any, idx: number) => {
        const isVid = item.type === 'video' || item.url.includes('.mp4');
        return {
          type: isVid ? ('video' as const) : ('image' as const),
          url: item.url,
          thumbnail: item.thumb || item.url,
          filename: `${filePrefix}_${shortcode}_${idx + 1}.${isVid ? 'mp4' : 'jpg'}`,
        };
      });
      return {
        success: true,
        platform,
        engine: 'cobalt_picker',
        shortcode,
        id: shortcode,
        url,
        type: 'carousel' as const,
        author: { username: `${platform}_creator`, fullName: '', avatar: null },
        caption: '',
        media,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function extractInstagramMedia(inputUrl: string, options: any = {}) {
  const parsed = parseInstagramUrl(inputUrl);
  if (!parsed) {
    throw new Error('Please provide a valid Instagram post, reel, or video link.');
  }

  const { shortcode, canonicalUrl } = parsed;
  const sessionId = options.sessionId || process.env.INSTAGRAM_SESSION_ID || null;
  const cobaltInstance = options.cobaltInstance || process.env.COBALT_INSTANCE || null;
  const cobaltApiKey = options.cobaltApiKey || process.env.COBALT_API_KEY || null;

  if (sessionId) {
    try {
      const sessionResult = await fetchViaInstagramSession(shortcode, sessionId);
      if (sessionResult && sessionResult.media?.length > 0) {
        return sessionResult;
      }
    } catch {}
  }

  const engines = [
    fetchViaInstagramEmbed(shortcode),
    fetchViaPublicResolver(canonicalUrl, shortcode, 'instagram'),
  ];

  if (cobaltInstance) {
    engines.push(fetchViaCobalt(canonicalUrl, shortcode, cobaltInstance, cobaltApiKey, 'instagram'));
  }

  const results = await Promise.allSettled(engines);
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value && r.value.success && r.value.media?.length > 0) {
      return r.value;
    }
  }

  throw new Error('Unable to fetch media from this Instagram link right now.');
}

export async function extractFacebookMedia(inputUrl: string, options: any = {}) {
  const resolvedUrl = await resolveFacebookShortlink(inputUrl);
  const parsed = parseFacebookUrl(resolvedUrl) || parseFacebookUrl(inputUrl);
  if (!parsed) {
    throw new Error('Please provide a valid Facebook video, reel, or post link.');
  }

  const { canonicalUrl, id } = parsed;
  const cobaltInstance = options.cobaltInstance || process.env.COBALT_INSTANCE || null;
  const cobaltApiKey = options.cobaltApiKey || process.env.COBALT_API_KEY || null;

  try {
    const nativeResult = await fetchViaNativeFacebook(canonicalUrl, id);
    if (nativeResult && nativeResult.media?.length > 0) {
      return nativeResult;
    }
  } catch {}

  const engines = [fetchViaPublicResolver(canonicalUrl, id, 'facebook')];
  if (cobaltInstance) {
    engines.push(fetchViaCobalt(canonicalUrl, id, cobaltInstance, cobaltApiKey, 'facebook'));
  }

  const results = await Promise.allSettled(engines);
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value && r.value.success && r.value.media?.length > 0) {
      return r.value;
    }
  }

  throw new Error('Unable to fetch media from this Facebook link. Make sure the video or post is public.');
}

export async function extractSocialMedia(inputUrl: string, options: any = {}) {
  const platform = detectPlatform(inputUrl);
  if (platform === 'facebook') {
    return extractFacebookMedia(inputUrl, options);
  }
  return extractInstagramMedia(inputUrl, options);
}

/* ═══════════════════════════════════════════════════════════════════════
 *  PUBLIC API used by the routes + lib/extract-ui.ts
 *  (extract, extractStories, extractHighlights, extractHighlightItems,
 *   extractProfile, extractProfileFeed, ExtractError + shared types)
 *
 *  Engine order for posts/reels (first success wins):
 *    1. logged-in session (INSTAGRAM_SESSION_ID)  +  web GraphQL   (parallel)
 *    2. paid/free FALLBACK API (FALLBACK_API_URL)   ← the real fix for the
 *       "Instagram blocks Vercel data-centre IPs" 503
 *    3. embed page, public resolvers, cobalt (parallel, last resort)
 *  If `useFallbackApi` is on (admin panel / env) steps 1 and 2 swap order.
 * ═══════════════════════════════════════════════════════════════════════ */

export class ExtractError extends Error {
  code: string;
  constructor(message: string, code: string = 'EXTRACTOR_DOWN') {
    super(message);
    this.name = 'ExtractError';
    this.code = code;
  }
}

export type MediaQuality = { label: string; url: string; width?: number; height?: number };

export type MediaItem = {
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  width?: number;
  height?: number;
  qualities?: MediaQuality[];
  /** Audio-only (M4A) track from Instagram's DASH manifest, when exposed */
  audioUrl?: string;
};

export type PostComment = { username: string; text: string; likes?: number; takenAt?: number };

export type ExtractResult = {
  shortcode: string;
  type: 'video' | 'image' | 'carousel';
  username: string;
  fullName?: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  thumbnail: string;
  media: MediaItem[];
  likes?: number;
  commentCount?: number;
  views?: number;
  takenAt?: number;
  durationSeconds?: number;
  comments?: PostComment[];
  engine?: string;
};

export type StoryItem = {
  id?: string;
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  takenAt: number;
  qualities?: MediaQuality[];
  audioUrl?: string;
};

export type StoriesResult = { username: string; items: StoryItem[] };
export type HighlightAlbum = { id: string; title: string; cover: string };
export type HighlightsResult = { username: string; albums: HighlightAlbum[] };

export type ProfileResult = {
  username: string;
  fullName: string;
  userId: string;
  isPrivate: boolean;
  isVerified: boolean;
  biography: string;
  followers: number;
  following: number;
  posts: number;
  profilePicHd: string;
};

export type FeedPost = {
  shortcode: string;
  type: 'image' | 'video' | 'carousel';
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  takenAt: number;
  isPinned?: boolean;
};

export type ProfileFeedResult = ProfileResult & { postsList: FeedPost[]; hasMore: boolean };

/* ───────────────────────── small helpers ───────────────────────── */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
const MENTION_RE = /@[A-Za-z0-9_.]+/g;
const uniq = (a: string[]) => Array.from(new Set(a));
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** Never let a rejected promise escape an engine — an engine failing = "null". */
function safe<T>(p: Promise<T | null>): Promise<T | null> {
  return p.catch(() => null);
}

/** Resolve with the first NON-null result; null if every promise fails/returns null. */
function firstSuccess<T>(ps: Promise<T | null>[]): Promise<T | null> {
  return new Promise((resolve) => {
    let pending = ps.length;
    if (!pending) return resolve(null);
    for (const p of ps) {
      p.then(
        (v) => {
          if (v) resolve(v);
          else if (--pending === 0) resolve(null);
        },
        () => {
          if (--pending === 0) resolve(null);
        }
      );
    }
  });
}

/** Cookie header from INSTAGRAM_SESSION_ID (accepts a bare sessionid or a full cookie string). */
function sessionCookie(): string | null {
  const raw = (process.env.INSTAGRAM_SESSION_ID || '').trim();
  if (!raw) return null;
  let cookie = raw;
  if (!/sessionid=/i.test(cookie)) cookie = `sessionid=${cookie}`;
  const uid =
    raw.match(/ds_user_id=(\d+)/)?.[1] || raw.match(/(\d{6,})%3A/)?.[1] || raw.match(/(\d{6,}):/)?.[1];
  if (uid && !/ds_user_id=/.test(cookie)) cookie += `; ds_user_id=${uid}`;
  return cookie;
}

function textOfCaption(node: Any): string {
  const edge = node?.edge_media_to_caption?.edges?.[0]?.node?.text;
  if (typeof edge === 'string') return edge;
  const c = node?.caption;
  if (typeof c === 'string') return c;
  if (typeof c?.text === 'string') return c.text;
  return '';
}

function audioFromDash(xml?: string | null): string | undefined {
  if (!xml || typeof xml !== 'string') return undefined;
  const m = xml.match(/<AdaptationSet[^>]*contentType="audio"[\s\S]*?<BaseURL>([^<]+)<\/BaseURL>/i);
  return m ? m[1].replace(/&amp;/g, '&') : undefined;
}

function uniqueByHeight(list: Any[] | undefined): MediaQuality[] {
  const seen = new Set<number>();
  const out: MediaQuality[] = [];
  const sorted = [...(list ?? [])]
    .filter((v) => v?.url)
    .sort((a, b) => num(b.height) - num(a.height) || num(b.width) - num(a.width));
  for (const v of sorted) {
    const h = num(v.height);
    if (h && seen.has(h)) continue;
    if (h) seen.add(h);
    out.push({ label: h ? `${h}p` : 'HD', url: v.url, width: v.width, height: v.height });
  }
  return out.slice(0, 4);
}

/* ───────────── shape converters: web GraphQL node → MediaItem ───────────── */

function graphNodeToMedia(n: Any): MediaItem | null {
  const isVideo = Boolean(n?.is_video || n?.video_url);
  const image: string =
    n?.display_url || n?.display_resources?.[n?.display_resources?.length - 1]?.src || n?.thumbnail_src || '';
  const url: string = isVideo ? n?.video_url : image;
  if (!url) return null;
  const width = n?.dimensions?.width;
  const height = n?.dimensions?.height;
  return {
    type: isVideo ? 'video' : 'image',
    url,
    thumbnail: image || url,
    width,
    height,
    qualities: [{ label: isVideo ? 'HD' : 'Original', url, width, height }],
    audioUrl: isVideo ? audioFromDash(n?.dash_info?.video_dash_manifest || n?.video_dash_manifest) : undefined,
  };
}

/* ───────────── shape converters: mobile API item → MediaItem ───────────── */

function mobileItemToMedia(it: Any): MediaItem | null {
  const videos: Any[] | undefined = it?.video_versions;
  const cands: Any[] | undefined = it?.image_versions2?.candidates;
  const isVideo = it?.media_type === 2 || Boolean(videos?.length);
  const url: string | undefined = isVideo ? videos?.[0]?.url : cands?.[0]?.url;
  if (!url) return null;
  const thumb = cands?.[0]?.url || url;
  const qualities = isVideo
    ? uniqueByHeight(videos)
    : (cands ?? [])
        .filter((c) => c?.url)
        .slice(0, 3)
        .map((c, i) => ({ label: i === 0 ? 'Original' : `${c.width}px`, url: c.url, width: c.width, height: c.height }));
  return {
    type: isVideo ? 'video' : 'image',
    url,
    thumbnail: thumb,
    width: it?.original_width,
    height: it?.original_height,
    qualities: qualities.length ? qualities : undefined,
    audioUrl: isVideo ? audioFromDash(it?.video_dash_manifest) : undefined,
  };
}

function buildResult(
  shortcode: string,
  engine: string,
  media: MediaItem[],
  extra: Partial<ExtractResult> & { caption?: string; username?: string }
): ExtractResult | null {
  if (!media.length) return null;
  const caption = extra.caption ?? '';
  return {
    shortcode,
    type: media.length > 1 ? 'carousel' : media[0].type,
    username: extra.username || 'instagram_user',
    fullName: extra.fullName,
    caption,
    hashtags: uniq(caption.match(HASHTAG_RE) ?? []),
    mentions: uniq(caption.match(MENTION_RE) ?? []),
    thumbnail: media[0].thumbnail,
    media,
    likes: extra.likes,
    commentCount: extra.commentCount,
    views: extra.views,
    takenAt: extra.takenAt,
    durationSeconds: extra.durationSeconds,
    comments: extra.comments,
    engine,
  };
}

/** Web GraphQL shape (xdt_shortcode_media / shortcode_media) → ExtractResult */
function graphNodeToResult(node: Any, shortcode: string, engine: string): ExtractResult | null {
  const children: Any[] = node?.edge_sidecar_to_children?.edges?.map((e: Any) => e?.node) ?? [];
  const media = (children.length ? children : [node]).map(graphNodeToMedia).filter(Boolean) as MediaItem[];

  const commentEdges: Any[] =
    node?.edge_media_to_parent_comment?.edges ?? node?.edge_media_to_comment?.edges ?? node?.edge_media_preview_comment?.edges ?? [];
  const comments: PostComment[] = commentEdges
    .map((e) => e?.node)
    .filter((c) => c?.text)
    .map((c) => ({
      username: c?.owner?.username || 'user',
      text: String(c.text),
      likes: typeof c?.edge_liked_by?.count === 'number' ? c.edge_liked_by.count : undefined,
      takenAt: c?.created_at,
    }));

  return buildResult(shortcode, engine, media, {
    caption: textOfCaption(node),
    username: node?.owner?.username,
    fullName: node?.owner?.full_name,
    likes: node?.edge_media_preview_like?.count ?? node?.edge_liked_by?.count,
    commentCount: node?.edge_media_to_parent_comment?.count ?? node?.edge_media_to_comment?.count,
    views: node?.video_view_count ?? node?.video_play_count,
    takenAt: node?.taken_at_timestamp,
    durationSeconds: node?.video_duration,
    comments: comments.length ? comments : undefined,
  });
}

/** Mobile API shape (media/info → items[0]) → ExtractResult */
function mobileItemToResult(item: Any, shortcode: string, engine: string): ExtractResult | null {
  const kids: Any[] = Array.isArray(item?.carousel_media) ? item.carousel_media : [];
  const media = (kids.length ? kids : [item]).map(mobileItemToMedia).filter(Boolean) as MediaItem[];
  return buildResult(shortcode, engine, media, {
    caption: textOfCaption(item),
    username: item?.user?.username,
    fullName: item?.user?.full_name,
    likes: item?.like_count,
    commentCount: item?.comment_count,
    views: item?.play_count ?? item?.view_count,
    takenAt: item?.taken_at,
    durationSeconds: item?.video_duration,
  });
}

/** Old engines (embed / resolvers / cobalt) return {author, media[{url,thumbnail,type}]} */
function legacyToCore(r: Any): ExtractResult | null {
  if (!r?.success || !Array.isArray(r.media)) return null;
  const media: MediaItem[] = r.media
    .filter((m: Any) => m?.url)
    .map((m: Any) => ({
      type: m.type === 'video' ? 'video' : 'image',
      url: m.url,
      thumbnail: m.thumbnail || m.url,
      width: m.width,
      height: m.height,
      qualities: [{ label: m.type === 'video' ? 'HD' : 'Original', url: m.url }],
    }));
  return buildResult(r.shortcode, r.engine || 'legacy', media, {
    caption: r.caption || '',
    username: r.author?.username,
    fullName: r.author?.fullName,
  });
}

/* ───────────────────────── post / reel engines ───────────────────────── */

type Cfg = Awaited<ReturnType<typeof getLiveConfig>>;

async function viaGraphql(shortcode: string, cfg: Cfg, cookie: string | null): Promise<ExtractResult | null> {
  const headers: Record<string, string> = {
    'User-Agent': cfg.userAgent,
    'X-IG-App-ID': cfg.appId,
    'X-FB-LSD': cfg.lsd,
    'X-ASBD-ID': '129477',
    Accept: '*/*',
    Origin: 'https://www.instagram.com',
    Referer: `https://www.instagram.com/p/${shortcode}/`,
  };
  if (cookie) headers.Cookie = cookie;

  const variables = JSON.stringify({ shortcode, fetch_tagged_user_count: null, hoisted_comment_id: null, hoisted_reply_id: null });

  // 1) POST (what the web app does)
  try {
    const res = await fetch(cfg.graphqlUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ variables, doc_id: cfg.docId, lsd: cfg.lsd }).toString(),
      signal: AbortSignal.timeout(7000),
      cache: 'no-store',
    });
    if (res.ok) {
      const json: Any = await res.json().catch(() => null);
      const node = json?.data?.xdt_shortcode_media ?? json?.data?.shortcode_media;
      const out = node ? graphNodeToResult(node, shortcode, 'graphql') : null;
      if (out) return out;
    }
  } catch {}

  // 2) GET variant (older doc_ids still answer this)
  try {
    const res = await fetch(
      `https://www.instagram.com/graphql/query/?doc_id=${encodeURIComponent(cfg.docId)}&variables=${encodeURIComponent(
        JSON.stringify({ shortcode })
      )}`,
      { headers, signal: AbortSignal.timeout(6000), cache: 'no-store' }
    );
    if (res.ok) {
      const json: Any = await res.json().catch(() => null);
      const node = json?.data?.xdt_shortcode_media ?? json?.data?.shortcode_media;
      return node ? graphNodeToResult(node, shortcode, 'graphql_get') : null;
    }
  } catch {}
  return null;
}

async function viaSessionMobile(shortcode: string, cookie: string): Promise<ExtractResult | null> {
  const pk = shortcodeToPk(shortcode);
  try {
    const res = await fetch(`https://i.instagram.com/api/v1/media/${pk}/info/`, {
      headers: {
        'User-Agent':
          'Instagram 319.0.0.38.109 (iPhone14,3; iOS 17_4; en_US; en-US; scale=3.00; 1284x2778; 576822237)',
        'X-IG-App-ID': '124024574287414',
        'X-ASBD-ID': '359341',
        'X-IG-WWW-Claim': '0',
        Cookie: cookie,
        Accept: '*/*',
      },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json: Any = await res.json().catch(() => null);
    const item = json?.items?.[0];
    return item ? mobileItemToResult(item, shortcode, 'session_mobile') : null;
  } catch {
    return null;
  }
}

/** Provider-agnostic: handles ScrapeCreators / RapidAPI style responses. */
async function viaFallbackApi(canonicalUrl: string, shortcode: string, cfg: Cfg): Promise<ExtractResult | null> {
  if (!cfg.fallbackApiUrl) return null;
  const endpoint = cfg.fallbackApiUrl
    .replace('{url}', encodeURIComponent(canonicalUrl))
    .replace('{shortcode}', encodeURIComponent(shortcode));
  const headers: Record<string, string> = { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' };
  if (cfg.fallbackApiKey) headers[cfg.fallbackApiKeyHeader || 'x-api-key'] = cfg.fallbackApiKey;

  try {
    const res = await fetch(endpoint, { headers, signal: AbortSignal.timeout(12000), cache: 'no-store' });
    if (!res.ok) return null;
    const json: Any = await res.json().catch(() => null);
    if (!json) return null;
    const d: Any = json?.data ?? json;

    const node = d?.xdt_shortcode_media ?? d?.shortcode_media ?? d?.graphql?.shortcode_media;
    if (node) return graphNodeToResult(node, shortcode, 'fallback_api');

    const item = d?.items?.[0] ?? json?.items?.[0];
    if (item) return mobileItemToResult(item, shortcode, 'fallback_api');

    // Generic "download links" shape
    const list: Any[] = d?.media ?? d?.medias ?? d?.result ?? d?.urls ?? [];
    const media: MediaItem[] = (Array.isArray(list) ? list : [])
      .map((m: Any) => {
        const url: string | undefined = m?.url || m?.download_url || m?.video_url || m?.image_url || m?.display_url;
        if (!url) return null;
        const isVid = m?.type === 'video' || /\.mp4(\?|$)/i.test(url) || Boolean(m?.video_url);
        return {
          type: isVid ? 'video' : 'image',
          url,
          thumbnail: m?.thumbnail || m?.thumb || m?.display_url || url,
        } as MediaItem;
      })
      .filter(Boolean) as MediaItem[];
    if (!media.length && (d?.video_url || d?.display_url)) {
      const m = graphNodeToMedia(d);
      if (m) media.push(m);
    }
    return buildResult(shortcode, 'fallback_api', media, {
      caption: typeof d?.caption === 'string' ? d.caption : textOfCaption(d),
      username: d?.owner?.username ?? d?.username ?? d?.user?.username,
    });
  } catch {
    return null;
  }
}

/**
 * Post / reel / carousel / IGTV → ExtractResult.
 * Throws ExtractError('INVALID_URL' | 'EXTRACTOR_DOWN').
 */
export async function extract(inputUrl: string): Promise<ExtractResult> {
  const parsed = parseInstagramUrl(inputUrl);
  if (!parsed) {
    throw new ExtractError('Please paste a valid Instagram post, reel or video link.', 'INVALID_URL');
  }
  const { shortcode, canonicalUrl } = parsed;
  const cfg = await getLiveConfig();
  const cookie = sessionCookie();

  const direct = () =>
    firstSuccess<ExtractResult>([
      cookie ? safe(viaSessionMobile(shortcode, cookie)) : Promise.resolve(null),
      safe(viaGraphql(shortcode, cfg, cookie)),
    ]);
  const fallback = () => safe(viaFallbackApi(canonicalUrl, shortcode, cfg));

  for (const stage of cfg.useFallbackApi ? [fallback, direct] : [direct, fallback]) {
    const r = await stage();
    if (r) return r;
  }

  const cobaltInstance = process.env.COBALT_INSTANCE || null;
  const cobaltApiKey = process.env.COBALT_API_KEY || null;
  const last = await firstSuccess<ExtractResult>([
    safe(fetchViaInstagramEmbed(shortcode).then(legacyToCore)),
    safe(fetchViaPublicResolver(canonicalUrl, shortcode, 'instagram').then(legacyToCore)),
    cobaltInstance
      ? safe(fetchViaCobalt(canonicalUrl, shortcode, cobaltInstance, cobaltApiKey, 'instagram').then(legacyToCore))
      : Promise.resolve(null),
  ]);
  if (last) return last;

  throw new ExtractError(
    "We couldn't fetch this post right now. It may be private, or Instagram is blocking our server — please try again in a minute.",
    'EXTRACTOR_DOWN'
  );
}

/* ───────────────────────── profile / feed ───────────────────────── */

/** "@name", "name", or an instagram.com/name URL → clean username (else INVALID_USERNAME). */
export function normalizeUsername(input: string): string {
  let s = String(input ?? '').trim();
  const fromUrl = s.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  if (fromUrl) s = fromUrl[1];
  s = s.replace(/^@+/, '').replace(/[/?#].*$/, '');
  if (!/^[A-Za-z0-9._]{1,30}$/.test(s)) {
    throw new ExtractError('Please enter a valid Instagram username.', 'INVALID_USERNAME');
  }
  return s.toLowerCase();
}

async function fetchProfileUser(username: string, cfg: Cfg): Promise<Any> {
  const cookie = sessionCookie();

  const direct = async (): Promise<Any | null> => {
    const res = await fetch(cfg.webProfileInfoUrl + encodeURIComponent(username), {
      headers: {
        'User-Agent': cfg.userAgent,
        'X-IG-App-ID': cfg.appId,
        'X-ASBD-ID': '129477',
        Accept: '*/*',
        Referer: `https://www.instagram.com/${username}/`,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (res.status === 404) throw new ExtractError("This account doesn't exist.", 'NOT_FOUND');
    if (!res.ok) return null;
    const json: Any = await res.json().catch(() => null);
    return json?.data?.user ?? null;
  };

  const viaProvider = async (): Promise<Any | null> => {
    if (!cfg.fallbackProfileApiUrl) return null;
    const headers: Record<string, string> = { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' };
    if (cfg.fallbackApiKey) headers[cfg.fallbackApiKeyHeader || 'x-api-key'] = cfg.fallbackApiKey;
    const res = await fetch(cfg.fallbackProfileApiUrl.replace('{username}', encodeURIComponent(username)), {
      headers,
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json: Any = await res.json().catch(() => null);
    return json?.data?.user ?? json?.user ?? (json?.data?.username ? json.data : null);
  };

  for (const step of cfg.useFallbackApi ? [viaProvider, direct] : [direct, viaProvider]) {
    try {
      const u = await step();
      if (u) return u;
    } catch (e) {
      if (e instanceof ExtractError) throw e;
    }
  }
  throw new ExtractError(
    "Couldn't reach Instagram right now. Please try again in a minute.",
    'EXTRACTOR_DOWN'
  );
}

function userToProfile(u: Any, fallbackName: string): ProfileResult {
  return {
    username: u?.username || fallbackName,
    fullName: u?.full_name ?? '',
    userId: String(u?.id ?? u?.pk ?? ''),
    isPrivate: Boolean(u?.is_private),
    isVerified: Boolean(u?.is_verified),
    biography: u?.biography ?? '',
    followers: num(u?.edge_followed_by?.count ?? u?.follower_count),
    following: num(u?.edge_follow?.count ?? u?.following_count),
    posts: num(u?.edge_owner_to_timeline_media?.count ?? u?.media_count),
    profilePicHd: u?.profile_pic_url_hd ?? u?.hd_profile_pic_url_info?.url ?? u?.profile_pic_url ?? '',
  };
}

export async function extractProfile(usernameInput: string): Promise<ProfileResult> {
  const username = normalizeUsername(usernameInput);
  const cfg = await getLiveConfig();
  const user = await fetchProfileUser(username, cfg);
  return userToProfile(user, username);
}

export async function extractProfileFeed(usernameInput: string): Promise<ProfileFeedResult> {
  const username = normalizeUsername(usernameInput);
  const cfg = await getLiveConfig();
  const user = await fetchProfileUser(username, cfg);
  const profile = userToProfile(user, username);

  const tl = user?.edge_owner_to_timeline_media;
  const postsList: FeedPost[] = (tl?.edges ?? [])
    .map((e: Any) => e?.node)
    .filter((n: Any) => n?.shortcode)
    .map((n: Any): FeedPost => {
      const t = n.__typename;
      const type: FeedPost['type'] =
        t === 'GraphSidecar' || n.edge_sidecar_to_children
          ? 'carousel'
          : t === 'GraphVideo' || n.is_video
          ? 'video'
          : 'image';
      return {
        shortcode: n.shortcode,
        type,
        thumbnail: n.thumbnail_src || n.display_url || '',
        caption: textOfCaption(n),
        likes: num(n.edge_liked_by?.count ?? n.edge_media_preview_like?.count),
        comments: num(n.edge_media_to_comment?.count ?? n.edge_media_to_parent_comment?.count),
        takenAt: num(n.taken_at_timestamp),
        isPinned: Array.isArray(n.pinned_for_users) && n.pinned_for_users.length > 0,
      };
    });

  return { ...profile, postsList, hasMore: Boolean(tl?.page_info?.has_next_page) };
}

/* ───────────────────── stories & highlights (need a session) ───────────────────── */

const SESSION_NEEDED =
  'Stories and highlights need a logged-in Instagram session. The site owner must set INSTAGRAM_SESSION_ID in Vercel.';

async function reelItems(reelId: string): Promise<Any[]> {
  const cookie = sessionCookie();
  if (!cookie) throw new ExtractError(SESSION_NEEDED, 'STORY_UNSUPPORTED');
  const cfg = await getLiveConfig();
  let res: Response;
  try {
    res = await fetch(cfg.reelsMediaUrl + encodeURIComponent(reelId), {
      headers: {
        'User-Agent': cfg.userAgent,
        'X-IG-App-ID': cfg.appId,
        'X-ASBD-ID': '129477',
        Accept: '*/*',
        Cookie: cookie,
      },
      signal: AbortSignal.timeout(9000),
      cache: 'no-store',
    });
  } catch {
    throw new ExtractError('Instagram did not respond in time. Please try again.', 'EXTRACTOR_DOWN');
  }
  if (res.status === 401 || res.status === 403) {
    throw new ExtractError('The Instagram session has expired — the owner needs to refresh INSTAGRAM_SESSION_ID.', 'STORY_UNSUPPORTED');
  }
  if (!res.ok) throw new ExtractError('Instagram refused the request. Please try again later.', 'EXTRACTOR_DOWN');
  const json: Any = await res.json().catch(() => null);
  const reel = json?.reels?.[reelId] ?? json?.reels_media?.[0];
  return Array.isArray(reel?.items) ? reel.items : [];
}

function mobileItemToStory(it: Any): StoryItem | null {
  const m = mobileItemToMedia(it);
  if (!m) return null;
  return {
    id: it?.pk ? String(it.pk) : it?.id ? String(it.id).split('_')[0] : undefined,
    type: m.type,
    url: m.url,
    thumbnail: m.thumbnail,
    takenAt: num(it?.taken_at),
    qualities: m.qualities,
    audioUrl: m.audioUrl,
  };
}

export async function extractStories(usernameInput: string): Promise<StoriesResult> {
  const username = normalizeUsername(usernameInput);
  const profile = await extractProfile(username);
  if (!profile.userId) {
    throw new ExtractError("Couldn't look up this account's id. Please try again.", 'EXTRACTOR_DOWN');
  }
  const items = (await reelItems(profile.userId)).map(mobileItemToStory).filter(Boolean) as StoryItem[];
  if (!items.length) {
    throw new ExtractError('No active stories right now (stories disappear after 24 hours).', 'NO_STORIES');
  }
  return { username: profile.username, items };
}

export async function extractHighlights(usernameInput: string): Promise<HighlightsResult> {
  const cookie = sessionCookie();
  if (!cookie) throw new ExtractError(SESSION_NEEDED, 'STORY_UNSUPPORTED');
  const username = normalizeUsername(usernameInput);
  const cfg = await getLiveConfig();
  const profile = await extractProfile(username);
  if (!profile.userId) {
    throw new ExtractError("Couldn't look up this account's id. Please try again.", 'EXTRACTOR_DOWN');
  }
  let json: Any = null;
  try {
    const res = await fetch(cfg.highlightsTrayUrl.replace('{userId}', encodeURIComponent(profile.userId)), {
      headers: { 'User-Agent': cfg.userAgent, 'X-IG-App-ID': cfg.appId, 'X-ASBD-ID': '129477', Accept: '*/*', Cookie: cookie },
      signal: AbortSignal.timeout(9000),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('bad status');
    json = await res.json().catch(() => null);
  } catch {
    throw new ExtractError('Instagram refused the request. Please try again later.', 'EXTRACTOR_DOWN');
  }
  const albums: HighlightAlbum[] = (json?.tray ?? [])
    .filter((t: Any) => t?.id)
    .map((t: Any) => ({
      id: String(t.id),
      title: t.title || 'Highlight',
      cover: t.cover_media?.cropped_image_version?.url || t.cover_media?.thumbnail_src || '',
    }));
  if (!albums.length) throw new ExtractError('This account has no highlights.', 'NO_HIGHLIGHTS');
  return { username: profile.username, albums };
}

export async function extractHighlightItems(highlightId: string): Promise<StoryItem[]> {
  const raw = String(highlightId ?? '').trim();
  const id = /^highlight:\d+$/.test(raw) ? raw : /^\d+$/.test(raw) ? `highlight:${raw}` : '';
  if (!id) throw new ExtractError('Invalid highlight id.', 'INVALID_URL');
  const items = (await reelItems(id)).map(mobileItemToStory).filter(Boolean) as StoryItem[];
  if (!items.length) throw new ExtractError('This highlight is empty.', 'NO_STORIES');
  return items;
}
