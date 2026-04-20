export type PostSource = "manual" | "instagram";

export type GalleryPost = {
  id: string;
  source: PostSource;
  title?: string;
  author?: string;
  authorUrl?: string;
  imageUrl: string;
  caption?: string;
  tags: string[];
  permalink?: string;
  postedAt?: string;
  pentaComment?: string;
};
