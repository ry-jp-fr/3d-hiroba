import raw from "@/data/manual-posts.json";
import type { GalleryPost } from "./types";

type RawManualPost = {
  id: string;
  title?: string;
  author?: string;
  authorUrl?: string;
  imageUrl: string;
  caption?: string;
  tags?: string[];
  permalink?: string;
  postedAt?: string;
};

export function getManualPosts(): GalleryPost[] {
  const entries = (raw as { posts: RawManualPost[] }).posts ?? [];
  return entries.map((p) => ({
    id: `manual:${p.id}`,
    source: "manual",
    title: p.title,
    author: p.author,
    authorUrl: p.authorUrl,
    imageUrl: p.imageUrl,
    caption: p.caption,
    tags: p.tags ?? [],
    permalink: p.permalink,
    postedAt: p.postedAt,
  }));
}
