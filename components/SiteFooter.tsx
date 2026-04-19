import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span aria-hidden className="inline-block h-6 w-6 rounded-full bg-brand" />
            <span className="font-bold">3Dひろば</span>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">
            3Dペンで作品を楽しむすべての人のためのコミュニティギャラリー。
            ブランドに縛られず、自由に作品を見せ合える場所を目指しています。
          </p>
        </div>
        <div className="text-sm">
          <h3 className="font-semibold mb-3">サイトマップ</h3>
          <ul className="space-y-2 text-ink-muted">
            <li><Link href="/" className="hover:text-ink">ギャラリー</Link></li>
            <li><Link href="/about" className="hover:text-ink">3Dひろばとは</Link></li>
            <li><Link href="/partners" className="hover:text-ink">パートナー</Link></li>
            <li><Link href="/submit" className="hover:text-ink">作品を投稿</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h3 className="font-semibold mb-3">公式パートナー</h3>
          <p className="text-ink-muted leading-relaxed">
            Scrib3D（スクリブ3D）は3Dひろばの公式パートナーです。
          </p>
        </div>
      </div>
      <div className="border-t border-black/5 py-4 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} 3Dひろば
      </div>
    </footer>
  );
}
