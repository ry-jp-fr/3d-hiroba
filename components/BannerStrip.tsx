import type { BannerEntry } from "@/lib/curation";

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

export function BannerStrip({ banners }: { banners: BannerEntry[] }) {
  const items = banners.filter((b) => b.imageUrl);
  if (items.length === 0) return null;

  return (
    <section aria-label="お知らせバナー" className="mx-auto max-w-6xl px-5 pt-10">
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((banner) => {
          const frameCls =
            "snap-start shrink-0 w-[85%] sm:w-[560px] aspect-[3/1] rounded-2xl overflow-hidden bg-paper border border-black/5";
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
    </section>
  );
}
