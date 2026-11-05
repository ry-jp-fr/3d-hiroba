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
  { title: "3Dペンの基本的な使い方", youtubeId: "-sbFaeNWPLc" },
  { title: "平面の書き方と基本のコツ", youtubeId: "EHPc0hXn-Xg" },
  { title: "コースターを作ってみよう", youtubeId: "zk258qpqshE" },
  { title: "ペン立てを作ってみよう", youtubeId: "OeNle3zRluA" },
];

export const MODEL_PAGES: QrModelPage[] = [
  { kind: "model", slug: "junior", name: "スクリブ3D ジュニア", title: "スクリブ3D ジュニアの使い方", youtubeId: "uj1zD9FAJzc", vertical: true },
  { kind: "model", slug: "basic", name: "スクリブ3D ベーシック", title: "スクリブ3D ベーシックの使い方", youtubeId: "Ka8AL-Xxe-0", vertical: true },
];

// One page per work, not per set, so a work reused in a later set keeps its QR.
export const WORK_PAGES: QrWorkPage[] = (
  [
    ["stick", "ステッキ", "rbj9LItD-oc"],
    ["penguin", "ペンギン", "IQXSk-9Mwak"],
    ["bangle", "バングル", "wNFOOPe6ZYs"],
    ["monstera", "モンステラ", "-1KJk5aBz4Y"],
    ["snowflake", "雪の結晶", "yOaheiPfer4"],
    ["tree", "ツリー", "LnXU5C7IKt8"],
    ["wreath", "リース", "yqE_Ghu5Yvw"],
    ["ornament", "ツリーオーナメント", "bR_GwzHpy5k"],
    ["apple", "りんご", "9GHGLlovX5I"],
    ["horse", "うま", "qQg-w6qEg0c"],
    ["reindeer", "トナカイ", "Vt099163OZk"],
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
// line-xmas: the Christmas sheet's LINE QR → エルメ QRコードアクション
// 「なぞりシート（クリスマス）」(tags なぞりシート購入, sends 特典_機種パネル).
export const QR_REDIRECTS: Record<string, string> = {
  "line-xmas": "https://s.lmes.jp/landing-qr/2011389441-xwbPjx45?uLand=EwXkpd",
};

export const LINE_XMAS_PATH = "/q/line-xmas";

export function findQrContentPage(slug: string): QrContentPage | undefined {
  return [...MODEL_PAGES, ...WORK_PAGES].find((p) => p.slug === slug);
}
