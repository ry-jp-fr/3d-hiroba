import { head } from "@vercel/blob";
import type { PickMediaType } from "@/lib/curation";
import { inferMediaTypeFromUrl } from "@/lib/submission-media";

/**
 * Resolve whether a blob URL is an image or video by inspecting its
 * Content-Type via the Blob API. Falls back to the file-extension guess
 * (which fails for e.g. extension-less iOS uploads).
 *
 * Server-only: imports @vercel/blob and needs BLOB_READ_WRITE_TOKEN.
 */
export async function resolveMediaType(
  url: string | undefined,
): Promise<PickMediaType> {
  if (!url) return "image";
  try {
    const meta = await head(url);
    const ct = meta.contentType ?? "";
    if (ct.startsWith("video/")) return "video";
    if (ct.startsWith("image/")) return "image";
  } catch {
    // head() can fail for non-blob URLs (e.g. unsplash seeds) — fall through.
  }
  return inferMediaTypeFromUrl(url);
}
