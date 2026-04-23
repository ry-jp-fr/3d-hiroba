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

function seedManualKey(id: string): string | null {
  // Extract the underlying seed-manual identifier so that a migrated
  // pick ("pick:seed-manual-manual-001") and the original bundled manual
  // post ("manual:manual-001") can be recognized as the same work.
  const pickMatch = id.match(/^pick:seed-manual-(.+)$/);
  if (pickMatch) return pickMatch[1];
  const manualMatch = id.match(/^manual:(.+)$/);
  if (manualMatch) return manualMatch[1];
  return null;
}

export async function getGalleryData(): Promise<GalleryData> {
  const manual = getManualPosts();
  const picks = await getCurationPosts();
  const ig = await getInstagramPosts();
  const seen = new Set<string>();
  const pickIds = new Set(picks.map((p) => p.id));
  const pickSeedKeys = new Set(
    picks
      .map((p) => seedManualKey(p.id))
      .filter((k): k is string => k !== null),
  );
  const unpicked = [...manual, ...ig.posts].filter((p) => {
    if (seen.has(p.id) || pickIds.has(p.id)) return false;
    const key = seedManualKey(p.id);
    if (key && pickSeedKeys.has(key)) return false;
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
