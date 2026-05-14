"use client";

import { FormEvent, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { upload } from "@vercel/blob/client";
import type {
  SheetDifficulty,
  SheetEntry,
  SheetProvider,
} from "@/lib/curation";
import { BulkUploadForm } from "./BulkUploadForm";

const DIFFICULTY_OPTIONS: { value: SheetDifficulty; label: string }[] = [
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "上級" },
];

const DIFFICULTY_LABEL: Record<SheetDifficulty, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

const PROVIDER_OPTIONS: { value: SheetProvider; label: string }[] = [
  { value: "scrib3d", label: "スクリブ3D" },
  { value: "general", label: "一般" },
];

const PROVIDER_LABEL: Record<SheetProvider, string> = {
  scrib3d: "スクリブ3D",
  general: "一般",
};

type FormState = {
  title: string;
  description: string;
  difficulty: SheetDifficulty;
  provider: SheetProvider;
};

const EMPTY: FormState = {
  title: "",
  description: "",
  difficulty: "beginner",
  provider: "scrib3d",
};

async function uploadFile(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload-token",
  });
  return blob.url;
}

export function SheetsManager({ initial }: { initial: SheetEntry[] }) {
  const [sheets, setSheets] = useState<SheetEntry[]>(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    difficulty: SheetDifficulty;
    provider: SheetProvider;
  } | null>(null);
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
  const [editThumbFile, setEditThumbFile] = useState<File | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sheets.findIndex((s) => s.id === active.id);
    const newIndex = sheets.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = sheets;
    const next = arrayMove(sheets, oldIndex, newIndex);
    setSheets(next);

    try {
      const res = await fetch("/api/admin/sheets", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ order: next.map((s) => s.id) }),
      });
      if (!res.ok) {
        setSheets(previous);
        setError("順序の保存に失敗しました");
      }
    } catch {
      setSheets(previous);
      setError("順序の保存に失敗しました");
    }
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pdfFile) {
      setError("PDFファイルを選択してください");
      return;
    }
    if (!form.title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    setBusy(true);
    try {
      const pdfUrl = await uploadFile(pdfFile);
      let thumbnailUrl: string | undefined;
      if (thumbFile) {
        thumbnailUrl = await uploadFile(thumbFile);
      }
      const res = await fetch("/api/admin/sheets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          difficulty: form.difficulty,
          provider: form.provider,
          pdfUrl,
          thumbnailUrl,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "create_failed");
      }
      const json = (await res.json()) as { sheets: SheetEntry[] };
      setSheets(json.sheets);
      setForm(EMPTY);
      setPdfFile(null);
      setThumbFile(null);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    } catch (err) {
      setError(
        err instanceof Error
          ? `登録に失敗しました: ${err.message}`
          : "登録に失敗しました",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(sheet: SheetEntry) {
    if (!confirm(`「${sheet.title}」を削除しますか？`)) return;
    const res = await fetch(
      `/api/admin/sheets?id=${encodeURIComponent(sheet.id)}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("削除に失敗しました");
      return;
    }
    const json = (await res.json()) as { sheets: SheetEntry[] };
    setSheets(json.sheets);
  }

  function startEdit(sheet: SheetEntry) {
    setEditingId(sheet.id);
    setEditForm({
      title: sheet.title,
      description: sheet.description ?? "",
      difficulty: sheet.difficulty,
      provider: sheet.provider,
    });
    setEditPdfFile(null);
    setEditThumbFile(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditPdfFile(null);
    setEditThumbFile(null);
    setError(null);
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        id: editingId,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        difficulty: editForm.difficulty,
        provider: editForm.provider,
      };
      if (editPdfFile) {
        payload.pdfUrl = await uploadFile(editPdfFile);
      }
      if (editThumbFile) {
        payload.thumbnailUrl = await uploadFile(editThumbFile);
      }
      const res = await fetch("/api/admin/sheets", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "update_failed");
      }
      const json = (await res.json()) as { sheets: SheetEntry[] };
      setSheets(json.sheets);
      cancelEdit();
    } catch (err) {
      setError(
        err instanceof Error
          ? `編集に失敗しました: ${err.message}`
          : "編集に失敗しました",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <BulkUploadForm onComplete={setSheets} />

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl border border-black/5 p-6 space-y-4"
      >
        <h2 className="font-bold text-lg">なぞりシートを追加</h2>

        <Field label="PDFファイル" required>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-light file:text-brand-dark file:font-semibold hover:file:bg-brand-light/70"
            required
          />
          {pdfFile && (
            <p className="mt-2 text-xs text-ink-muted">
              {pdfFile.name} ({formatSize(pdfFile.size)})
            </p>
          )}
        </Field>

        <Field
          label="サムネイル画像"
          hint="一覧で表示するプレビュー画像。任意ですが、登録すると見つけやすくなります。"
        >
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-paper file:text-ink file:font-semibold hover:file:bg-black/5"
          />
          {thumbFile && (
            <p className="mt-2 text-xs text-ink-muted">
              {thumbFile.name} ({formatSize(thumbFile.size)})
            </p>
          )}
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="タイトル" required>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder="ドラゴンのなぞりシート"
              required
            />
          </Field>
          <Field label="難易度" required>
            <select
              value={form.difficulty}
              onChange={(e) =>
                set("difficulty", e.target.value as SheetDifficulty)
              }
              className={inputCls}
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="提供者" required>
          <select
            value={form.provider}
            onChange={(e) =>
              set("provider", e.target.value as SheetProvider)
            }
            className={inputCls}
          >
            {PROVIDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="説明">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className={inputCls}
            placeholder="使い方やポイントを書いてください"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy || !pdfFile}
            className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
          >
            {busy ? "アップロード中..." : "アップロードして登録"}
          </button>
        </div>
      </form>

      <section>
        <h2 className="font-bold text-lg mb-4">
          登録済みのシート ({sheets.length})
        </h2>
        {sheets.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-ink-muted">
            まだシートがありません。
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sheets.map((s) => s.id)}
              strategy={rectSortingStrategy}
            >
              <ul className="grid gap-3 sm:grid-cols-2">
                {sheets.map((sheet) => (
                  <SortableItem
                    key={sheet.id}
                    id={sheet.id}
                    className="flex gap-3 bg-white rounded-2xl border border-black/5 p-3"
                  >
                <div className="w-20 h-20 rounded-xl bg-paper overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {sheet.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sheet.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-ink-muted">
                      PDF
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">
                      {sheet.title}
                    </p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-light text-brand-dark">
                      {DIFFICULTY_LABEL[sheet.difficulty]}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-paper text-ink-muted">
                      {PROVIDER_LABEL[sheet.provider]}
                    </span>
                  </div>
                  {sheet.description && (
                    <p className="text-xs text-ink-muted line-clamp-2 mt-1">
                      {sheet.description}
                    </p>
                  )}
                  <a
                    href={sheet.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-brand-dark hover:underline mt-1 block truncate"
                  >
                    PDFを開く ↗
                  </a>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(sheet)}
                      className="text-xs text-brand hover:bg-brand-light px-2 py-1 rounded-full"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(sheet)}
                      className="text-xs text-red-700 hover:bg-red-50 px-2 py-1 rounded-full"
                    >
                      削除
                    </button>
                  </div>
                </div>
                  </SortableItem>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {editingId && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">
                「{editForm.title}」を編集
              </h2>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-ink-muted hover:text-ink text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="タイトル" required>
                <input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="難易度">
                <select
                  value={editForm.difficulty}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      difficulty: e.target.value as SheetDifficulty,
                    })
                  }
                  className={inputCls}
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="提供者">
              <select
                value={editForm.provider}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    provider: e.target.value as SheetProvider,
                  })
                }
                className={inputCls}
              >
                {PROVIDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="説明">
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={3}
                className={inputCls}
              />
            </Field>

            <Field
              label="PDFを差し替える"
              hint="新しく選ぶと既存のPDFは置き換えられます。"
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setEditPdfFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-paper file:text-ink file:font-semibold hover:file:bg-black/5"
              />
            </Field>

            <Field
              label="サムネイルを差し替える"
              hint="新しく選ぶと既存の画像は置き換えられます。"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditThumbFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-paper file:text-ink file:font-semibold hover:file:bg-black/5"
              />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={busy}
                className="rounded-full border border-black/10 px-6 py-2 text-sm font-semibold hover:bg-black/5 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={busy}
                className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
              >
                {busy ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-black/10 bg-paper px-3 py-2 text-sm focus:outline-none focus:border-brand";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </label>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const next = [...array];
  const item = next.splice(from, 1)[0];
  next.splice(to, 0, item);
  return next;
}

function SortableItem({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${className ?? ""} cursor-grab active:cursor-grabbing ${
        isDragging ? "scale-95" : ""
      }`}
    >
      {children}
    </li>
  );
}
