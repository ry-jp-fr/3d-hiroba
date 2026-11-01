// Destinations for the QR codes printed on SCRIB3D products. The printed URLs
// (www.3d-hiroba.jp/q/<slug>, /hajimekata) must never change or 404; only the
// content below changes. A null youtubeId renders a "準備中" placeholder, so a
// page can go live before its video is uploaded.

export type QrVideo = {
  title: string;
  youtubeId: string | null;
  // Vertical (9:16) clips such as Shorts get a portrait frame.
  vertical?: boolean;
  description?: string;
};

export type QrModelPage = QrVideo & { kind: "model"; slug: string; name: string };
export type QrWorkPage = QrVideo & { kind: "work"; slug: string; name: string };
export type QrContentPage = QrModelPage | QrWorkPage;

// 「3Dペンのはじめかた」— 彫刻家・渡邊一翔さんの解説動画（YouTube限定公開）
export const HAJIMEKATA_VIDEOS: QrVideo[] = [
  { title: "はじめかた 1", youtubeId: null },
  { title: "はじめかた 2", youtubeId: null },
  { title: "はじめかた 3", youtubeId: null },
  { title: "はじめかた 4", youtubeId: null },
  { title: "はじめかた 5", youtubeId: null },
];

export const MODEL_PAGES: QrModelPage[] = [
  { kind: "model", slug: "junior", name: "スクリブ3D ジュニア", title: "スクリブ3D ジュニアの使い方", youtubeId: "vOknw6_SYeA", vertical: true },
  { kind: "model", slug: "basic", name: "スクリブ3D ベーシック", title: "スクリブ3D ベーシックの使い方", youtubeId: "xeJpzsRRgK0", vertical: true },
];

// One page per work, not per set, so a work reused in a later set keeps its QR.
export const WORK_PAGES: QrWorkPage[] = (
  [
    ["stick", "ステッキ", null],
    ["penguin", "ペンギン", "HKsl_tABYSE"],
    ["bangle", "バングル", "w80-BA95TFI"],
    ["monstera", "モンステラ", "qtZ1WLvKylA"],
    ["snowflake", "雪の結晶", "-aKEIgGJt8Q"],
    ["tree", "ツリー", null],
    ["wreath", "リース", null],
    ["ornament", "ツリーオーナメント", "wEaoWmoOKH4"],
    ["apple", "りんご", "lr0-5O12lrg"],
    ["horse", "うま", "Twl_pjs-mQQ"],
    ["reindeer", "トナカイ", "TuJFRVStDzw"],
  ] as const
).map(([slug, name, youtubeId]) => ({
  kind: "work",
  slug,
  name,
  title: `${name}のつくりかた`,
  youtubeId,
  vertical: true,
}));

// QR slugs that forward elsewhere (307, so the target can change any time).
// line-xmas: the Christmas sheet's LINE QR. Point it at the エルメ QRコード
// アクション URL for the sheet once that action exists.
export const QR_REDIRECTS: Record<string, string> = {
  "line-xmas": "https://line.me/R/ti/p/@084gqpja",
};

export const LINE_XMAS_PATH = "/q/line-xmas";

export function findQrContentPage(slug: string): QrContentPage | undefined {
  return [...MODEL_PAGES, ...WORK_PAGES].find((p) => p.slug === slug);
}
