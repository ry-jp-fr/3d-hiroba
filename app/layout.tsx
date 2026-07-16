import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { readCuration, DEFAULT_PARTNER_SECTION } from "@/lib/curation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.3d-hiroba.jp";

// Matches the ISR window used by app/page.tsx etc. Admin pages opt out via
// their own `export const dynamic = "force-dynamic"`, which takes precedence
// for those routes regardless of this layout-level setting.
export const revalidate = 3600;

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const curation = await readCuration();
  const partnerSection = curation.partnerSection ?? DEFAULT_PARTNER_SECTION;

  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter partnerSection={partnerSection} />
      </body>
    </html>
  );
}
