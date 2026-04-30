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
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { upload } from "@vercel/blob/client";
import type { PickEntry } from "@/lib/curation";

type FormState = {
  title: string;
  author: string;
  authorUrl: string;
  caption: string;
  tags: string;
  postedAt: string;
  pentaComment: string;
};

const EMPTY: FormState = {
  title: "",
  author: "",
  authorUrl: "",
  caption: "",
  tags: "",
  postedAt: "",
  pentaComment: "",
};

type UploadedMeta = {
  url: string;
  mediaType: "image" | "video";
  mime: string;
  size: number;
};

export function UploadManager({ initial }: { initial: PickEntry[] }) {
  const [picks, setPicks] = useState<PickEntry[]>(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PickEntry> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFile(file: File): Promise<UploadedMeta> {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload-token",
    });
    return {
      url: blob.url,
      mediaType: file.type.startsWith("video/") ? "video" : "image",
      mime: file.type,
      size: file.size,
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!mediaFile) {
      setError("画像または動画ファイルを選択してください");
      return;
    }
    setBusy(true);
    try {
      const uploaded = await uploadFile(mediaFile);
      let thumbnailUrl: string | undefined;
      if (uploaded.mediaType === "video" && thumbFile) {
        const thumb = await uploadFile(thumbFile);
        thumbnailUrl = thumb.url;
      }
      const res = await fetch("/api/admin/picks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          method: "manual-upload",
          mediaType: uploaded.mediaType,
          mediaUrl: uploaded.url,
          thumbnailUrl,
          title: form.title.trim() || undefined,
          author: form.author.trim() || undefined,
          authorUrl: form.authorUrl.trim() || undefined,
          caption: form.caption.trim() || undefined,
          tags: form.tags,
          postedAt: form.postedAt || undefined,
          pentaComment: form.pentaComment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "create_failed");
      }
      const json = (await res.json()) as { picks: PickEntry[] };
      setPicks(json.picks);
      setForm(EMPTY);
      setMediaFile(null);
      setThumbFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  async function remove(p: PickEntry) {
    if (!confirm(`「${p.title ?? p.id}」を削除しますか？`)) return;
    const res = await fetch(`/api/admin/picks?id=${encodeURIComponent(p.id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("削除に失敗しました");
      return;
    }
    const json = (await res.json()) as { picks: PickEntry[] };
    setPicks(json.picks);
  }

  function startEdit(p: PickEntry) {
    setEditingId(p.id);
    setEditForm({ ...p });
    setError(null);
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/picks", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          updates: {
            title: editForm.title,
            author: editForm.author,
            authorUrl: editForm.authorUrl,
            caption: editForm.caption,
            tags: editForm.tags,
            postedAt: editForm.postedAt,
            pentaComment: editForm.pentaComment,
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "update_failed");
      }
      const json = (await res.json()) as { picks: PickEntry[] };
      setPicks(json.picks);
      setEditingId(null);
      setEditForm(null);
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

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setError(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = picks.findIndex((p) => p.id === active.id);
      const newIndex = picks.findIndex((p) => p.id === over.id);

      const newPicks = arrayMove(picks, oldIndex, newIndex);
      setPicks(newPicks);

      setIsReordering(true);
      try {
        const res = await fetch("/api/admin/picks", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ order: newPicks.map((p) => p.id) }),
        });
        if (!res.ok) {
          setPicks(picks);
          setError("順序の保存に失敗しました");
        }
      } catch {
        setPicks(picks);
        setError("順序の保存に失敗しました");
      } finally {
        setIsReordering(false);
      }
    }
  }

  const isVideo = mediaFile?.type.startsWith("video/");

  return (
    <div className="space-y-8">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl border border-black/5 p-6 space-y-4"
      >
        <h2 className="font-bold text-lg">作品をアップロード</h2>

        <Field label="画像 / 動画ファイル" required>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/quicktime,video/webm"
            onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-light file:text-brand-dark file:font-semibold hover:file:bg-brand-light/70"
            required
          />
          {mediaFile && (
            <p className="mt-2 text-xs text-ink-muted">
              {mediaFile.name} ({formatSize(mediaFile.size)})
            </p>
          )}
        </Field>

        {isVideo && (
          <Field
            label="カバー画像（動画のサムネイル）"
            hint="動画のプレビュー用に、任意で画像もアップロードできます。"
          >
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-paper file:text-ink file:font-semibold hover:file:bg-black/5"
            />
          </Field>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="タイトル">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder="ドラゴンの立体造形"
            />
          </Field>
          <Field label="投稿日">
            <input
              type="date"
              value={form.postedAt}
              onChange={(e) => set("postedAt", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="作者名">
            <input
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              className={inputCls}
              placeholder="@hiroba_user"
            />
          </Field>
          <Field label="作者のリンク">
            <input
              type="url"
              value={form.authorUrl}
              onChange={(e) => set("authorUrl", e.target.value)}
              className={inputCls}
              placeholder="https://www.instagram.com/hiroba_user/"
            />
          </Field>
        </div>

        <Field label="キャプション">
          <textarea
            value={form.caption}
            onChange={(e) => set("caption", e.target.value)}
            rows={3}
            className={inputCls}
          />
        </Field>

        <Field label="タグ（カンマ区切り）">
          <input
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            className={inputCls}
            placeholder="3dひろば, ドラゴン"
          />
        </Field>

        <Field label="3Dぺんたコメント">
          <textarea
            value={form.pentaComment}
            onChange={(e) => set("pentaComment", e.target.value)}
            rows={2}
            className={inputCls}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy || !mediaFile}
            className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
          >
            {busy ? "アップロード中..." : "アップロードして掲載"}
          </button>
        </div>
      </form>

      <section>
        <h2 className="font-bold text-lg mb-4">すべての作品 ({picks.length})</h2>
        {picks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-ink-muted">
            まだ作品がありません。
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={picks.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <ul className="grid gap-3 sm:grid-cols-2">
                {picks.map((p) => (
                  <SortableItem key={p.id} id={p.id}>
                    <div className="flex gap-3 bg-white rounded-2xl border border-black/5 p-3">
                      <div className="w-20 h-20 rounded-xl bg-paper overflow-hidden flex-shrink-0">
                        {p.mediaType === "video" ? (
                          <video
                            src={p.mediaUrl}
                            poster={p.thumbnailUrl}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.mediaUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">
                            {p.title ?? "(無題)"}
                          </p>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-paper text-ink-muted">
                            {p.mediaType === "video" ? "動画" : "画像"}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {p.method === "manual-upload" ? "アップロード" : "Instagram URL"}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted truncate">{p.author}</p>
                        <p className="text-[11px] text-ink-muted mt-1 truncate">
                          {p.mediaUrl}
                        </p>
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="text-xs text-brand hover:bg-brand-light px-2 py-1 rounded-full"
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(p)}
                            className="text-xs text-red-700 hover:bg-red-50 px-2 py-1 rounded-full"
                          >
                            削除
                          </button>
                        </div>
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
              <h2 className="font-bold text-xl">「{editForm.title ?? editForm.id}」を編集</h2>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-ink-muted hover:text-ink text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="タイトル">
                <input
                  value={editForm.title ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value || undefined })}
                  className={inputCls}
                />
              </Field>
              <Field label="投稿日">
                <input
                  type="date"
                  value={editForm.postedAt ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, postedAt: e.target.value || undefined })}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="作者名">
                <input
                  value={editForm.author ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, author: e.target.value || undefined })}
                  className={inputCls}
                />
              </Field>
              <Field label="作者のリンク">
                <input
                  type="url"
                  value={editForm.authorUrl ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, authorUrl: e.target.value || undefined })}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="キャプション">
              <textarea
                value={editForm.caption ?? ""}
                onChange={(e) => setEditForm({ ...editForm, caption: e.target.value || undefined })}
                rows={3}
                className={inputCls}
              />
            </Field>

            <Field label="タグ（カンマ区切り）">
              <input
                value={(editForm.tags ?? []).join(", ")}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0);
                  setEditForm({ ...editForm, tags });
                }}
                className={inputCls}
              />
            </Field>

            <Field label="3Dぺんたコメント">
              <textarea
                value={editForm.pentaComment ?? ""}
                onChange={(e) => setEditForm({ ...editForm, pentaComment: e.target.value || undefined })}
                rows={2}
                className={inputCls}
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
  const newArray = [...array];
  const item = newArray.splice(from, 1)[0];
  newArray.splice(to, 0, item);
  return newArray;
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
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
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? "scale-95" : ""
      }`}
    >
      {children}
    </li>
  );
}
