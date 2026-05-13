"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type {
  SheetDifficulty,
  SheetEntry,
  SheetProvider,
} from "@/lib/curation";

const DIFFICULTY_OPTIONS: { value: SheetDifficulty; label: string }[] = [
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "上級" },
];

const PROVIDER_OPTIONS: { value: SheetProvider; label: string }[] = [
  { value: "scrib3d", label: "スクリブ3D" },
  { value: "general", label: "一般" },
];

type RowStatus = "idle" | "uploading" | "done" | "error";

type Row = {
  key: string;
  pdfFile: File;
  thumbFile: File | null;
  title: string;
  description: string;
  difficulty: SheetDifficulty;
  provider: SheetProvider;
  status: RowStatus;
  errorMessage?: string;
};

function deriveTitleFromFilename(name: string): string {
  return name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
}

async function uploadFile(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload-token",
  });
  return blob.url;
}

export function BulkUploadForm({
  onComplete,
}: {
  onComplete: (sheets: SheetEntry[]) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfPickerRef = useRef<HTMLInputElement>(null);

  function handlePdfPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newRows: Row[] = Array.from(files).map((f, i) => ({
      key: `${Date.now()}-${i}-${f.name}`,
      pdfFile: f,
      thumbFile: null,
      title: deriveTitleFromFilename(f.name),
      description: "",
      difficulty: "beginner",
      provider: "scrib3d",
      status: "idle",
    }));
    setRows((prev) => [...prev, ...newRows]);
    setError(null);
    if (pdfPickerRef.current) pdfPickerRef.current.value = "";
  }

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function clearAll() {
    setRows([]);
    setError(null);
  }

  async function submit() {
    setError(null);
    const empties = rows.filter((r) => !r.title.trim());
    if (empties.length > 0) {
      setError("タイトル未入力の行があります。");
      return;
    }
    setBusy(true);
    try {
      const items: Array<{
        title: string;
        description?: string;
        difficulty: SheetDifficulty;
        provider: SheetProvider;
        pdfUrl: string;
        thumbnailUrl?: string;
      }> = [];

      for (const row of rows) {
        updateRow(row.key, { status: "uploading", errorMessage: undefined });
        try {
          const pdfUrl = await uploadFile(row.pdfFile);
          let thumbnailUrl: string | undefined;
          if (row.thumbFile) {
            thumbnailUrl = await uploadFile(row.thumbFile);
          }
          items.push({
            title: row.title.trim(),
            description: row.description.trim() || undefined,
            difficulty: row.difficulty,
            provider: row.provider,
            pdfUrl,
            thumbnailUrl,
          });
          updateRow(row.key, { status: "done" });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "upload_failed";
          updateRow(row.key, { status: "error", errorMessage: msg });
          throw new Error(`「${row.title}」のアップロードに失敗: ${msg}`);
        }
      }

      const res = await fetch("/api/admin/sheets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          index?: number;
        };
        throw new Error(
          j.error
            ? `登録に失敗しました: ${j.error}${j.index != null ? `（${j.index + 1} 行目）` : ""}`
            : "登録に失敗しました",
        );
      }
      const json = (await res.json()) as { sheets: SheetEntry[] };
      onComplete(json.sheets);
      setRows([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">一括アップロード</h2>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            disabled={busy}
            className="text-xs text-ink-muted hover:text-ink disabled:opacity-50"
          >
            リセット
          </button>
        )}
      </div>

      <div>
        <label className="block">
          <span className="text-xs font-semibold text-ink">
            PDFファイル（複数選択可）
          </span>
          <input
            ref={pdfPickerRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handlePdfPick(e.target.files)}
            className="mt-1.5 block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-light file:text-brand-dark file:font-semibold hover:file:bg-brand-light/70"
          />
          <p className="mt-1 text-[11px] text-ink-muted">
            選んだPDFが下の表に並びます。タイトル・難易度・提供者・説明を行ごとに編集してから「一括登録」を押してください。
          </p>
        </label>
      </div>

      {rows.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">
            {rows.length} 件のファイル
          </p>
          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.key}
                className="rounded-2xl border border-black/10 bg-paper p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-ink-muted truncate">
                      {row.pdfFile.name} ({formatSize(row.pdfFile.size)})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={row.status} />
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      disabled={busy}
                      className="text-xs text-red-700 hover:bg-red-50 px-2 py-1 rounded-full disabled:opacity-50"
                    >
                      削除
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="block sm:col-span-3">
                    <span className="text-xs font-semibold text-ink">
                      タイトル<span className="text-red-500 ml-1">*</span>
                    </span>
                    <input
                      value={row.title}
                      onChange={(e) =>
                        updateRow(row.key, { title: e.target.value })
                      }
                      disabled={busy}
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink">難易度</span>
                    <select
                      value={row.difficulty}
                      onChange={(e) =>
                        updateRow(row.key, {
                          difficulty: e.target.value as SheetDifficulty,
                        })
                      }
                      disabled={busy}
                      className={inputCls}
                    >
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink">提供者</span>
                    <select
                      value={row.provider}
                      onChange={(e) =>
                        updateRow(row.key, {
                          provider: e.target.value as SheetProvider,
                        })
                      }
                      disabled={busy}
                      className={inputCls}
                    >
                      {PROVIDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink">
                      サムネ画像
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updateRow(row.key, {
                          thumbFile: e.target.files?.[0] ?? null,
                        })
                      }
                      disabled={busy}
                      className="mt-1.5 block w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-white file:text-ink file:font-semibold"
                    />
                    {row.thumbFile && (
                      <p className="mt-1 text-[10px] text-ink-muted truncate">
                        {row.thumbFile.name}
                      </p>
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-ink">説明</span>
                  <textarea
                    value={row.description}
                    onChange={(e) =>
                      updateRow(row.key, { description: e.target.value })
                    }
                    disabled={busy}
                    rows={2}
                    className={inputCls}
                  />
                </label>

                {row.errorMessage && (
                  <p className="text-xs text-red-600">{row.errorMessage}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {rows.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
          >
            {busy ? "アップロード中..." : `${rows.length} 件を一括登録`}
          </button>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand";

function StatusBadge({ status }: { status: RowStatus }) {
  if (status === "idle") return null;
  const map: Record<Exclude<RowStatus, "idle">, { label: string; cls: string }> = {
    uploading: { label: "アップロード中", cls: "bg-amber-100 text-amber-700" },
    done: { label: "完了", cls: "bg-green-100 text-green-700" },
    error: { label: "失敗", cls: "bg-red-100 text-red-700" },
  };
  const meta = map[status];
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
