import type { CurationData } from "@/lib/curation";

/**
 * Collect every blob URL referenced anywhere in the curation data
 * (picks, submissions, sheets). Used to flag "orphan" blobs and to
 * decide whether a blob is safe to delete.
 */
export function collectUsedUrls(data: CurationData): Set<string> {
  const used = new Set<string>();
  const add = (url: string | undefined) => {
    if (url) used.add(url);
  };

  for (const p of data.picks) {
    add(p.mediaUrl);
    add(p.thumbnailUrl);
  }
  for (const s of data.submissions) {
    add(s.imageUrl);
    for (const u of s.mediaUrls ?? []) add(u);
  }
  for (const sheet of data.sheets) {
    add(sheet.pdfUrl);
    add(sheet.thumbnailUrl);
  }

  return used;
}
