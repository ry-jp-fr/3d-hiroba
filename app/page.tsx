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
  const homepage = curation.homepage ?? DEFAULT_HOMEPAGE;

  const pickupTotal = manualCount + pickCount;

  return (
    <>
      <Hero config={curation.hero} />
      <section id="gallery" className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">みんなの「できた！」</h2>
          <p className="text-ink-muted leading-relaxed max-w-2xl">
            3Dひろばは、3Dペンで生まれた「できた！」が集まる場所です。<br />
            上手くなくても、途中でも、親子でも一人でも大丈夫。
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <a
            href="/about#submit"
            className="inline-block rounded-full bg-brand text-white font-semibold px-8 py-3 text-base hover:bg-brand-dark transition-colors"
          >
            できた！をみせる
          </a>
        </div>

        <FilterableGallery posts={posts} />
      </section>
    </>
  );
}
