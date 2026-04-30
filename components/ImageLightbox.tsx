"use client";

import { useEffect } from "react";
import type { GalleryPost } from "@/lib/types";

export function ImageLightbox({
  post,
  onClose,
}: {
  post: GalleryPost;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const isVideo = post.mediaType === "video" && post.videoUrl;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full h-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
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

        {post.title && (
          <div className="absolute bottom-4 left-4 right-4 max-w-sm">
            <p className="text-sm font-semibold text-white truncate">
              {post.title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
