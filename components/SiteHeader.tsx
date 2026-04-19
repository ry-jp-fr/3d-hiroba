import Link from "next/link";

const navItems = [
  { href: "/", label: "ギャラリー" },
  { href: "/about", label: "3Dひろばとは" },
  { href: "/partners", label: "パートナー" },
  { href: "/submit", label: "作品を投稿" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-black/5 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-8 w-8 rounded-full bg-brand"
          />
          <span className="font-bold text-lg tracking-wide">3Dひろば</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink-muted">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
