import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "パートナー",
  description: "3Dひろばの公式パートナー、Scrib3D（スクリブ3D）のご紹介。",
};

export default function PartnersPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-semibold text-brand-dark tracking-widest mb-3">
        PARTNERS
      </p>
      <h1 className="text-3xl md:text-4xl font-bold leading-tight">
        公式パートナー
      </h1>
      <p className="mt-6 text-ink-muted leading-relaxed">
        3Dひろばは、3Dペンを楽しむユーザー全体のためのオープンな場所です。
        そのうえで、コミュニティの運営をご支援いただいている公式パートナーをご紹介します。
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
          Scrib3Dは、初心者から上級者まで幅広く親しまれている3Dペンブランドです。
          3Dひろばの活動を公式パートナーとして支えていただいています。
        </p>
        <p className="mt-4 leading-relaxed text-ink-muted">
          3Dひろばは、Scrib3Dユーザーに限らず、すべての3Dペンユーザーに開かれた場所です。
          どのブランドのペンで制作した作品でも、歓迎します。
        </p>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        ※ パートナーシップに関するお問い合わせはサイト運営までご連絡ください。
      </p>
    </article>
  );
}
