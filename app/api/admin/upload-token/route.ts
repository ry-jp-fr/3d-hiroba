import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/quicktime",
          "video/webm",
        ],
        maximumSizeInBytes: MAX_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("[upload-token] upload completed:", blob.url);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[upload-token] failed:", message);
    return NextResponse.json(
      { error: "token_generation_failed", message },
      { status: 500 },
    );
  }
}
