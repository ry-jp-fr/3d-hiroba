import { readCuration } from "@/lib/curation";
import { BannerManager } from "./BannerManager";

export const dynamic = "force-dynamic";

export default async function BannersAdminPage() {
  const data = await readCuration();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          BANNERS
        </p>
        <h1 className="mt-2 text-2xl font-bold">トップページのバナーを管理</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          ヒーローとギャラリーの間に表示される横スクロールバナーを管理します。
          推奨画像サイズは 1200×400px（3:1）。この比率ならトリミングされずに
          全体が表示されます。バナーが 0 件のときはセクションごと非表示になります。
        </p>
      </div>
      <BannerManager initial={data.banners ?? []} />
    </div>
  );
}
