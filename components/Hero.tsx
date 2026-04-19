import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-semibold text-brand-dark tracking-widest mb-4">
            できた！って、うれしい。
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="text-brand">できた！</span>が、
            <br />
            つながる。
          </h1>
          <p className="mt-6 text-ink-muted leading-relaxed">
            3Dひろばは、3Dペンで生まれた「できた！」を
            親子でみせあい、ゆるやかにつながっていく参加型のひろばです。
            はじめての一本でも、まだ途中でも、
            「できてうれしい」を、そのまま持ってきてください。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#gallery"
              className="inline-flex items-center rounded-full bg-brand text-white px-5 py-2.5 font-semibold hover:bg-brand-dark transition-colors"
            >
              みんなの「できた！」をみる
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center rounded-full border border-ink/20 px-5 py-2.5 font-semibold hover:border-ink/60 transition-colors"
            >
              「できた！」をみせよう
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-brand-light via-white to-paper shadow-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/penta.png"
              alt="3Dひろば公式キャラクター「3Dぺんた」"
              className="absolute inset-0 w-full h-full object-contain p-6 drop-shadow-md"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 text-sm">
            <p className="font-semibold">#3dひろば</p>
            <p className="text-ink-muted">で「できた！」をシェア</p>
          </div>
          <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 text-sm">
            <p className="font-semibold">親子で楽しめる</p>
            <p className="text-ink-muted">初心者歓迎</p>
          </div>
        </div>
      </div>
    </section>
  );
}
