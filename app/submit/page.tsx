import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "作品を投稿する",
  description: "3Dひろばへの作品投稿方法のご案内。",
};

export default function SubmitPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-semibold text-brand-dark tracking-widest mb-3">
        SUBMIT
      </p>
      <h1 className="text-3xl md:text-4xl font-bold leading-tight">
        作品を投稿する
      </h1>
      <p className="mt-6 text-ink-muted leading-relaxed">
        3Dひろばに作品を掲載する方法は 2 つあります。どちらも無料で、いつでも参加できます。
      </p>

      <ol className="mt-10 space-y-8">
        <li className="rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="font-bold text-xl">1. Instagramで #3dひろば を付けて投稿</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            公開アカウントで作品写真に{" "}
            <span className="font-semibold">#3dひろば</span>{" "}
            を付けて投稿してください。定期的に自動取得され、条件を満たすとギャラリーに掲載されます。
          </p>
        </li>
        <li className="rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="font-bold text-xl">2. ピックアップ枠への推薦</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            自信作や他の方の素敵な作品を見つけたら、SNSのDMやお問い合わせから推薦をお送りください。
            編集チームがレビューのうえ、ピックアップ枠に掲載します。
          </p>
        </li>
      </ol>

      <section className="mt-12 rounded-3xl bg-brand-light p-6">
        <h2 className="font-bold text-lg">掲載にあたってのお願い</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted list-disc list-inside">
          <li>ご自身で制作された作品、または権利者の許諾が得られている作品を投稿してください。</li>
          <li>
            写真のクレジットは Instagram のユーザー名・投稿リンクとともに表示します。
          </li>
          <li>
            掲載後の削除依頼は、元の投稿から削除またはサイト運営へご連絡ください。
          </li>
        </ul>
      </section>
    </article>
  );
}
