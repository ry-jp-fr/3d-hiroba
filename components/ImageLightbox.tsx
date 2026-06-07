"use client";

import { useEffect, useRef } from "react";
import type { GalleryPost } from "@/lib/types";
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
    existing.addEventListener("load", () => window.instgrm?.Embeds.process(), {
      once: true,
    });
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

export function ImageLightbox({
  post,
  onClose,
}: {
  post: GalleryPost;
  onClose: () => void;
}) {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (post.embedHtml) ensureInstagramEmbed();
  }, [post.embedHtml]);

  const isVideo = post.mediaType === "video" && post.videoUrl;
  const hasEmbed = Boolean(post.embedHtml);
  const hasMeta =
    !hasEmbed &&
    Boolean(
      post.title ||
        post.caption ||
        post.pentaComment ||
        post.author ||
        post.postedAt ||
        post.permalink,
    );

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
          aria-label="閉じる"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {hasEmbed ? (
          <div
            ref={embedRef}
            className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.embedHtml ?? "" }}
          />
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
              {isVideo ? (
                <video
                  src={post.videoUrl}
                  poster={post.imageUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[60vh] w-auto object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl}
                  alt={post.title ?? post.caption ?? "3Dペン作品"}
                  className="max-h-[60vh] w-auto object-contain"
                />
              )}
            </div>
            {hasMeta && (
              <div className="overflow-y-auto p-5 flex flex-col gap-3">
                {post.title && (
                  <h2 className="font-bold text-lg sm:text-xl leading-snug">
                    {post.title}
                  </h2>
                )}
                <div className="flex items-center justify-between text-xs text-ink-muted">
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
                    ) : null}
                  </span>
                  <span>{formatDate(post.postedAt)}</span>
                </div>
                {post.caption && (
                  <p className="text-sm sm:text-base text-ink leading-relaxed whitespace-pre-line">
                    {post.caption}
                  </p>
                )}
                {post.pentaComment && (
                  <PentaComment comment={post.pentaComment} />
                )}
                {post.permalink && (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start text-sm font-semibold text-pink-600 hover:text-pink-700"
                  >
                    Instagramで見る
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
