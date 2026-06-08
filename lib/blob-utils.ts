import { del } from "@vercel/blob";

export function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function safeDelBlob(url: string | undefined): Promise<void> {
  if (!url || !isBlobUrl(url)) return;
  try {
    await del(url);
  } catch (err) {
    console.warn("[blob-utils] delete failed:", err);
  }
}
