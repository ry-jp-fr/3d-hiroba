export type PostSource = "manual" | "instagram" | "instagram-url" | "upload";

export type MediaType = "image" | "video";

export type GalleryPost = {
  id: string;
  source: PostSource;
  title?: string;
  author?: string;
  authorUrl?: string;
  mediaType?: MediaType;
  imageUrl: string;
  videoUrl?: string;
  caption?: string;
  tags: string[];
  permalink?: string;
  postedAt?: string;
  pentaComment?: string;
};
