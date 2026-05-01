import type { Metadata } from "next";
import { SubmissionForm } from "./SubmissionForm";

export const metadata: Metadata = {
  title: "3Dひろばとは",
  description:
    "3Dひろばは、3Dペンで生まれた「できた！」を集めて紹介する場所です。上手くなくても、途中でも、親子でも一人でも大歓迎。",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      {/* Section 1: 3Dひろばとは */}
      <section className="mb-16">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
          3Dひろばとは
        </h1>
        <p className="text-ink-muted leading-relaxed">
          3Dひろばは、3Dペンでつくった作品を集めて紹介する場所です。<br />
          はじめて作った作品も、親子で一緒につくった作品も、一人で挑戦した作品も大歓迎です。<br />
          上手にできた作品だけでなく、途中の作品や、まだ完成していない作品でもかまいません。<br />
          大切にしているのは、完成度ではなく、「できた！」と思えたその瞬間です。
        </p>
      </section>

      {/* Section 2: どんなできた！が掲載される？ */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          どんなできた！が掲載される？
        </h2>
        <p className="text-ink-muted leading-relaxed">
          掲載するのは、3Dペンでつくられた作品です。<br />
          キャラクター、乗りもの、アクセサリー、どうぶつ、食べもの、親子でつくった作品など、ジャンルは問いません。<br />
          完成した作品だけでなく、「ここまでできた」「はじめて形になった」と感じた作品も歓迎します。<br />
          お子さまの作品を送る場合は、保護者の方が投稿・管理してください。
        </p>
      </section>

      {/* Section 3: 3Dひろばにのると、どうなる？ */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          3Dひろばにのると、どうなる？
        </h2>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-brand-dark mb-6">
            あなたの「できた！」が活躍する
          </h3>
          <ul className="space-y-4">
            <li className="rounded-2xl border border-black/5 bg-white p-5">
              <p className="font-bold text-ink mb-2">Webサイトで作品が紹介される</p>
              <p className="text-sm text-ink-muted leading-relaxed">
                あなたの作品が3DひろばのWebサイトで紹介されます。
              </p>
            </li>
            <li className="rounded-2xl border border-black/5 bg-white p-5">
              <p className="font-bold text-ink mb-2">ぺんたくんがコメントします</p>
              <p className="text-sm text-ink-muted leading-relaxed">
                掲載された作品には、3Dひろば公式キャラクター「ぺんたくん」がコメントします。<br />
                作品のすごいところや、楽しいポイントを、ぺんたくんがやさしく紹介します。
              </p>
            </li>
            <li className="rounded-2xl border border-black/5 bg-white p-5">
              <p className="font-bold text-ink mb-2">全国のお店やイベントで紹介される可能性</p>
              <p className="text-sm text-ink-muted leading-relaxed">
                掲載作品は今後、全国のバラエティショップ、玩具店、家電量販店、イベント会場などでの展示・紹介に活用させていただく可能性があります。
              </p>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl bg-brand-light p-6">
          <h3 className="text-lg font-bold text-brand-dark mb-4">
            そして、みんなの役に立つ
          </h3>
          <p className="text-ink leading-relaxed">
            掲載された作品は、ほかの親子や、これから3Dペンに挑戦する人たちの「次のやってみたい！」や「これやりたい！」のヒントになります。<br />
            あなたの「できた！」が、誰かの新しい「できた！」を生み出すかもしれません。
          </p>
        </div>
      </section>

      {/* Section 4: 参加方法*/}
      <section id="submit" className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">参加方法</h2>

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="text-lg font-bold text-ink mb-3">
              1. Instagramでみせる
            </h3>
            <ul className="space-y-2 text-ink-muted text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="text-brand-dark font-bold">•</span>
                <span>Instagramで作品写真や動画を投稿する際に、<span className="font-semibold">#3dひろば</span> をつけて投稿してください。</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-dark font-bold">•</span>
                <span>掲載候補となった作品は、運営側で確認のうえ、3Dひろばに掲載させていただく場合があります。</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="text-lg font-bold text-ink mb-3">
              2. 応募フォームからみせる
            </h3>
            <ul className="space-y-2 text-ink-muted text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="text-brand-dark font-bold">•</span>
                <span>Instagramを使っていない方や、直接応募したい方は、下のフォームから作品を送ることができます。</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-dark font-bold">•</span>
                <span>完成作品だけでなく、途中の作品や「できた！」と思えた瞬間の写真・動画も歓迎します。</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Submission Form */}
      <section className="mb-16">
        <SubmissionForm />
      </section>

      {/* Section 6: 公式パートナーについて */}
      <section id="partner">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          公式パートナーについて
        </h2>
        <p className="text-ink-muted leading-relaxed">
          Scrib3D（スクリブ3D）は、3Dひろばの公式パートナーです。<br />
          3Dひろばは、Scrib3Dをはじめ、3Dペンでつくられた作品を広く歓迎しています。<br />
          ブランド、店舗、教育機関、イベント関係者で、パートナーシップに興味がある場合はお問い合わせください。
        </p>
      </section>
    </article>
  );
}
