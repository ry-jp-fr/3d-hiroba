import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://3d-hiroba.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "3Dひろば | 3Dペンユーザーの作品ギャラリー",
    template: "%s | 3Dひろば",
  },
  description:
    "3Dペンで生まれた作品を集めたギャラリーコミュニティサイト。ブランドに縛られず、すべての3Dペンユーザーのための場所です。",
  openGraph: {
    title: "3Dひろば",
    description:
      "3Dペンで生まれた作品を集めたギャラリーコミュニティサイト。",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
