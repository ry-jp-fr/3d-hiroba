import { readCuration, type PickEntry } from "./curation";
import { effectiveLabelKind } from "./types";
import type { GalleryPost, PostSource } from "./types";

function pickToPost(pick: PickEntry): GalleryPost {
  const source: PostSource =
    pick.method === "instagram-url" ? "instagram-url" : "upload";
  // A thumbnail set on the pick is preferred for the gallery card regardless
  // of media type; otherwise fall back to the media url (for video this is
  // the poster source, for images the image itself).
  const imageUrl = pick.thumbnailUrl ?? pick.mediaUrl;
  // When an admin relabels an Instagram-embed pick as "投稿フォーム", we treat
  // it as our own post: we stop rendering the official Instagram embed (show
  // our own card instead, so label and visual match) and we drop the
  // permalink so the detail modal's "Instagramで見る" link disappears — a
  // 投稿フォーム post shouldn't send visitors to Instagram even if the pick
  // still stores the source URL.
  const isForm = effectiveLabelKind({ source, labelKind: pick.labelKind }) === "form";
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
    permalink: isForm ? undefined : pick.permalink,
    postedAt: pick.postedAt ?? pick.addedAt,
    pentaComment: pick.pentaComment,
    embedHtml: isForm ? undefined : pick.embedHtml,
    likeCount: pick.likeCount ?? 0,
    labelKind: pick.labelKind,
  };
}

export async function getCurationPosts(): Promise<GalleryPost[]> {
  const data = await readCuration();
  return data.picks.filter((p) => !p.hidden).map(pickToPost);
}

export async function getEnabledHashtags(): Promise<string[]> {
  const data = await readCuration();
  return data.hashtags.filter((h) => h.enabled).map((h) => h.tag);
}
