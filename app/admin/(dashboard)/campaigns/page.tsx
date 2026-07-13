import { readCuration } from "@/lib/curation";
import { CampaignManager } from "./CampaignManager";

export const dynamic = "force-dynamic";

export default async function CampaignsAdminPage() {
  const data = await readCuration();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          CAMPAIGNS
        </p>
        <h1 className="mt-2 text-2xl font-bold">キャンペーンページを管理</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          イベントごとの概要ページを作成できます。公開すると
          <code className="mx-1">/campaign/スラッグ</code>
          で閲覧でき、トップページのバナーからリンクできます。
        </p>
      </div>
      <CampaignManager initial={data.campaigns ?? []} />
    </div>
  );
}
