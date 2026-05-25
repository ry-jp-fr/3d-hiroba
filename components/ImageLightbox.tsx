"use client";

import { useEffect, useRef } from "react";
import type { GalleryPost } from "@/lib/types";

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

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full h-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {hasEmbed ? (
          <div
            ref={embedRef}
            className="w-full max-w-md max-h-full overflow-y-auto bg-white rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.embedHtml ?? "" }}
          />
        ) : isVideo ? (
          <video
            src={post.videoUrl}
            poster={post.imageUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt={post.title ?? post.caption ?? "3Dペン作品"}
            className="w-full h-full object-contain"
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
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

        {!hasEmbed && post.title && (
          <div className="absolute bottom-4 left-4 right-4 max-w-sm">
            <p className="text-sm font-semibold text-white truncate">
              {post.title}
            </p>
          </div>
        )}

        {!hasEmbed && post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 bg-pink-500 hover:bg-pink-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            Instagramで見る
          </a>
        )}
      </div>
    </div>
  );
}
