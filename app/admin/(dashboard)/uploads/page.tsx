import { readCuration } from "@/lib/curation";
import { UploadManager } from "./UploadManager";

export const dynamic = "force-dynamic";

export default async function UploadsPage() {
  const data = await readCuration();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          MEDIA
        </p>
        <h1 className="mt-2 text-2xl font-bold">すべての作品を管理</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          Instagramを経由してアップロードした作品と、直接アップロードした画像や動画をここで一元管理できます。
          並び替えと削除ができます。
        </p>
      </div>
      <UploadManager initial={data.picks} />
    </div>
  );
}
