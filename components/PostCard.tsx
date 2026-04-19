import type { GalleryPost } from "@/lib/types";

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function PostCard({ post }: { post: GalleryPost }) {
  const sourceLabel = post.source === "instagram" ? "Instagram" : "ピックアップ";
  const sourceColor =
    post.source === "instagram"
      ? "bg-pink-100 text-pink-700"
      : "bg-brand-light text-brand-dark";

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <a
        href={post.permalink ?? "#"}
        target={post.permalink ? "_blank" : undefined}
        rel={post.permalink ? "noopener noreferrer" : undefined}
        className="block relative aspect-square overflow-hidden bg-paper"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageUrl}
          alt={post.title ?? post.caption ?? "3Dペン作品"}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${sourceColor}`}
        >
          {sourceLabel}
        </span>
      </a>
      <div className="p-4 flex-1 flex flex-col gap-2">
        {post.title && <h3 className="font-bold text-base">{post.title}</h3>}
        {post.caption && (
          <p className="text-sm text-ink-muted line-clamp-3">{post.caption}</p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-ink-muted">
          <span>
            {post.author ? (
              post.authorUrl ? (
                <a
                  href={post.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink"
                >
                  {post.author}
                </a>
              ) : (
                post.author
              )
            ) : (
              "—"
            )}
          </span>
          <span>{formatDate(post.postedAt)}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-ink-muted bg-paper px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
