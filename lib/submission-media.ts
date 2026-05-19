import type { SubmissionEntry } from "@/lib/curation";

export function getSubmissionMediaUrls(s: SubmissionEntry): string[] {
  if (s.mediaUrls && s.mediaUrls.length > 0) return s.mediaUrls;
  if (s.imageUrl) return [s.imageUrl];
  return [];
}
