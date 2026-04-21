"use client";

import { useMemo, useState } from "react";
import type { GalleryPost } from "@/lib/types";
import { Gallery } from "./Gallery";

type Filter = "all" | "pickup" | "instagram";

const tabs: { key: Filter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "pickup", label: "ピックアップ" },
  { key: "instagram", label: "Instagram" },
];

export function FilterableGallery({ posts }: { posts: GalleryPost[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(() => {
    if (filter === "all") return posts;
    if (filter === "pickup") {
      return posts.filter(
        (p) => p.source === "manual" || p.source === "upload",
      );
    }
    return posts.filter(
      (p) => p.source === "instagram" || p.source === "instagram-url",
    );
  }, [filter, posts]);

  return (
    <div>
      <div
        role="tablist"
        className="inline-flex rounded-full bg-white border border-black/5 p-1 mb-6"
      >
        {tabs.map((tab) => {
          const active = tab.key === filter;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <Gallery posts={filtered} />
    </div>
  );
}
