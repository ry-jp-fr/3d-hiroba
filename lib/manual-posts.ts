import type { GalleryPost } from "./types";

// The bundled posts in data/manual-posts.json are imported into the
// curation system (as picks) by migrateSeedManualPosts in lib/curation.ts
// on first read. Returning an empty array here ensures the gallery uses
// the curation store as the single source of truth so that deletions and
// reorders from the admin UI are honored.
export function getManualPosts(): GalleryPost[] {
  return [];
}
