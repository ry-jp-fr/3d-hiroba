import { upload } from "@vercel/blob/client";

/**
 * Upload an image (File or generated Blob) to Vercel Blob via the admin
 * upload-token endpoint and return the public URL.
 */
export async function uploadImageBlob(
  source: File | Blob,
  filename: string,
): Promise<string> {
  const result = await upload(filename, source, {
    access: "public",
    handleUploadUrl: "/api/admin/upload-token",
  });
  return result.url;
}
