import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "「できた！」をみせよう",
  description:
    "3Dひろばに作品を掲載する方法のご案内。Instagram投稿で参加できます。",
};

export default function SubmitPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-semibold text-brand-dark tracking-widest mb-3">
        SUBMIT
      </p>
      <h1 className="text-3xl md:text-4xl font-bold leading-tight">
        できた！を、みせよう。
      </h1>
      <p className="mt-6 text-ink-muted leading-relaxed">
        上手につくれていなくても、まだ途中でも大丈夫。
        「できた！」とおもった瞬間を、そのまま投稿してください。
        親子で一緒につくった作品も大歓迎です。
      </p>

      <ol className="mt-10 space-y-8">
        <li className="rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="font-bold text-xl">1. Instagramで #3dひろば をつけて投稿</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            公開アカウントで作品写真に{" "}
            <span className="font-semibold">#3dひろば</span>{" "}
            をつけて投稿してください。定期的に自動取得され、条件を満たすとギャラリーに掲載されます。
          </p>
        </li>
        <li className="rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="font-bold text-xl">2. ピックアップ枠への推薦</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            自信の一本や、お子さんの力作。SNSのDMやお問い合わせから推薦をお送りください。
            編集チームがレビューのうえ、ピックアップ枠に掲載します。
          </p>
        </li>
      </ol>

      <section className="mt-12 rounded-3xl bg-brand-light p-6">
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          SPECIAL
        </p>
        <h2 className="mt-2 font-bold text-xl">
          きみの作品が、お店のモニターに映るかも。
        </h2>
        <p className="mt-3 text-sm text-ink leading-relaxed">
          3Dひろばに掲載された作品は、
          LOFT・東急ハンズなど全国の実店舗に設置されたモニターで
          紹介される可能性があります。
          「きみの作品、今日お店で映ってたよ」——
          そんな瞬間を親子で体験できるかもしれません。
        </p>
      </section>

      <section className="mt-12 rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="font-bold text-lg">掲載にあたってのお願い</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted list-disc list-inside">
          <li>ご自身・お子さんが制作された作品を投稿してください。</li>
          <li>
            写真のクレジットは Instagram のユーザー名・投稿リンクとともに表示します。
          </li>
          <li>
            お子さんの作品を投稿する場合は、保護者の方が投稿・管理してください。
            お顔や個人が特定できる情報が写り込まないようご配慮ください。
          </li>
          <li>
            掲載後の削除依頼は、元の投稿から削除またはサイト運営へご連絡ください。
            実店舗モニターからの掲載停止にも対応します。
          </li>
        </ul>
      </section>
    </article>
  );
}
