import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://3d-hiroba.jp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "3Dひろば | できた！が、つながる。",
    template: "%s | 3Dひろば",
  },
  description:
    "3Dひろばは、3Dペンで生まれた「できた！」を親子でみせあい、つながる参加型のひろば。初心者でも、はじめての一本からどうぞ。",
  openGraph: {
    title: "3Dひろば | できた！が、つながる。",
    description:
      "3Dペンで生まれた「できた！」を親子でみせあい、つながる参加型のひろば。",
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
