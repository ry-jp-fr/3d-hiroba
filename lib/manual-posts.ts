import type { GalleryPost } from "./types";

// The bundled manual posts in data/manual-posts.json are now imported into
// the curation system (as picks) by migrateSeedManualPosts in lib/curation.ts.
// This function is kept for backward compatibility but returns no posts.
export function getManualPosts(): GalleryPost[] {
  return [];
}
