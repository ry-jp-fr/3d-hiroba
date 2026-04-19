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
            <h2 className="text-2xl md:text-3xl font-bold">作品ギャラリー</h2>
            <p className="text-sm text-ink-muted mt-2">
              管理者ピックアップ {manualCount} 件 / Instagram 連携{" "}
              {instagramConfigured ? `${instagramCount} 件` : "未接続"}
            </p>
          </div>
          <p className="text-xs text-ink-muted">
            Instagramで <span className="font-semibold">#3dひろば</span> を付けて投稿すると、このギャラリーに掲載される可能性があります。
          </p>
        </div>
        <FilterableGallery posts={posts} />
      </section>
    </>
  );
}
