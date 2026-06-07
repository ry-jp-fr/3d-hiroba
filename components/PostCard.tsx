"use client";

import { useEffect } from "react";
import type { GalleryPost } from "@/lib/types";
import { EngagementButtons } from "./EngagementButtons";
import { PentaComment } from "./PentaComment";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";

function ensureInstagramEmbed() {
  if (typeof window === "undefined") return;
  if (window.instgrm) {
    window.instgrm.Embeds.process();
    return;
  }
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${EMBED_SCRIPT_SRC}"]`,
  );
  if (existing) {
    existing.addEventListener(
      "load",
      () => window.instgrm?.Embeds.process(),
      { once: true },
    );
    return;
  }
  const s = document.createElement("script");
  s.src = EMBED_SCRIPT_SRC;
  s.async = true;
  s.onload = () => window.instgrm?.Embeds.process();
  document.body.appendChild(s);
}

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

function InstagramEmbedCard({ post }: { post: GalleryPost }) {
  useEffect(() => {
    ensureInstagramEmbed();
  }, [post.embedHtml]);

  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm flex flex-col">
      <div
        className="instagram-embed-wrap [&_.instagram-media]:!m-0 [&_.instagram-media]:!min-w-0 [&_.instagram-media]:!w-full"
        dangerouslySetInnerHTML={{ __html: post.embedHtml ?? "" }}
      />
      {post.pentaComment && (
        <div className="px-2 pb-2">
          <PentaComment comment={post.pentaComment} />
        </div>
      )}
    </article>
  );
}

export function PostCard({
  post,
  onImageClick,
}: {
  post: GalleryPost;
  onImageClick?: (post: GalleryPost) => void;
}) {
  if (post.embedHtml) {
    return <InstagramEmbedCard post={post} />;
  }

  const meta = SOURCE_META[post.source];
  const isVideo = post.mediaType === "video" && post.videoUrl;
  const pickId = post.id.startsWith("pick:") ? post.id.slice(5) : post.id;
  const shareUrl = `/#${post.id}`;
  const shareTitle = post.title ?? "3Dひろば の作品";

  const mediaInner = isVideo ? (
    <video
      src={post.videoUrl}
      poster={post.imageUrl}
      controls
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
    />
  ) : post.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.imageUrl}
      alt={post.title ?? post.caption ?? "3Dペン作品"}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  ) : (
    <div className="h-full w-full bg-paper" />
  );

  return (
    <article
      id={post.id}
      className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-md transition-shadow flex flex-col scroll-mt-24"
    >
      <div
        className="block relative aspect-[4/5] overflow-hidden bg-paper cursor-pointer"
        onClick={() => onImageClick?.(post)}
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
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-3">
          <EngagementButtons
            pickId={pickId}
            likeCount={post.likeCount ?? 0}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
          />
          {post.title && (
            <h3 className="font-bold text-sm sm:text-base leading-snug">
              {post.title}
            </h3>
          )}
          {post.caption && (
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-3 whitespace-pre-line">
              {post.caption}
            </p>
          )}
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
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
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
          {post.pentaComment && <PentaComment comment={post.pentaComment} />}
        </div>
      </div>
    </article>
  );
}
