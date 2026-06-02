"use client";

import { useEffect, useState } from "react";
import type { SubmissionEntry } from "@/lib/curation";
import {
  getSubmissionMediaUrls,
  inferMediaTypeFromUrl,
} from "@/lib/submission-media";
import type { BlobMediaItem } from "@/app/api/admin/blobs/route";

function isVideo(url: string | undefined): boolean {
  return inferMediaTypeFromUrl(url) === "video";
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type EditDraft = { title: string; name: string };
type Tab = "active" | "trash";

export function SubmissionsManager({
  initial,
}: {
  initial: SubmissionEntry[];
}) {
  const [items, setItems] = useState<SubmissionEntry[]>(initial);
  const [tab, setTab] = useState<Tab>("active");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft>({ title: "", name: "" });
  const [selectedMedia, setSelectedMedia] = useState<Record<string, Set<string>>>({});
  const [showCreate, setShowCreate] = useState(false);

  const activeItems = items.filter((s) => !s.deletedAt);
  const trashItems = items.filter((s) => s.deletedAt);
  const shown = tab === "active" ? activeItems : trashItems;

  function getSelected(s: SubmissionEntry): Set<string> {
    const current = selectedMedia[s.id];
    if (current) return current;
    return new Set(getSubmissionMediaUrls(s));
  }

  function toggleMedia(s: SubmissionEntry, url: string) {
    setSelectedMedia((prev) => {
      const current = new Set(prev[s.id] ?? getSubmissionMediaUrls(s));
      if (current.has(url)) current.delete(url);
      else current.add(url);
      return { ...prev, [s.id]: current };
    });
  }

  function startEdit(s: SubmissionEntry) {
    setEditingId(s.id);
    setDraft({ title: s.title, name: s.name });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(s: SubmissionEntry) {
    const title = draft.title.trim();
    const name = draft.name.trim();
    if (!title) {
      setError("作品名を入力してください");
      return;
    }
    if (!name) {
      setError("投稿者名を入力してください");
      return;
    }
    setBusyId(s.id);
    setError(null);
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: s.id, title, name }),
    });
    setBusyId(null);
    if (!res.ok) {
      const detail = await res
        .json()
        .then((j) => j?.message || j?.error)
        .catch(() => null);
      setError(`更新に失敗しました (${res.status}${detail ? `: ${detail}` : ""})`);
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    setItems(json.submissions);
    setEditingId(null);
  }

  async function approve(s: SubmissionEntry) {
    if (s.approvedPickId) return;
    const submissionMedia = getSubmissionMediaUrls(s);
    const selected = Array.from(getSelected(s)).filter((u) =>
      submissionMedia.includes(u),
    );
    if (submissionMedia.length > 0 && selected.length === 0) {
      setError("掲載するメディアを1つ以上選んでください");
      return;
    }
    const count = selected.length;
    const promptText =
      count > 1
        ? `「${s.title}」を承認し、${count} 件のメディアをギャラリーに掲載しますか？`
        : `「${s.title}」を承認してギャラリーに掲載しますか？`;
    if (!confirm(promptText)) return;
    setBusyId(s.id);
    setError(null);
    const res = await fetch("/api/admin/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        id: s.id,
        mediaUrls: selected,
      }),
    });
    setBusyId(null);
    if (!res.ok) {
      const detail = await res
        .json()
        .then((j) => j?.message || j?.error)
        .catch(() => null);
      setError(`承認に失敗しました (${res.status}${detail ? `: ${detail}` : ""})`);
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    setItems(json.submissions);
  }

  async function remove(s: SubmissionEntry) {
    if (!confirm(`「${s.title}」の応募をゴミ箱に移動しますか？（後で復元できます）`))
      return;
    setBusyId(s.id);
    setError(null);
    const res = await fetch(
      `/api/admin/submissions?id=${encodeURIComponent(s.id)}`,
      { method: "DELETE" },
    );
    setBusyId(null);
    if (!res.ok) {
      const detail = await res
        .json()
        .then((j) => j?.message || j?.error)
        .catch(() => null);
      setError(`削除に失敗しました (${res.status}${detail ? `: ${detail}` : ""})`);
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    setItems(json.submissions);
  }

  async function restore(s: SubmissionEntry) {
    setBusyId(s.id);
    setError(null);
    const res = await fetch("/api/admin/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "restore", id: s.id }),
    });
    setBusyId(null);
    if (!res.ok) {
      setError("復元に失敗しました");
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    setItems(json.submissions);
  }

  async function permanentRemove(s: SubmissionEntry) {
    if (
      !confirm(
        `「${s.title}」を完全に削除します。この操作は取り消せません。よろしいですか？`,
      )
    )
      return;
    setBusyId(s.id);
    setError(null);
    const res = await fetch(
      `/api/admin/submissions?id=${encodeURIComponent(s.id)}&permanent=true`,
      { method: "DELETE" },
    );
    setBusyId(null);
    if (!res.ok) {
      setError("完全削除に失敗しました");
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    setItems(json.submissions);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 rounded-full bg-paper p-1 text-sm">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`px-4 py-1.5 rounded-full font-semibold transition-colors ${
              tab === "active" ? "bg-white shadow-sm" : "text-ink-muted"
            }`}
          >
            応募 ({activeItems.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("trash")}
            className={`px-4 py-1.5 rounded-full font-semibold transition-colors ${
              tab === "trash" ? "bg-white shadow-sm" : "text-ink-muted"
            }`}
          >
            ゴミ箱 ({trashItems.length})
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="text-xs px-4 py-2 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark"
        >
          Blob から応募を作成
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-ink-muted">
          {tab === "active"
            ? "まだ応募はありません。"
            : "ゴミ箱は空です。"}
        </div>
      )}

      <ul className="space-y-3">
        {shown.map((s) => {
          const approved = Boolean(s.approvedPickId);
          const busy = busyId === s.id;
          const trashed = Boolean(s.deletedAt);
          const mediaUrls = getSubmissionMediaUrls(s);
          const selected = getSelected(s);
          const selectable = !approved && !trashed;
          return (
            <li
              key={s.id}
              className="bg-white rounded-2xl border border-black/5 p-5 flex flex-col sm:flex-row gap-4"
            >
              <div className="sm:w-48 shrink-0">
                {mediaUrls.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-2">
                    {mediaUrls.map((url) => {
                      const isSelected = selected.has(url);
                      return (
                        <li key={url} className="relative">
                          <label
                            className={`block cursor-pointer rounded-xl overflow-hidden border-2 transition-colors ${
                              !selectable
                                ? "border-transparent"
                                : isSelected
                                  ? "border-brand"
                                  : "border-transparent opacity-50"
                            }`}
                          >
                            {selectable && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleMedia(s, url)}
                                className="absolute top-1 left-1 z-10 w-4 h-4 cursor-pointer"
                              />
                            )}
                            {isVideo(url) ? (
                              <video
                                src={url}
                                className="w-full aspect-square object-cover bg-black/5"
                                muted
                                playsInline
                                controls
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={url}
                                alt={s.title}
                                className="w-full aspect-square object-cover bg-black/5"
                              />
                            )}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-paper border border-dashed border-black/10 flex items-center justify-center text-xs text-ink-muted text-center px-2">
                    Instagram
                    <br />
                    投稿URL
                  </div>
                )}
                {mediaUrls.length > 1 && selectable && (
                  <p className="mt-2 text-[10px] text-ink-muted">
                    チェック中 {selected.size} / {mediaUrls.length} 件を掲載
                  </p>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    {editingId === s.id ? (
                      <div className="space-y-2">
                        <label className="block">
                          <span className="text-[11px] text-ink-muted">
                            作品名
                          </span>
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, title: e.target.value }))
                            }
                            className="mt-0.5 w-full rounded-lg border border-black/10 bg-paper px-2 py-1.5 text-sm focus:outline-none focus:border-brand"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] text-ink-muted">
                            投稿者名
                          </span>
                          <input
                            type="text"
                            value={draft.name}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, name: e.target.value }))
                            }
                            className="mt-0.5 w-full rounded-lg border border-black/10 bg-paper px-2 py-1.5 text-sm focus:outline-none focus:border-brand"
                          />
                        </label>
                        <p className="text-[11px] text-ink-muted">
                          {formatDate(s.submittedAt)}
                        </p>
                      </div>
                    ) : (
                      <>
                        <h2 className="font-bold text-base truncate">
                          {s.title}
                        </h2>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {formatDate(s.submittedAt)} · {s.name}
                        </p>
                      </>
                    )}
                  </div>
                  {trashed ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      ゴミ箱
                    </span>
                  ) : (
                    approved && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        承認済み
                      </span>
                    )
                  )}
                </div>

                <dl className="text-xs grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <dt className="text-ink-muted">メール</dt>
                  <dd className="truncate">
                    <a
                      href={`mailto:${s.email}`}
                      className="text-brand-dark hover:underline"
                    >
                      {s.email}
                    </a>
                  </dd>
                  {s.instagramUrl && (
                    <>
                      <dt className="text-ink-muted">Instagram</dt>
                      <dd className="truncate">
                        <a
                          href={s.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-dark hover:underline"
                        >
                          {s.instagramUrl}
                        </a>
                      </dd>
                    </>
                  )}
                  {s.notes && (
                    <>
                      <dt className="text-ink-muted">メモ</dt>
                      <dd className="whitespace-pre-wrap">{s.notes}</dd>
                    </>
                  )}
                  <dt className="text-ink-muted">同意</dt>
                  <dd>
                    掲載許諾 {s.consent ? "○" : "×"} ／ 保護者同意{" "}
                    {s.parentalConsent ? "○" : "×"}
                  </dd>
                </dl>

                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  {trashed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => restore(s)}
                        disabled={busy}
                        className="text-xs px-3 py-1.5 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark disabled:opacity-40"
                      >
                        {busy ? "処理中..." : "復元"}
                      </button>
                      <button
                        type="button"
                        onClick={() => permanentRemove(s)}
                        disabled={busy}
                        className="text-xs px-3 py-1.5 rounded-full text-red-700 hover:bg-red-50 disabled:opacity-40"
                      >
                        完全に削除
                      </button>
                    </>
                  ) : editingId === s.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveEdit(s)}
                        disabled={busy}
                        className="text-xs px-3 py-1.5 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark disabled:opacity-40"
                      >
                        {busy ? "保存中..." : "保存"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={busy}
                        className="text-xs px-3 py-1.5 rounded-full bg-paper hover:bg-black/5 disabled:opacity-40"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => approve(s)}
                        disabled={approved || busy}
                        className="text-xs px-3 py-1.5 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {approved
                          ? "ギャラリー掲載済み"
                          : busy
                            ? "処理中..."
                            : "承認してギャラリーに掲載"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        disabled={busy}
                        className="text-xs px-3 py-1.5 rounded-full bg-paper hover:bg-black/5 disabled:opacity-40"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(s)}
                        disabled={busy}
                        className="text-xs px-3 py-1.5 rounded-full text-red-700 hover:bg-red-50 disabled:opacity-40"
                      >
                        削除
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {showCreate && (
        <CreateFromBlobModal
          onClose={() => setShowCreate(false)}
          onCreated={(submissions) => {
            setItems(submissions);
            setShowCreate(false);
            setTab("active");
          }}
        />
      )}
    </div>
  );
}

function CreateFromBlobModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (submissions: SubmissionEntry[]) => void;
}) {
  const [blobs, setBlobs] = useState<BlobMediaItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [onlyUnused, setOnlyUnused] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    title: "",
    name: "",
    email: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/blobs");
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setLoadError(j.message || j.error || "Blob 一覧の取得に失敗しました");
        setBlobs([]);
        return;
      }
      const json = (await res.json()) as { blobs: BlobMediaItem[] };
      setBlobs(json.blobs);
    })();
  }, []);

  function toggle(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  async function submit() {
    if (!form.title.trim() || !form.name.trim()) {
      setError("作品名と投稿者名を入力してください");
      return;
    }
    if (selected.size === 0) {
      setError("ファイルを1つ以上選んでください");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "create",
        title: form.title.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        notes: form.notes.trim() || undefined,
        mediaUrls: Array.from(selected),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(`作成に失敗しました (${j.message || j.error || res.status})`);
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    onCreated(json.submissions);
  }

  const visible = (blobs ?? []).filter((b) => (onlyUnused ? !b.used : true));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl">Blob から応募を作成</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-2xl"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          アップロード済みのファイルを選び、作品名・投稿者名・メモなどを入力して応募として登録します。
          誤って削除した応募の作り直しに使えます。
        </p>

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block sm:col-span-1">
            <span className="text-[11px] text-ink-muted">作品名 *</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="text-[11px] text-ink-muted">投稿者名 *</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="text-[11px] text-ink-muted">メール</span>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-[11px] text-ink-muted">メモ</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </label>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">
            ファイルを選択 ({selected.size} 件選択中)
          </span>
          <label className="flex items-center gap-1.5 text-[11px] text-ink-muted cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUnused}
              onChange={(e) => setOnlyUnused(e.target.checked)}
            />
            未使用のみ表示
          </label>
        </div>

        {blobs === null ? (
          <p className="text-sm text-ink-muted py-8 text-center">読み込み中...</p>
        ) : loadError ? (
          <p className="text-sm text-red-600">{loadError}</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-ink-muted py-8 text-center">
            表示できるファイルがありません。
          </p>
        ) : (
          <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto">
            {visible.map((b) => {
              const isSelected = selected.has(b.url);
              return (
                <li key={b.url} className="relative">
                  <button
                    type="button"
                    onClick={() => toggle(b.url)}
                    className={`block w-full rounded-xl overflow-hidden border-2 ${
                      isSelected ? "border-brand" : "border-transparent"
                    }`}
                  >
                    {b.mediaType === "video" ? (
                      <video
                        src={b.url}
                        className="w-full aspect-square object-cover bg-black/5"
                        muted
                        playsInline
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.url}
                        alt={b.pathname}
                        className="w-full aspect-square object-cover bg-black/5"
                      />
                    )}
                    {isSelected && (
                      <span className="absolute top-1 left-1 bg-brand text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                    {b.used && (
                      <span className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        使用中
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {b.mediaType === "video" ? "動画" : "画像"} ·{" "}
                      {formatSize(b.size)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full border border-black/10 px-6 py-2 text-sm font-semibold hover:bg-black/5 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
          >
            {busy ? "作成中..." : "応募として登録"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "mt-0.5 w-full rounded-lg border border-black/10 bg-paper px-2 py-1.5 text-sm focus:outline-none focus:border-brand";
