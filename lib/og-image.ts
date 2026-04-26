import { put } from "@vercel/blob";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchInstagramOgImage(
  permalink: string,
): Promise<string | null> {
  const cleanUrl = permalink.replace(/\?.*$/, "").replace(/\/$/, "");
  const embedUrl = `${cleanUrl}/embed/captioned/`;

  const fromEmbed = await tryFetchAndExtract(embedUrl);
  if (fromEmbed) return fromEmbed;

  return await tryFetchAndExtract(permalink);
}

async function tryFetchAndExtract(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
      cache: "no-store",
      redirect: "follow",
    });
    if (!res.ok) {
      console.error(`[og-image] fetch_failed url=${url} status=${res.status}`);
      return null;
    }
    const html = await res.text();
    return extractImageFromHtml(html);
  } catch (err) {
    console.error(`[og-image] fetch_error url=${url}`, err);
    return null;
  }
}

function extractImageFromHtml(html: string): string | null {
  const og = html.match(
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
  );
  if (og) return decodeHtmlEntities(og[1]);

  const embed = html.match(
    /class=["']EmbeddedMediaImage["'][^>]*\ssrc=["']([^"']+)["']/i,
  );
  if (embed) return decodeHtmlEntities(embed[1]);

  const display = html.match(/"display_url"\s*:\s*"([^"]+)"/);
  if (display) return decodeJsonString(display[1]);

  const thumb = html.match(/"thumbnail_src"\s*:\s*"([^"]+)"/);
  if (thumb) return decodeJsonString(thumb[1]);

  return null;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function decodeJsonString(s: string): string {
  return s
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"');
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
