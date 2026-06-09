import type { SubmissionEntry } from "@/lib/curation";

export function getSubmissionMediaUrls(s: SubmissionEntry): string[] {
  if (s.mediaUrls && s.mediaUrls.length > 0) return s.mediaUrls;
  if (s.imageUrl) return [s.imageUrl];
  return [];
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|qt)(\?|$)/i;

/** Best-effort guess from the URL extension. Client-safe (no network). */
export function inferMediaTypeFromUrl(
  url: string | undefined,
): "image" | "video" {
  return url && VIDEO_EXT.test(url) ? "video" : "image";
}
