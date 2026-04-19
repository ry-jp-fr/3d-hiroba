import type { GalleryPost } from "./types";

const GRAPH = "https://graph.facebook.com/v19.0";

type HashtagSearchResponse = { data?: { id: string }[] };

type MediaItem = {
  id: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  username?: string;
};

type MediaResponse = { data?: MediaItem[] };

function getConfig() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const hashtag = (process.env.INSTAGRAM_HASHTAG ?? "3dひろば").replace(/^#/, "");
  return { token, userId, hashtag };
}

async function fetchHashtagId(hashtag: string, userId: string, token: string) {
  const url = `${GRAPH}/ig_hashtag_search?user_id=${encodeURIComponent(userId)}&q=${encodeURIComponent(hashtag)}&access_token=${token}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const json = (await res.json()) as HashtagSearchResponse;
  return json.data?.[0]?.id ?? null;
}

async function fetchRecentMedia(
  hashtagId: string,
  userId: string,
  token: string,
): Promise<MediaItem[]> {
  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
  ].join(",");
  const url = `${GRAPH}/${hashtagId}/recent_media?user_id=${encodeURIComponent(userId)}&fields=${fields}&access_token=${token}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const json = (await res.json()) as MediaResponse;
  return json.data ?? [];
}

function extractTags(caption?: string): string[] {
  if (!caption) return [];
  const matches = caption.match(/#[^\s#ー-]+/g) ?? [];
  return matches.map((t) => t.replace(/^#/, ""));
}

export type InstagramFetchResult = {
  posts: GalleryPost[];
  configured: boolean;
  error?: string;
};

export async function getInstagramPosts(): Promise<InstagramFetchResult> {
  const { token, userId, hashtag } = getConfig();
  if (!token || !userId) {
    return { posts: [], configured: false };
  }
  try {
    const hashtagId = await fetchHashtagId(hashtag, userId, token);
    if (!hashtagId) return { posts: [], configured: true, error: "hashtag_not_found" };
    const media = await fetchRecentMedia(hashtagId, userId, token);
    const posts: GalleryPost[] = media
      .filter((m) => m.media_type !== "VIDEO" || m.thumbnail_url)
      .map<GalleryPost>((m) => ({
        id: `ig:${m.id}`,
        source: "instagram",
        imageUrl: (m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url) ?? "",
        caption: m.caption,
        tags: extractTags(m.caption),
        permalink: m.permalink,
        postedAt: m.timestamp,
      }))
      .filter((p) => p.imageUrl);
    return { posts, configured: true };
  } catch (err) {
    return {
      posts: [],
      configured: true,
      error: err instanceof Error ? err.message : "unknown_error",
    };
  }
}
