import { getManualPosts } from "./manual-posts";
import { getInstagramPosts } from "./instagram";
import type { GalleryPost } from "./types";

export type GalleryData = {
  posts: GalleryPost[];
  manualCount: number;
  instagramCount: number;
  instagramConfigured: boolean;
  instagramError?: string;
};

function byDateDesc(a: GalleryPost, b: GalleryPost) {
  const da = a.postedAt ? Date.parse(a.postedAt) : 0;
  const db = b.postedAt ? Date.parse(b.postedAt) : 0;
  return db - da;
}

export async function getGalleryData(): Promise<GalleryData> {
  const manual = getManualPosts();
  const ig = await getInstagramPosts();
  const seen = new Set<string>();
  const combined = [...manual, ...ig.posts].filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  combined.sort(byDateDesc);
  return {
    posts: combined,
    manualCount: manual.length,
    instagramCount: ig.posts.length,
    instagramConfigured: ig.configured,
    instagramError: ig.error,
  };
}
