import type { Metadata } from "next";
import {
  readCuration,
  type SheetDifficulty,
  type SheetProvider,
} from "@/lib/curation";

export const metadata: Metadata = {
  title: "なぞりシート | 3Dひろば",
  description:
    "3Dペンで作品を作るときに使えるなぞりシート（PDF）の一覧です。お好きなシートをダウンロードして、印刷してご利用ください。",
};

export const revalidate = 3600;

const DIFFICULTY_LABEL: Record<SheetDifficulty, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

const PROVIDER_LABEL: Record<SheetProvider, string> = {
  scrib3d: "スクリブ3D",
  general: "一般",
};

export default async function SheetsPage() {
  const data = await readCuration();
  const sheets = data.sheets;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-10">
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          SHEETS
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold">なぞりシート</h1>
        <p className="mt-4 text-ink-muted leading-relaxed max-w-2xl">
          3Dペンで作品を作るときに使える「なぞりシート」です。<br />
          お好きなシートを選んでPDFをダウンロードし、印刷してご利用ください。
        </p>
      </header>

      {sheets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-ink-muted">
          まだシートがありません。
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sheets.map((sheet) => (
            <li key={sheet.id}>
              <a
                href={sheet.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-paper overflow-hidden flex items-center justify-center">
                  {sheet.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sheet.thumbnailUrl}
                      alt={sheet.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-ink-muted">
                      <span className="text-3xl font-bold">PDF</span>
                      <span className="text-xs">プレビューなし</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-light text-brand-dark">
                      {DIFFICULTY_LABEL[sheet.difficulty]}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-paper text-ink-muted">
                      {PROVIDER_LABEL[sheet.provider]}
                    </span>
                  </div>
                  <h2 className="font-bold text-base text-ink group-hover:text-brand-dark transition-colors">
                    {sheet.title}
                  </h2>
                  {sheet.description && (
                    <p className="mt-2 text-sm text-ink-muted leading-relaxed line-clamp-3">
                      {sheet.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs font-semibold text-brand-dark">
                    PDFを開く ↗
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
