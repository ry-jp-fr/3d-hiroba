import { Hero } from "@/components/Hero";
import { FilterableGallery } from "@/components/FilterTabs";
import { getGalleryData } from "@/lib/posts";
import { readCuration, DEFAULT_HOMEPAGE } from "@/lib/curation";

export const revalidate = 3600;

export default async function HomePage() {
  const {
    posts,
    manualCount,
    pickCount,
    instagramCount,
    instagramConfigured,
  } = await getGalleryData();
  const curation = await readCuration();
  const homepage = curation.homepage || DEFAULT_HOMEPAGE;

  const pickupTotal = manualCount + pickCount;

  return (
    <>
      <Hero config={curation.hero} />
      <section id="gallery" className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {homepage.galleryTitle}
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              {homepage.gallerySubtitleLabel} {pickupTotal} 件 / Instagram 連携{" "}
              {instagramConfigured ? `${instagramCount} 件` : "未接続"}
            </p>
          </div>
          <p className="text-xs text-ink-muted max-w-md text-right">
            {homepage.galleryDescription}
          </p>
        </div>
        <FilterableGallery posts={posts} />
      </section>
    </>
  );
}
