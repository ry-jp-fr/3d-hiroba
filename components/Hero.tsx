import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-semibold text-brand-dark tracking-widest mb-4">
            3D PEN COMMUNITY GALLERY
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            3Dペンで<br />生まれた世界を、
            <span className="text-brand">ひろば</span>で。
          </h1>
          <p className="mt-6 text-ink-muted leading-relaxed">
            「3Dひろば」は、3Dペンを楽しむすべてのユーザーのためのギャラリーコミュニティです。
            ブランドを問わず、作品と出会い、作り手とつながれる場所を目指しています。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#gallery"
              className="inline-flex items-center rounded-full bg-brand text-white px-5 py-2.5 font-semibold hover:bg-brand-dark transition-colors"
            >
              作品を見る
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center rounded-full border border-ink/20 px-5 py-2.5 font-semibold hover:border-ink/60 transition-colors"
            >
              作品を投稿する
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand via-brand-light to-white shadow-xl" />
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 text-sm">
            <p className="font-semibold">#3dひろば</p>
            <p className="text-ink-muted">で投稿をシェア</p>
          </div>
          <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 text-sm">
            <p className="font-semibold">公式パートナー</p>
            <p className="text-ink-muted">Scrib3D</p>
          </div>
        </div>
      </div>
    </section>
  );
}
