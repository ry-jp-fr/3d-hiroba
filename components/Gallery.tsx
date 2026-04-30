"use client";

import { useState } from "react";
import type { GalleryPost } from "@/lib/types";
import { PostCard } from "./PostCard";
import { ImageLightbox } from "./ImageLightbox";

export function Gallery({ posts }: { posts: GalleryPost[] }) {
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center text-ink-muted">
        まだ作品が登録されていません。
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-1 sm:gap-3 grid-cols-2">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onImageClick={setSelectedPost}
          />
        ))}
      </div>
      {selectedPost && (
        <ImageLightbox post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}
