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
  // When an admin relabels an Instagram-embed pick as "投稿フォーム", we stop
  // rendering the official Instagram embed and show our own card instead, so
  // the label and the visual match. The embed HTML is kept in storage (the
  // detail lightbox / future relabel can still use it) but not surfaced here.
  const embedHtml =
    effectiveLabelKind({ source, labelKind: pick.labelKind }) === "form"
      ? undefined
      : pick.embedHtml;
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
    embedHtml,
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
