import { readCuration } from "@/lib/curation";
import { SheetsManager } from "./SheetsManager";

export const dynamic = "force-dynamic";

export default async function AdminSheetsPage() {
  const data = await readCuration();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          SHEETS
        </p>
        <h1 className="mt-2 text-2xl font-bold">なぞりシートを管理</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          3Dペンで使えるなぞりシートのPDFを登録できます。
          ここに登録したシートは
          <code className="mx-1">/sheets</code>
          ページで公開され、訪問者がダウンロード・閲覧できます。
        </p>
      </div>
      <SheetsManager initial={data.sheets} />
    </div>
  );
}
