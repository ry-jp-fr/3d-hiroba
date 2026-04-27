import Link from "next/link";
import { LogoMark } from "./LogoMark";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <LogoMark size={24} />
            <span className="font-bold">3Dひろば</span>
          </div>
          <p className="text-sm text-brand-dark font-semibold mb-2">
            できた！が、つながる。
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            3Dペンで生まれた「できた！」を、
            親子でみせあい、つながる参加型のひろば。
          </p>
        </div>
        <div className="text-sm">
          <h3 className="font-semibold mb-3">サイトマップ</h3>
          <ul className="space-y-2 text-ink-muted">
            <li><Link href="/" className="hover:text-ink">みんなの「できた！」</Link></li>
            <li><Link href="/about" className="hover:text-ink">3Dひろばとは</Link></li>
            <li><Link href="/partners" className="hover:text-ink">パートナー</Link></li>
            <li><Link href="/submit" className="hover:text-ink">「できた！」をみせる</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h3 className="font-semibold mb-3">公式パートナー</h3>
          <p className="text-ink-muted leading-relaxed">
            Scrib3D（スクリブ3D）は3Dひろばの公式パートナーです。
          </p>
        </div>
        <div className="text-sm">
          <h3 className="font-semibold mb-3">Legal</h3>
          <ul className="space-y-2 text-ink-muted">
            <li><Link href="/privacy" className="hover:text-ink">プライバシーポリシー</Link></li>
            <li><Link href="/contact" className="hover:text-ink">お問い合わせ</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 py-4 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} 3Dひろば
      </div>
    </footer>
  );
}
