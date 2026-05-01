import Link from "next/link";
import { LogoMark } from "./LogoMark";

const navItems = [
  { href: "/", label: "みんなの作品" },
  { href: "/about", label: "3Dひろばとは" },
  { href: "/about#submit", label: "できた！をみせる" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-black/5 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size={36} />
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
