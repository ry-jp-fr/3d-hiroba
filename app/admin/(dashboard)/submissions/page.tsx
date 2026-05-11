import { readCuration } from "@/lib/curation";
import { SubmissionsManager } from "./SubmissionsManager";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const data = await readCuration();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          SUBMISSIONS
        </p>
        <h1 className="mt-2 text-2xl font-bold">投稿フォームからの応募</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          公式サイトの投稿フォーム（/about）から送られてきた応募の一覧です。内容を確認のうえ「承認」するとギャラリーに掲載されます。不要な応募は「削除」してください。
        </p>
      </div>
      <SubmissionsManager initial={data.submissions} />
    </div>
  );
}
