import { readCuration } from "@/lib/curation";
import { InstagramUrlManager } from "./InstagramUrlManager";

export const dynamic = "force-dynamic";

export default async function InstagramUrlsPage() {
  const data = await readCuration();
  const picks = data.picks.filter((p) => p.method === "instagram-url");
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          INSTAGRAM URL
        </p>
        <h1 className="mt-2 text-2xl font-bold">URLで選定</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          個別のInstagram投稿URLを登録すると、その投稿をピンポイントで掲載できます。
          サムネ画像は Instagram oEmbed API から自動取得し、Vercel Blob に保存します。
          自動取得に失敗した場合は、フォールバックとして画像を手動アップロードできます。
        </p>
      </div>
      <InstagramUrlManager initial={picks} />
    </div>
  );
}
