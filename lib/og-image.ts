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

// Used only by the manual thumbnail upload fallback flow — admin uploads
// an image file and we persist it to Vercel Blob so the gallery card has
// something to render for picks without an Instagram embed.
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
