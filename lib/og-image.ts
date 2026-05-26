import { put } from "@vercel/blob";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const OEMBED_ENDPOINT = "https://graph.facebook.com/v19.0/instagram_oembed";

export async function fetchInstagramEmbedHtml(
  permalink: string,
): Promise<string | null> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    console.error(
      "[og-image] missing_credentials FACEBOOK_APP_ID or FACEBOOK_APP_SECRET not set",
    );
    return null;
  }

  const accessToken = `${appId}|${appSecret}`;
  const url =
    `${OEMBED_ENDPOINT}?url=${encodeURIComponent(permalink)}` +
    `&access_token=${encodeURIComponent(accessToken)}` +
    `&omitscript=true&hidecaption=true&fields=html`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    });
    const body = await res.text();
    if (!res.ok) {
      console.error(
        `[og-image] oembed_failed status=${res.status} body=${body.substring(0, 500)}`,
      );
      return null;
    }
    const json = JSON.parse(body) as { html?: string };
    return json.html ?? null;
  } catch (err) {
    console.error(`[og-image] oembed_error`, err);
    return null;
  }
}

export async function fetchOgImageFromPublicPage(
  permalink: string,
): Promise<string | null> {
  // Strategy: try og:image meta on the canonical post page first; if that
  // page is gated by a login wall or returns an empty SPA shell (common
  // for unauthenticated server-side fetches), fall back to the public
  // /embed/ view, which is designed by Instagram to be embeddable across
  // origins and reliably contains the post image.
  const ogUrl = await tryOgImageOnPostPage(permalink);
  if (ogUrl) return ogUrl;

  const shortcode = extractShortcode(permalink);
  if (shortcode) {
    const embedUrl = await tryImageOnEmbedPage(shortcode);
    if (embedUrl) return embedUrl;
  }

  console.error(`[og-image] all_sources_failed permalink=${permalink}`);
  return null;
}

async function tryOgImageOnPostPage(
  permalink: string,
): Promise<string | null> {
  try {
    const res = await fetch(permalink, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[og-image] public_page_failed status=${res.status}`);
      return null;
    }
    const html = await res.text();
    const ogUrl = extractOgImage(html);
    if (!ogUrl) {
      console.warn(`[og-image] og_image_not_found permalink=${permalink}`);
      return null;
    }
    console.log(`[og-image] og_image_found url=${ogUrl}`);
    return ogUrl;
  } catch (err) {
    console.error(`[og-image] public_page_error`, err);
    return null;
  }
}

async function tryImageOnEmbedPage(
  shortcode: string,
): Promise<string | null> {
  const url = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[og-image] embed_page_failed status=${res.status}`);
      return null;
    }
    const html = await res.text();
    const imageUrl = extractEmbedImage(html);
    if (!imageUrl) {
      console.error(`[og-image] embed_image_not_found shortcode=${shortcode}`);
      return null;
    }
    console.log(`[og-image] embed_image_found url=${imageUrl}`);
    return imageUrl;
  } catch (err) {
    console.error(`[og-image] embed_page_error`, err);
    return null;
  }
}

function extractShortcode(permalink: string): string | null {
  const m = permalink.match(
    /instagram\.com\/(?:[^/?#]+\/)?(?:p|reel|tv)\/([A-Za-z0-9_-]+)/,
  );
  return m?.[1] ?? null;
}

function extractEmbedImage(html: string): string | null {
  const displayUrl = html.match(/"display_url":"([^"\\]*(?:\\.[^"\\]*)*)"/);
  if (displayUrl?.[1]) return decodeJsonString(displayUrl[1]);

  const embeddedImg = html.match(
    /<img[^>]+class=["']EmbeddedMediaImage["'][^>]+src=["']([^"']+)["']/i,
  );
  if (embeddedImg?.[1]) return decodeHtmlEntities(embeddedImg[1]);

  const ogOnEmbed = extractOgImage(html);
  if (ogOnEmbed) return ogOnEmbed;

  return null;
}

function decodeJsonString(s: string): string {
  return s
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/\\&/g, "&");
}

function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export async function downloadAndStoreImage(
  imageUrl: string,
  shortcode: string,
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return imageUrl;
  }

  const res = await fetch(imageUrl, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`image_download_failed_${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const ext = extForMime(contentType);
  const buffer = Buffer.from(await res.arrayBuffer());

  const blob = await put(`picks/${shortcode}.${ext}`, buffer, {
    access: "public",
    contentType,
    allowOverwrite: true,
  });
  return blob.url;
}

function extForMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "jpg";
}
