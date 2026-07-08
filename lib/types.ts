export type PostSource = "manual" | "instagram" | "instagram-url" | "upload";

export type MediaType = "image" | "video";

// Which badge a post shows in the gallery. Derived from source by default
// but admins can override it per pick.
export type PostLabelKind = "form" | "instagram";

export type GalleryPost = {
  id: string;
  source: PostSource;
  title?: string;
  author?: string;
  authorUrl?: string;
  mediaType?: MediaType;
  imageUrl?: string;
  videoUrl?: string;
  caption?: string;
  tags: string[];
  permalink?: string;
  postedAt?: string;
  pentaComment?: string;
  embedHtml?: string;
  likeCount?: number;
  labelKind?: PostLabelKind;
};

export function effectiveLabelKind(
  post: Pick<GalleryPost, "source" | "labelKind">,
): PostLabelKind {
  if (post.labelKind) return post.labelKind;
  return post.source === "instagram" || post.source === "instagram-url"
    ? "instagram"
    : "form";
}
