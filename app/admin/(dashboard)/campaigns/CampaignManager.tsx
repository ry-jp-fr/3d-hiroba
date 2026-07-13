"use client";

import { useState } from "react";
import type { CampaignPage } from "@/lib/curation";
import { uploadImageBlob } from "@/lib/upload-image-blob";

type Draft = {
  title: string;
  slug: string;
  imageUrl: string;
  body: string;
  startDate: string;
  endDate: string;
  ctaLabel: string;
  ctaUrl: string;
  published: boolean;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  slug: "",
  imageUrl: "",
  body: "",
  startDate: "",
  endDate: "",
  ctaLabel: "",
  ctaUrl: "",
  published: false,
};

function toDraft(c: CampaignPage): Draft {
  return {
    title: c.title,
    slug: c.slug,
    imageUrl: c.imageUrl ?? "",
    body: c.body,
    startDate: c.startDate ?? "",
    endDate: c.endDate ?? "",
    ctaLabel: c.ctaLabel ?? "",
    ctaUrl: c.ctaUrl ?? "",
    published: c.published,
  };
}

function formatRange(start?: string, end?: string): string {
  if (!start && !end) return "";
  if (start && end) return `${start} 〜 ${end}`;
  if (start) return `${start} 〜`;
  return `〜 ${end}`;
}

export function CampaignManager({ initial }: { initial: CampaignPage[] }) {
  const [campaigns, setCampaigns] = useState<CampaignPage[]>(initial);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(
    file: File,
    apply: (url: string) => void,
  ) {
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImageBlob(file, file.name);
      apply(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? `画像のアップロードに失敗しました: ${err.message}`
          : "画像のアップロードに失敗しました",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createCampaign() {
    if (!draft.title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (!draft.slug.trim() || !/^[a-z0-9-]+$/.test(draft.slug.trim())) {
      setError("スラッグは半角英数字とハイフンのみで入力してください");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const msg =
          j.error === "slug_taken"
            ? "そのスラッグは既に使われています"
            : j.error === "invalid_slug"
              ? "スラッグの形式が正しくありません"
              : "作成に失敗しました";
        throw new Error(msg);
      }
      const json = (await res.json()) as { campaigns: CampaignPage[] };
      setCampaigns(json.campaigns);
      setDraft(EMPTY_DRAFT);
      setCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(c: CampaignPage) {
    setEditingId(c.id);
    setEditDraft(toDraft(c));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
    setError(null);
  }

  async function saveEdit() {
    if (!editingId || !editDraft) return;
    if (!editDraft.title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (!editDraft.slug.trim() || !/^[a-z0-9-]+$/.test(editDraft.slug.trim())) {
      setError("スラッグは半角英数字とハイフンのみで入力してください");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: editingId, updates: editDraft }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const msg =
          j.error === "invalid_slug"
            ? "スラッグが不正、または既に使われています"
            : "保存に失敗しました";
        throw new Error(msg);
      }
      const json = (await res.json()) as { campaigns: CampaignPage[] };
      setCampaigns(json.campaigns);
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(c: CampaignPage) {
    setError(null);
    const res = await fetch("/api/admin/campaigns", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: c.id,
        updates: { published: !c.published },
      }),
    });
    if (!res.ok) {
      setError("公開状態の変更に失敗しました");
      return;
    }
    const json = (await res.json()) as { campaigns: CampaignPage[] };
    setCampaigns(json.campaigns);
  }

  async function remove(c: CampaignPage) {
    if (!confirm(`「${c.title}」を削除しますか？`)) return;
    const res = await fetch(
      `/api/admin/campaigns?id=${encodeURIComponent(c.id)}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("削除に失敗しました");
      return;
    }
    const json = (await res.json()) as { campaigns: CampaignPage[] };
    setCampaigns(json.campaigns);
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl border border-black/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">登録済み ({campaigns.length})</h2>
          {!creating && (
            <button
              type="button"
              onClick={() => {
                setCreating(true);
                setDraft(EMPTY_DRAFT);
                setError(null);
              }}
              className="rounded-full bg-brand text-white font-semibold px-5 py-2 text-sm hover:bg-brand-dark"
            >
              + 新規作成
            </button>
          )}
        </div>

        {campaigns.length === 0 && !creating ? (
          <p className="rounded-2xl border border-dashed border-black/10 bg-paper p-6 text-center text-sm text-ink-muted">
            まだキャンペーンページがありません。
          </p>
        ) : (
          <ul className="space-y-3">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className={`flex gap-3 rounded-2xl border border-black/5 p-3 ${c.published ? "bg-white" : "bg-paper"}`}
              >
                <div className="w-20 h-20 rounded-xl bg-paper overflow-hidden flex-shrink-0">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">
                      {c.title}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        c.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {c.published ? "公開中" : "非公開"}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted truncate">
                    /campaign/{c.slug}
                  </p>
                  {formatRange(c.startDate, c.endDate) && (
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      {formatRange(c.startDate, c.endDate)}
                    </p>
                  )}
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => togglePublished(c)}
                      className="text-xs text-ink-muted hover:bg-black/5 px-2 py-1 rounded-full"
                    >
                      {c.published ? "非公開にする" : "公開する"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-xs text-brand hover:bg-brand-light px-2 py-1 rounded-full"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(c)}
                      className="text-xs text-red-700 hover:bg-red-50 px-2 py-1 rounded-full"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {creating && (
        <CampaignForm
          draft={draft}
          setDraft={setDraft}
          busy={busy}
          onUpload={(f) => handleUpload(f, (url) => setDraft((d) => ({ ...d, imageUrl: url })))}
          onCancel={() => {
            setCreating(false);
            setError(null);
          }}
          onSave={createCampaign}
          saveLabel="作成する"
        />
      )}

      {editingId && editDraft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl">「{editDraft.title || editDraft.slug}」を編集</h2>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-ink-muted hover:text-ink text-2xl"
              >
                ✕
              </button>
            </div>
            <CampaignForm
              draft={editDraft}
              setDraft={(d) => setEditDraft(d as Draft)}
              busy={busy}
              onUpload={(f) =>
                handleUpload(f, (url) =>
                  setEditDraft((d) => (d ? { ...d, imageUrl: url } : d)),
                )
              }
              onCancel={cancelEdit}
              onSave={saveEdit}
              saveLabel="保存"
              embedded
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function CampaignForm({
  draft,
  setDraft,
  busy,
  onUpload,
  onCancel,
  onSave,
  saveLabel,
  embedded,
}: {
  draft: Draft;
  setDraft: (updater: Draft | ((d: Draft) => Draft)) => void;
  busy: boolean;
  onUpload: (file: File) => void;
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
  embedded?: boolean;
}) {
  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const content = (
    <div className="space-y-4">
      <Field label="タイトル" required>
        <input
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputCls}
          placeholder="夏のキャンペーン"
        />
      </Field>

      <Field
        label="スラッグ (URL)"
        required
        hint={`公開URL: /campaign/${draft.slug || "..."} 半角英数字とハイフンのみ`}
      >
        <input
          value={draft.slug}
          onChange={(e) =>
            set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
          }
          className={inputCls}
          placeholder="summer-2026"
        />
      </Field>

      <Field label="メイン画像">
        <div className="flex items-start gap-3">
          {draft.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={draft.imageUrl}
              alt=""
              className="w-24 h-24 rounded-xl object-cover bg-paper flex-shrink-0 border border-black/10"
            />
          )}
          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  onUpload(f);
                  e.target.value = "";
                }
              }}
              disabled={busy}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-light file:text-brand-dark file:font-semibold hover:file:bg-brand-light/70"
            />
            <input
              value={draft.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              className={inputCls}
              placeholder="または画像 URL を直接指定"
            />
          </div>
        </div>
      </Field>

      <Field label="本文" hint="改行はそのまま表示されます">
        <textarea
          value={draft.body}
          onChange={(e) => set("body", e.target.value)}
          rows={6}
          className={inputCls}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="開始日">
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="終了日">
          <input
            type="date"
            value={draft.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="CTA ボタンのラベル" hint="例: くわしく見る">
          <input
            value={draft.ctaLabel}
            onChange={(e) => set("ctaLabel", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="CTA ボタンのリンク先" hint="ラベルとリンク先が両方揃うと表示されます">
          <input
            value={draft.ctaUrl}
            onChange={(e) => set("ctaUrl", e.target.value)}
            className={inputCls}
            placeholder="https://... または /about"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={draft.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        <span className="text-sm font-semibold">
          公開する（オフの間は /campaign/{draft.slug || "..."} が 404 になります）
        </span>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-full border border-black/10 px-6 py-2 text-sm font-semibold hover:bg-black/5 disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "処理中..." : saveLabel}
        </button>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <section className="bg-white rounded-3xl border border-black/5 p-6">
      <h2 className="font-bold text-lg mb-4">新規キャンペーンページ</h2>
      {content}
    </section>
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
