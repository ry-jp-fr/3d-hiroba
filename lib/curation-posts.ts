import { readCuration, type PickEntry } from "./curation";
import type { GalleryPost, PostSource } from "./types";

function pickToPost(pick: PickEntry): GalleryPost {
  const source: PostSource =
    pick.method === "instagram-url" ? "instagram-url" : "upload";
  const imageUrl =
    pick.mediaType === "video"
      ? pick.thumbnailUrl ?? pick.mediaUrl
      : pick.mediaUrl;
  return {
    id: `pick:${pick.id}`,
    source,
    title: pick.title,
    author: pick.author,
    authorUrl: pick.authorUrl,
    mediaType: pick.mediaType,
    imageUrl,
    videoUrl: pick.mediaType === "video" ? pick.mediaUrl : undefined,
    caption: pick.caption,
    tags: pick.tags ?? [],
    permalink: pick.permalink,
    postedAt: pick.postedAt ?? pick.addedAt,
    pentaComment: pick.pentaComment,
  };
}

export async function getCurationPosts(): Promise<GalleryPost[]> {
  const data = await readCuration();
  return data.picks.map(pickToPost);
}

export async function getEnabledHashtags(): Promise<string[]> {
  const data = await readCuration();
  return data.hashtags.filter((h) => h.enabled).map((h) => h.tag);
}
