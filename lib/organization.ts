// The company that runs 3Dひろば and 3Dひろばコラム, and its brand.
// The JSON-LD uses the same @id as scrib3dpen.jp and the column site, so search
// engines can tell that all three sites belong to one organization.

export const OPERATOR = {
  name: "スクリブ3Dジャパン",
  legalName: "株式会社Fermento Tokyo",
  brand: "スクリブ3D",
  url: "https://scrib3dpen.jp/",
};

const ORGANIZATION_ID = "https://scrib3dpen.jp/#organization";

export function siteJsonLd(siteUrl: string) {
  const base = siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: OPERATOR.name,
        alternateName: "SCRIB3D Japan",
        legalName: OPERATOR.legalName,
        url: OPERATOR.url,
        logo: "https://scrib3dpen.jp/cdn/shop/files/scrib3d-logo_400x158.png",
        email: "help@scrib3dpen.jp",
        address: {
          "@type": "PostalAddress",
          postalCode: "277-0871",
          addressRegion: "千葉県",
          addressLocality: "柏市",
          streetAddress: "若柴178番地4 柏の葉キャンパス148街区2 ショップ&オフィス棟 6F",
          addressCountry: "JP",
        },
        brand: { "@type": "Brand", name: "SCRIB3D", alternateName: "スクリブ3D" },
        sameAs: [
          "https://www.instagram.com/scrib3djp/",
          "https://www.youtube.com/channel/UCL4v3u9wNpDiY8F74FTIuJQ",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: "3Dひろば",
        url: `${base}/`,
        inLanguage: "ja",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}
