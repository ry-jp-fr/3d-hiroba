import Link from "next/link";
import { DEFAULT_HERO, type HeroConfig } from "@/lib/curation";

export function Hero({ config }: { config?: HeroConfig }) {
  const hero = config ?? DEFAULT_HERO;
  const titleRestLines = hero.titleRest.split("\n");

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-semibold text-brand-dark tracking-widest mb-4">
            {hero.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="text-brand">{hero.titleAccent}</span>
            {titleRestLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 text-ink-muted leading-relaxed whitespace-pre-line">
            {hero.description}
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
        <div className="relative aspect-square">
          <figure className="absolute top-0 left-0 w-[72%] aspect-square rounded-3xl overflow-hidden shadow-xl ring-4 ring-white rotate-[-2deg]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.photo1.imageUrl}
              alt={hero.photo1.alt ?? ""}
              className="w-full h-full object-cover"
            />
            {hero.photo1.author && (
              <figcaption className="absolute top-3 left-3 text-xs font-semibold bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-ink">
                {hero.photo1.author}
              </figcaption>
            )}
          </figure>

          <figure className="absolute bottom-0 right-0 w-[55%] aspect-square rounded-3xl overflow-hidden shadow-xl ring-4 ring-white rotate-[3deg]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.photo2.imageUrl}
              alt={hero.photo2.alt ?? ""}
              className="w-full h-full object-cover"
            />
            {hero.photo2.author && (
              <figcaption className="absolute top-3 left-3 text-xs font-semibold bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-ink">
                {hero.photo2.author}
              </figcaption>
            )}
          </figure>

          <div className="absolute top-[36%] right-[4%] w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-lg ring-4 ring-white flex items-center justify-center rotate-[8deg]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/penta.png"
              alt="3Dひろば公式キャラクター「3Dぺんた」"
              className="w-full h-full object-contain p-1.5"
            />
          </div>

          <div className="absolute -bottom-2 -left-2 bg-white rounded-2xl shadow-lg px-3 py-2 text-xs rotate-[-4deg]">
            <p className="font-bold text-brand-dark">#3dひろば</p>
            <p className="text-ink-muted text-[10px]">で「できた！」をシェア</p>
          </div>
        </div>
      </div>
    </section>
  );
}
