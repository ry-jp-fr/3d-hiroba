import type { GalleryPost } from "@/lib/types";
import { PostCard } from "./PostCard";

export function Gallery({ posts }: { posts: GalleryPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center text-ink-muted">
        まだ作品が登録されていません。
      </div>
    );
  }
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
