import { readCuration } from "@/lib/curation";
import { UploadManager } from "./UploadManager";

export const dynamic = "force-dynamic";

export default async function UploadsPage() {
  const data = await readCuration();
  const picks = data.picks.filter((p) => p.method === "manual-upload");
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          UPLOAD
        </p>
        <h1 className="mt-2 text-2xl font-bold">手動アップロード</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          Instagramを経由せず、画像や動画を直接アップロードして掲載できます。
          画像は最大30MB、動画はmp4 / mov / webmに対応しています。
          （アップロード先: <code>public/uploads/</code>）
        </p>
      </div>
      <UploadManager initial={picks} />
    </div>
  );
}
