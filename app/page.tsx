import { Hero } from "@/components/Hero";
import { FilterableGallery } from "@/components/FilterTabs";
import { getGalleryData } from "@/lib/posts";

export const revalidate = 3600;

export default async function HomePage() {
  const { posts, manualCount, instagramCount, instagramConfigured } =
    await getGalleryData();

  return (
    <>
      <Hero />
      <section id="gallery" className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              みんなの「できた！」
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              ピックアップ {manualCount} 件 / Instagram 連携{" "}
              {instagramConfigured ? `${instagramCount} 件` : "未接続"}
            </p>
          </div>
          <p className="text-xs text-ink-muted max-w-md text-right">
            Instagramで <span className="font-semibold">#3dひろば</span> をつけて投稿すると、
            このひろばに掲載される可能性があります。
            掲載作品は全国の実店舗モニターで紹介されることも。
          </p>
        </div>
        <FilterableGallery posts={posts} />
      </section>
    </>
  );
}
