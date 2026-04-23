import { getManualPosts } from "./manual-posts";
import { getInstagramPosts } from "./instagram";
import { getCurationPosts } from "./curation-posts";
import type { GalleryPost } from "./types";

export type GalleryData = {
  posts: GalleryPost[];
  manualCount: number;
  instagramCount: number;
  pickCount: number;
  uploadCount: number;
  instagramUrlCount: number;
  instagramConfigured: boolean;
  instagramError?: string;
  hashtags: string[];
};

function byDateDesc(a: GalleryPost, b: GalleryPost) {
  const da = a.postedAt ? Date.parse(a.postedAt) : 0;
  const db = b.postedAt ? Date.parse(b.postedAt) : 0;
  return db - da;
}

export async function getGalleryData(): Promise<GalleryData> {
  const manual = getManualPosts();
  const picks = await getCurationPosts();
  const ig = await getInstagramPosts();
  const seen = new Set<string>();
  const pickIds = new Set(picks.map((p) => p.id));
  const unpicked = [...manual, ...ig.posts].filter((p) => {
    if (seen.has(p.id) || pickIds.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  unpicked.sort(byDateDesc);
  const combined = [...picks, ...unpicked];
  const uploadCount = picks.filter((p) => p.source === "upload").length;
  const instagramUrlCount = picks.filter(
    (p) => p.source === "instagram-url",
  ).length;
  return {
    posts: combined,
    manualCount: manual.length,
    instagramCount: ig.posts.length,
    pickCount: picks.length,
    uploadCount,
    instagramUrlCount,
    instagramConfigured: ig.configured,
    instagramError: ig.error,
    hashtags: ig.hashtags,
  };
}
