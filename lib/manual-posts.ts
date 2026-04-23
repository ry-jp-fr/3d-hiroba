import raw from "@/data/manual-posts.json";
import type { GalleryPost } from "./types";

type RawManualPost = {
  id: string;
  title?: string;
  author?: string;
  authorUrl?: string;
  imageUrl: string;
  caption?: string;
  tags?: string[];
  permalink?: string;
  postedAt?: string;
  pentaComment?: string;
};

// These bundled manual posts are also imported into the curation system
// (as picks) by migrateSeedManualPosts in lib/curation.ts on first read.
// Once migrated, the dedup in lib/posts.ts filters these out so they don't
// appear twice. This function remains a safety fallback for cases where
// migration has not run yet.
export function getManualPosts(): GalleryPost[] {
  const entries = (raw as { posts: RawManualPost[] }).posts ?? [];
  return entries.map((p) => ({
    id: `manual:${p.id}`,
    source: "manual",
    title: p.title,
    author: p.author,
    authorUrl: p.authorUrl,
    imageUrl: p.imageUrl,
    caption: p.caption,
    tags: p.tags ?? [],
    permalink: p.permalink,
    postedAt: p.postedAt,
    pentaComment: p.pentaComment,
  }));
}
