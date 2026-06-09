import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { readCuration } from "@/lib/curation";
import { collectUsedUrls } from "@/lib/blob-usage";
import { inferMediaTypeFromUrl } from "@/lib/submission-media";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|heic)(\?|$)/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|qt)(\?|$)/i;

export type BlobMediaItem = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  mediaType: "image" | "video";
  used: boolean;
};

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "blob_not_configured", message: "Blob ストアが未設定です" },
      { status: 400 },
    );
  }

  const data = await readCuration();
  const used = collectUsedUrls(data);

  const items: BlobMediaItem[] = [];
  let cursor: string | undefined;
  do {
    const res = await list({ cursor, limit: 1000 });
    for (const b of res.blobs) {
      // Skip the curation JSON store and any non-media files.
      if (b.pathname.startsWith("curation/")) continue;
      const isImage = IMAGE_EXT.test(b.pathname);
      const isVideo = VIDEO_EXT.test(b.pathname);
      if (!isImage && !isVideo) continue;
      items.push({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt:
          typeof b.uploadedAt === "string"
            ? b.uploadedAt
            : new Date(b.uploadedAt).toISOString(),
        mediaType: isVideo ? "video" : inferMediaTypeFromUrl(b.url),
        used: used.has(b.url),
      });
    }
    cursor = res.cursor;
  } while (cursor);

  items.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));

  return NextResponse.json({ blobs: items });
}
