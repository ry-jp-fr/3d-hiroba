"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BannerEntry } from "@/lib/curation";

const SCROLL_STEP = 480 + 12; // banner width + gap

function isInternalLink(url: string): boolean {
  return url.startsWith("/");
}

function BannerImage({ banner }: { banner: BannerEntry }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={banner.imageUrl}
      alt={banner.alt ?? ""}
      loading="lazy"
      className="w-full h-full object-cover"
    />
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

export function BannerStrip({ banners }: { banners: BannerEntry[] }) {
  const items = banners.filter((b) => b.imageUrl);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScrollState, items.length]);

  function scrollByStep(dir: -1 | 1) {
    scrollerRef.current?.scrollBy({
      left: dir * SCROLL_STEP,
      behavior: "smooth",
    });
  }

  if (items.length === 0) return null;

  return (
    <section
      aria-label="お知らせバナー"
      className="mx-auto max-w-6xl px-5 pt-10"
    >
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((banner) => {
            const frameCls =
              "snap-start shrink-0 w-[85%] sm:w-[480px] aspect-[3/1] rounded-2xl overflow-hidden bg-paper border border-black/5";
            if (banner.linkUrl) {
              const internal = isInternalLink(banner.linkUrl);
              return (
                <a
                  key={banner.id}
                  href={banner.linkUrl}
                  target={internal ? undefined : "_blank"}
                  rel={internal ? undefined : "noopener noreferrer"}
                  className={`${frameCls} block transition-opacity hover:opacity-90`}
                >
                  <BannerImage banner={banner} />
                </a>
              );
            }
            return (
              <div key={banner.id} className={frameCls}>
                <BannerImage banner={banner} />
              </div>
            );
          })}
        </div>

        {canScrollLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-paper to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-paper to-transparent" />
        )}

        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByStep(-1)}
            aria-label="前のバナーへ"
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white text-ink shadow-md border border-black/5 hover:bg-paper transition-colors"
          >
            <Chevron dir="left" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByStep(1)}
            aria-label="次のバナーへ"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white text-ink shadow-md border border-black/5 hover:bg-paper transition-colors"
          >
            <Chevron dir="right" />
          </button>
        )}
      </div>
    </section>
  );
}
