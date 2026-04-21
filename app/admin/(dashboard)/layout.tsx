import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminPasswordEnabled, isAdminAuthed } from "@/lib/admin-auth";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = {
  title: "作品管理",
  description: "3Dひろば 作品管理ダッシュボード",
  robots: { index: false, follow: false },
};

const navItems = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/hashtags", label: "ハッシュタグ" },
  { href: "/admin/instagram-urls", label: "Instagram URL" },
  { href: "/admin/uploads", label: "手動アップロード" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authEnabled = adminPasswordEnabled();
  const authed = await isAdminAuthed();
  if (authEnabled && !authed) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-white border-b border-black/5">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="font-bold text-lg tracking-wide text-ink"
            >
              作品管理
            </Link>
            <span className="text-xs text-ink-muted">/ 3Dひろば</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              className="text-ink-muted hover:text-ink"
              target="_blank"
              rel="noopener noreferrer"
            >
              サイトを開く ↗
            </Link>
            {authEnabled && <LogoutButton />}
          </div>
        </div>
        <nav className="mx-auto max-w-6xl px-5 pb-3 flex flex-wrap gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-full text-ink-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
