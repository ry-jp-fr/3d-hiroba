import type { GalleryPost } from "@/lib/types";

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const SOURCE_META: Record<
  GalleryPost["source"],
  { label: string; className: string }
> = {
  manual: {
    label: "ピックアップ",
    className: "bg-brand-light text-brand-dark",
  },
  instagram: {
    label: "Instagram",
    className: "bg-pink-100 text-pink-700",
  },
  "instagram-url": {
    label: "Instagram",
    className: "bg-pink-100 text-pink-700",
  },
  upload: {
    label: "ピックアップ",
    className: "bg-brand-light text-brand-dark",
  },
};

export function PostCard({ post }: { post: GalleryPost }) {
  const meta = SOURCE_META[post.source];
  const isVideo = post.mediaType === "video" && post.videoUrl;

  const mediaInner = isVideo ? (
    <video
      src={post.videoUrl}
      poster={post.imageUrl}
      controls
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.imageUrl}
      alt={post.title ?? post.caption ?? "3Dペン作品"}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {isVideo ? (
        <div className="block relative aspect-square overflow-hidden bg-paper">
          {mediaInner}
          <span
            className={`absolute top-3 left-3 text-[11px] font-semibold px-2 py-1 rounded-full ${meta.className}`}
          >
            {meta.label}
          </span>
          {post.author && (
            <span className="absolute bottom-3 left-3 max-w-[80%] truncate text-xs font-semibold bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-ink">
              {post.author}
            </span>
          )}
        </div>
      ) : (
        <a
          href={post.permalink ?? "#"}
          target={post.permalink ? "_blank" : undefined}
          rel={post.permalink ? "noopener noreferrer" : undefined}
          className="block relative aspect-square overflow-hidden bg-paper"
        >
          {mediaInner}
          <span
            className={`absolute top-3 left-3 text-[11px] font-semibold px-2 py-1 rounded-full ${meta.className}`}
          >
            {meta.label}
          </span>
          {post.author && (
            <span className="absolute bottom-3 left-3 max-w-[80%] truncate text-xs font-semibold bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-ink">
              {post.author}
            </span>
          )}
        </a>
      )}
      <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2">
        {post.title && (
          <h3 className="font-bold text-sm sm:text-base">{post.title}</h3>
        )}
        {post.caption && (
          <p className="text-xs sm:text-sm text-ink-muted line-clamp-2">
            {post.caption}
          </p>
        )}
        <div className="mt-auto pt-1 flex items-center justify-between text-[11px] text-ink-muted">
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
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-ink-muted bg-paper px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {post.pentaComment && (
          <div className="mt-2 flex items-start gap-2 bg-brand-light/70 rounded-2xl px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/penta.png"
              alt=""
              aria-hidden
              className="w-7 h-7 rounded-full object-contain bg-white flex-shrink-0 mt-0.5 shadow-sm"
            />
            <p className="text-[11px] sm:text-xs text-ink leading-relaxed">
              {post.pentaComment}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
