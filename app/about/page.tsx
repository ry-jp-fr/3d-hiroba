import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "3Dひろばとは",
  description:
    "3Dひろばは、3Dペンで生まれた「できた！」を親子でみせあい、つながる参加型のひろば。コンセプトと提供する価値のご紹介。",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-semibold text-brand-dark tracking-widest mb-3">
        ABOUT
      </p>
      <h1 className="text-3xl md:text-4xl font-bold leading-tight">
        3Dひろばについて
      </h1>

      <section className="mt-10 rounded-3xl bg-brand-light p-8">
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          CONCEPT
        </p>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold leading-snug">
          「できた！」が自然に集まり、<br />
          つくる喜びがつながっていく<br className="sm:hidden" />
          参加型のひろば。
        </h2>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">ひろばが届ける、4つの価値</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          <li className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-brand-dark font-bold">「できた！」を共有できる</p>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              できあがった瞬間の「みて！」を、
              家族以外の人にも届けられる場所です。
            </p>
          </li>
          <li className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-brand-dark font-bold">初心者でも参加できる</p>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              上手・下手は問いません。はじめての一本、
              途中の作品も、みんなの「できた！」です。
            </p>
          </li>
          <li className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-brand-dark font-bold">親子の会話が生まれる</p>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              「次は何つくる？」「この色きれいだね」。
              一緒に見ることで、会話のきっかけが増えます。
            </p>
          </li>
          <li className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-brand-dark font-bold">成長が見える</p>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              続けた分だけ上達していく過程も、ひろばに残ります。
              昨日の自分と今日の自分の「できた！」を見比べてみてください。
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-12 rounded-3xl border border-brand/20 bg-white p-8">
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          SPECIAL
        </p>
        <h2 className="mt-2 text-xl md:text-2xl font-bold">
          きみの「できた！」が、お店のモニターに映るかも。
        </h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          3Dひろばに掲載された作品は、
          LOFT・東急ハンズなど全国の実店舗に設置されたモニターで
          紹介される可能性があります。
          つくった「できた！」が、
          ひろばの外へ広がっていく瞬間を、親子でぜひ体験してください。
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">3つのコピー</h2>
        <dl className="mt-4 space-y-4">
          <div className="rounded-2xl bg-white border border-black/5 p-5">
            <dt className="text-xs font-semibold text-ink-muted tracking-widest">
              BRAND
            </dt>
            <dd className="mt-1 text-lg font-bold">できた！が、つながる。</dd>
          </div>
          <div className="rounded-2xl bg-white border border-black/5 p-5">
            <dt className="text-xs font-semibold text-ink-muted tracking-widest">
              EMOTION
            </dt>
            <dd className="mt-1 text-lg font-bold">できた！って、うれしい。</dd>
          </div>
          <div className="rounded-2xl bg-white border border-black/5 p-5">
            <dt className="text-xs font-semibold text-ink-muted tracking-widest">
              ACTION
            </dt>
            <dd className="mt-1 text-lg font-bold">できた！を、みせよう。</dd>
          </div>
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">参加のしかた</h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Instagramで{" "}
          <span className="font-semibold">#3dひろば</span>{" "}
          を付けて作品写真を投稿するだけ。
          管理者が選んだ作品は、ピックアップとして掲載されます。
          詳しくは{" "}
          <Link href="/submit" className="text-brand-dark underline">
            投稿ページ
          </Link>
          をご覧ください。
        </p>
      </section>
    </article>
  );
}
