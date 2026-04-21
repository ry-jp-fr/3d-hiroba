import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";
import { createId } from "@/lib/curation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_IMAGE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_VIDEO = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const MAX_BYTES = 30 * 1024 * 1024; // 30MB

function extForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "video/mp4":
      return "mp4";
    case "video/quicktime":
      return "mov";
    case "video/webm":
      return "webm";
    default:
      return "bin";
  }
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "invalid_content_type" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  const mime = file.type;
  const isImage = ALLOWED_IMAGE.has(mime);
  const isVideo = ALLOWED_VIDEO.has(mime);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "unsupported_type", mime },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "file_too_large", max: MAX_BYTES },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extForMime(mime);
  const filename = `${createId("upload")}.${ext}`;
  const destDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(destDir, { recursive: true });
  await fs.writeFile(path.join(destDir, filename), buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({
    url,
    mediaType: isVideo ? "video" : "image",
    size: file.size,
    mime,
  });
}
