"use client";

import { useEffect, useState } from "react";
import type { GalleryPost } from "@/lib/types";
import { PostCard } from "./PostCard";
import { ImageLightbox } from "./ImageLightbox";

function rawPickId(id: string): string {
  return id.startsWith("pick:") ? id.slice(5) : id;
}

export function Gallery({ posts }: { posts: GalleryPost[] }) {
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get("post");
    if (!postParam) return;
    const match = posts.find((p) => rawPickId(p.id) === postParam);
    if (!match) return;
    setSelectedPost(match);
    // Scroll the underlying card into view so closing the lightbox lands
    // the user on the post they followed the share link to.
    const el = document.getElementById(match.id);
    if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
  }, [posts]);

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center text-ink-muted">
        まだ作品が登録されていません。
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
