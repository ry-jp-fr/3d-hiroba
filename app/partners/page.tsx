import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "パートナー",
  description:
    "3Dひろばの公式パートナー、Scrib3D（スクリブ3D）のご紹介と、全国の実店舗でのモニター掲載について。",
};

export default function PartnersPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-semibold text-brand-dark tracking-widest mb-3">
        PARTNERS
      </p>
      <h1 className="text-3xl md:text-4xl font-bold leading-tight">
        3Dひろばを支える仲間たち
      </h1>
      <p className="mt-6 text-ink-muted leading-relaxed">
        3Dひろばは、3Dペンを楽しむすべての親子に開かれた場所です。
        その活動を支えてくださっている公式パートナー、
        そして作品を広げてくださる実店舗をご紹介します。
      </p>

      <section className="mt-10 rounded-3xl border border-black/5 bg-white p-8">
        <div className="flex items-start gap-4">
          <div
            aria-hidden
            className="h-14 w-14 rounded-2xl bg-brand flex items-center justify-center text-white font-bold text-lg"
          >
            S3D
          </div>
          <div>
            <h2 className="text-2xl font-bold">Scrib3D（スクリブ3D）</h2>
            <p className="text-sm text-ink-muted mt-1">Official Partner</p>
          </div>
        </div>
        <p className="mt-6 leading-relaxed text-ink-muted">
          Scrib3Dは、初心者から上級者まで、幅広い年代に親しまれている3Dペンブランドです。
          3Dひろばの活動を公式パートナーとして支えていただいています。
        </p>
        <p className="mt-4 leading-relaxed text-ink-muted">
          3Dひろばはどのブランドのペンで制作した作品でも歓迎します。
          はじめての一本から、ぜひ「できた！」をみせてください。
        </p>
      </section>

      <section className="mt-10 rounded-3xl bg-brand-light p-8">
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          IN-STORE
        </p>
        <h2 className="mt-2 text-2xl font-bold">
          きみの「できた！」が、<br className="sm:hidden" />お店のモニターに。
        </h2>
        <p className="mt-4 leading-relaxed text-ink">
          3Dひろばに掲載された作品は、
          <strong>LOFT・東急ハンズ</strong>など
          全国の実店舗に設置されたモニターで紹介される可能性があります。
          画面ごしの「みて！」が、まちの本物のお店に広がっていく——
          そんな小さな誇らしい瞬間を、親子で味わってください。
        </p>
        <p className="mt-4 text-sm text-ink-muted">
          ※ 掲載店舗・時期は予告なく変更されることがあります。
          掲載停止のご希望は投稿ページに記載のご連絡先までお知らせください。
        </p>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        ※ パートナーシップに関するお問い合わせはサイト運営までご連絡ください。
      </p>
    </article>
  );
}
