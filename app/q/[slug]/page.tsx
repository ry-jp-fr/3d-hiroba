import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import {
  HAJIMEKATA_VIDEOS,
  LINE_XMAS_PATH,
  MODEL_PAGES,
  QR_REDIRECTS,
  WORK_PAGES,
  findQrContentPage,
} from "@/lib/qr-pages";

// Printed QR codes point here. Unknown slugs and redirect slugs are handled at
// request time, so a typo or a retired code lands somewhere useful instead of
// a 404.
export const dynamicParams = true;

export function generateStaticParams() {
  return [...MODEL_PAGES, ...WORK_PAGES].map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = findQrContentPage(slug);
  return {
    title: page?.title ?? "3Dひろば",
    robots: { index: false, follow: false },
  };
}

export default async function QrPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = QR_REDIRECTS[slug];
  if (target) redirect(target);

  const page = findQrContentPage(slug);
  if (!page) redirect("/");

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-6">
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          {page.kind === "model" ? "HOW TO USE" : "HOW TO MAKE"}
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold">{page.title}</h1>
        {page.description && (
          <p className="mt-3 text-ink-muted leading-relaxed whitespace-pre-line">
            {page.description}
          </p>
        )}
      </header>

      <YouTubeEmbed youtubeId={page.youtubeId} title={page.title} vertical={page.vertical} />

      {page.kind === "work" && (
        <section className="mt-8 rounded-2xl bg-brand-light p-6">
          <h2 className="font-bold text-lg">できたら「3Dひろば」でみせあおう</h2>
          <p className="mt-2 text-sm text-ink-muted leading-relaxed">
            完成した作品の写真を投稿すると、3Dひろばのギャラリーに載ります。
          </p>
          <Link
            href="/about#submit"
            className="mt-4 inline-flex items-center rounded-full bg-brand text-white px-5 py-2.5 font-semibold hover:bg-brand-dark"
          >
            作品を投稿する
          </Link>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="font-bold text-lg">LINEで「3Dペンのはじめかた」をプレゼント</h2>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
          彫刻家・渡邊一翔さんが、3Dペンの基本を{HAJIMEKATA_VIDEOS.length}本の動画で解説しています。
          スクリブ3Dジャパン公式LINEに登録すると届きます。
        </p>
        <a
          href={LINE_XMAS_PATH}
          className="mt-4 inline-flex items-center rounded-full bg-[#06c755] text-white px-5 py-2.5 font-semibold hover:opacity-90"
        >
          LINEで受け取る
        </a>
      </section>

      <section className="mt-10">
        <h2 className="font-bold text-lg mb-4">
          {page.kind === "work" ? "ほかの作品のつくりかた" : "作品のつくりかた"}
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {WORK_PAGES.filter((w) => w.slug !== page.slug).map((w) => (
            <li key={w.slug}>
              <Link
                href={`/q/${w.slug}`}
                className="block rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-semibold hover:text-brand-dark hover:shadow-sm transition"
              >
                {w.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
