import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "3Dひろばとは",
  description:
    "3Dひろばは、ブランドに縛られず3Dペンを楽しむすべてのユーザーのためのギャラリーコミュニティです。",
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
      <p className="mt-6 text-ink-muted leading-relaxed">
        3Dひろばは、3Dペンを楽しむすべてのユーザーが集まる、ブランドに縛られないオープンなギャラリーコミュニティです。
        作品を「見てもらう場」「出会える場」「つながれる場」を目指して運営しています。
      </p>

      <h2 className="mt-12 text-xl font-bold">3つの特徴</h2>
      <ul className="mt-4 space-y-4 text-ink-muted leading-relaxed">
        <li>
          <strong className="text-ink">1. ブランドに依存しない</strong>
          <br />
          どの3Dペンを使っていても歓迎です。特定メーカーに縛られない、ユーザーのための場所です。
        </li>
        <li>
          <strong className="text-ink">2. 2つの掲載方法</strong>
          <br />
          Instagramで{" "}
          <span className="font-semibold">#3dひろば</span>{" "}
          を付けた投稿を自動で取得するほか、管理者が厳選したピックアップ作品も掲載します。
        </li>
        <li>
          <strong className="text-ink">3. シンプルで見やすい</strong>
          <br />
          作品が主役。余計な演出を省いたシンプルなデザインで、作品そのものを楽しめます。
        </li>
      </ul>

      <h2 className="mt-12 text-xl font-bold">参加のしかた</h2>
      <p className="mt-4 text-ink-muted leading-relaxed">
        Instagramで作品の写真に{" "}
        <span className="font-semibold">#3dひろば</span>{" "}
        を付けて投稿するだけ。自動取得に加え、管理者が直接ピックアップすることもあります。
        手動でピックアップしてほしい作品は{" "}
        <Link href="/submit" className="text-brand-dark underline">
          投稿ページ
        </Link>
        から推薦できます。
      </p>
    </article>
  );
}
