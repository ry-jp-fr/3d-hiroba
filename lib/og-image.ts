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
    const image = extractImageFromHtml(html);
    if (!image) {
      console.warn(`[og-image] no_image_found url=${url} html_length=${html.length}`);
      // Log meta tags and key snippets for debugging
      const metaTags = html.match(/<meta[^>]+>/gi)?.slice(0, 20).join("\n") ?? "(no meta tags)";
      console.warn(`[og-image] meta_tags=\n${metaTags}`);
      // Look for any image-like URLs in the HTML
      const imgRefs = html.match(/(?:cdn\.instagram|fbcdn|scontent)[^"'\s]+/g)?.slice(0, 10).join("\n") ?? "(no image refs)";
      console.warn(`[og-image] image_refs=\n${imgRefs}`);
      // Look for fbcdn or scontent patterns more broadly
      const cdnUrls = html.match(/https:\/\/[^"']*(?:fbcdn|scontent)[^"']*\.(jpg|jpeg|png|webp)/gi)?.slice(0, 5).join("\n") ?? "(no cdn urls)";
      console.warn(`[og-image] cdn_urls=\n${cdnUrls}`);
      // First 2000 chars
      console.warn(`[og-image] html_head=${html.substring(0, 2000)}`);
    }
    return image;
  } catch (err) {
    console.error(`[og-image] fetch_error url=${url}`, err);
    return null;
  }
}

function extractImageFromHtml(html: string): string | null {
  // Pattern 1: og:image (property before content)
  const og1 = html.match(
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
  );
  if (og1) {
    console.log(`[og-image] matched=og:image_v1`);
    return decodeHtmlEntities(og1[1]);
  }

  // Pattern 2: og:image (content before property - reversed attribute order)
  const og2 = html.match(
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
  );
  if (og2) {
    console.log(`[og-image] matched=og:image_v2`);
    return decodeHtmlEntities(og2[1]);
  }

  // Pattern 3: og:image:secure_url
  const ogSecure = html.match(
    /<meta\s+property=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i,
  );
  if (ogSecure) {
    console.log(`[og-image] matched=og:image:secure_url`);
    return decodeHtmlEntities(ogSecure[1]);
  }

  // Pattern 4: twitter:image
  const twitter = html.match(
    /<meta\s+(?:name|property)=["']twitter:image["']\s+content=["']([^"']+)["']/i,
  );
  if (twitter) {
    console.log(`[og-image] matched=twitter:image`);
    return decodeHtmlEntities(twitter[1]);
  }

  // Pattern 5: EmbeddedMediaImage class
  const embed = html.match(
    /class=["']EmbeddedMediaImage["'][^>]*\ssrc=["']([^"']+)["']/i,
  );
  if (embed) {
    console.log(`[og-image] matched=EmbeddedMediaImage`);
    return decodeHtmlEntities(embed[1]);
  }

  // Pattern 6: video poster (for Reels)
  const poster = html.match(
    /<video[^>]*\sposter=["']([^"']+)["']/i,
  );
  if (poster) {
    console.log(`[og-image] matched=video_poster`);
    return decodeHtmlEntities(poster[1]);
  }

  // Pattern 7: JSON display_url
  const display = html.match(/"display_url"\s*:\s*"([^"]+)"/);
  if (display) {
    console.log(`[og-image] matched=display_url`);
    return decodeJsonString(display[1]);
  }

  // Pattern 8: JSON thumbnail_src
  const thumb = html.match(/"thumbnail_src"\s*:\s*"([^"]+)"/);
  if (thumb) {
    console.log(`[og-image] matched=thumbnail_src`);
    return decodeJsonString(thumb[1]);
  }

  // Pattern 9: JSON thumbnail_url (oEmbed style)
  const thumbUrl = html.match(/"thumbnail_url"\s*:\s*"([^"]+)"/);
  if (thumbUrl) {
    console.log(`[og-image] matched=thumbnail_url`);
    return decodeJsonString(thumbUrl[1]);
  }

  // Pattern 10: JSON image_versions2 (Instagram internal format)
  const imgVer = html.match(/"image_versions2"[^}]*?"url"\s*:\s*"([^"]+)"/);
  if (imgVer) {
    console.log(`[og-image] matched=image_versions2`);
    return decodeJsonString(imgVer[1]);
  }

  // Pattern 11: link rel="image_src"
  const linkImg = html.match(
    /<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i,
  );
  if (linkImg) {
    console.log(`[og-image] matched=link_image_src`);
    return decodeHtmlEntities(linkImg[1]);
  }

  // Pattern 12: JSON "media_type":"image" with "image_url"
  const mediaUrl = html.match(/"media_type"\s*:\s*"image"[^}]*?"image_url"\s*:\s*"([^"]+)"/);
  if (mediaUrl) {
    console.log(`[og-image] matched=media_image_url`);
    return decodeJsonString(mediaUrl[1]);
  }

  // Pattern 13: Instagram edge_media_to_caption or similar node structure
  // Look for carousel_media or image info in node structure
  const nodeImage = html.match(/"node"\s*:\s*{[^}]*?"display_resources"[^}]*?"src"\s*:\s*"([^"]+)"/);
  if (nodeImage) {
    console.log(`[og-image] matched=node_display_resources`);
    return decodeJsonString(nodeImage[1]);
  }

  // Pattern 14: fbcdn image URL (Instagram owned, used for cached images)
  const fbcdnImage = html.match(/https?:\/\/[^"']*fbcdn\.net[^"']*\.(jpg|jpeg|png|webp)/i);
  if (fbcdnImage) {
    console.log(`[og-image] matched=fbcdn_url`);
    return fbcdnImage[0];
  }

  // Pattern 15: scontent.cdninstagram URL (direct Instagram CDN)
  const scontent = html.match(/https?:\/\/[^"']*scontent[^"']*\.(jpg|jpeg|png|webp)/i);
  if (scontent) {
    console.log(`[og-image] matched=scontent_url`);
    return scontent[0];
  }

  // Pattern 16: Look in script tags for JSON with image data
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    // Try to find any fbcdn or scontent URL in the script
    const urlInScript = scriptContent.match(/https?:\/\/[^"']*(?:fbcdn\.net|scontent[^"']*)\.[^"']*(?:jpg|jpeg|png|webp)/i);
    if (urlInScript) {
      console.log(`[og-image] matched=script_cdn_url`);
      return urlInScript[0];
    }
  }

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
