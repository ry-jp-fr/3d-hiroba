import type { Metadata } from "next";
import Link from "next/link";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { HAJIMEKATA_VIDEOS, MODEL_PAGES } from "@/lib/qr-pages";

// Purchaser-only page linked from LINE and printed materials. Kept out of
// search results and site navigation.
export const metadata: Metadata = {
  title: "3Dペンのはじめかた",
  robots: { index: false, follow: false },
};

export default function HajimekataPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          GETTING STARTED
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold">3Dペンのはじめかた</h1>
        <p className="mt-3 text-ink-muted leading-relaxed">
          彫刻家・渡邊一翔さんが、3Dペンの基本を5本の動画で解説しています。
          順番に見ながら、まずは1本の線から始めてみましょう。
        </p>
      </header>

      <ol className="space-y-10">
        {HAJIMEKATA_VIDEOS.map((video, i) => (
          <li key={i}>
            <h2 className="mb-3 font-bold text-lg">
              <span className="mr-2 text-brand-dark">{String(i + 1).padStart(2, "0")}</span>
              {video.title}
            </h2>
            <YouTubeEmbed youtubeId={video.youtubeId} title={video.title} vertical={video.vertical} />
            {video.description && (
              <p className="mt-2 text-sm text-ink-muted leading-relaxed whitespace-pre-line">
                {video.description}
              </p>
            )}
          </li>
        ))}
      </ol>

      <section className="mt-12 rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="font-bold text-lg">機種ごとの使い方</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {MODEL_PAGES.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/q/${m.slug}`}
                className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm font-semibold hover:text-brand-dark"
              >
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
