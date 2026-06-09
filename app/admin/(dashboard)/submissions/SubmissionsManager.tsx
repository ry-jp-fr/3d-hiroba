"use client";

import { useEffect, useMemo, useState } from "react";
import type { SubmissionEntry } from "@/lib/curation";
import {
  getSubmissionMediaUrls,
  inferMediaTypeFromUrl,
} from "@/lib/submission-media";
import { captureVideoPosterBlob } from "@/lib/video-thumbnail-client";
import { uploadImageBlob } from "@/lib/upload-image-blob";
import { sanitizeEmbedHtml } from "@/lib/instagram-embed";
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

type EditDraft = { title: string; name: string; embedHtml: string };
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
  const [draft, setDraft] = useState<EditDraft>({
    title: "",
    name: "",
    embedHtml: "",
  });
  const [selectedMedia, setSelectedMedia] = useState<Record<string, Set<string>>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [approving, setApproving] = useState<{
    submission: SubmissionEntry;
    mediaUrls: string[];
  } | null>(null);

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
    setDraft({ title: s.title, name: s.name, embedHtml: "" });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(s: SubmissionEntry) {
    const title = draft.title.trim();
    const name = draft.name.trim();
    const rawEmbed = draft.embedHtml.trim();
    if (!title) {
      setError("作品名を入力してください");
      return;
    }
    if (!name) {
      setError("投稿者名を入力してください");
      return;
    }
    let sanitizedEmbed: string | null = null;
    if (rawEmbed) {
      const cleaned = sanitizeEmbedHtml(rawEmbed);
      if (!cleaned) {
        setError(
          "埋め込みコードが無効です。Instagram のシェア → 埋め込みコードをコピーで取得したコードを貼り付けてください",
        );
        return;
      }
      if (!s.approvedPickId) {
        setError(
          "埋め込みコードは承認済みの投稿にのみ反映できます。先に「承認してギャラリーに掲載」を実行してください",
        );
        return;
      }
      sanitizedEmbed = cleaned;
    }
    setBusyId(s.id);
    setError(null);
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: s.id, title, name }),
    });
    if (!res.ok) {
      setBusyId(null);
      const detail = await res
        .json()
        .then((j) => j?.message || j?.error)
        .catch(() => null);
      setError(`更新に失敗しました (${res.status}${detail ? `: ${detail}` : ""})`);
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    setItems(json.submissions);

    if (sanitizedEmbed && s.approvedPickId) {
      const pickRes = await fetch("/api/admin/picks", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: s.approvedPickId,
          updates: { embedHtml: sanitizedEmbed },
        }),
      });
      if (!pickRes.ok) {
        setBusyId(null);
        const detail = await pickRes
          .json()
          .then((j) => j?.message || j?.error)
          .catch(() => null);
        setError(
          `埋め込みコードの保存に失敗しました (${pickRes.status}${detail ? `: ${detail}` : ""})`,
        );
        return;
      }
    }

    setBusyId(null);
    setEditingId(null);
  }

  function openApprove(s: SubmissionEntry) {
    if (s.approvedPickId) return;
    const submissionMedia = getSubmissionMediaUrls(s);
    const selected = Array.from(getSelected(s)).filter((u) =>
      submissionMedia.includes(u),
    );
    if (submissionMedia.length > 0 && selected.length === 0) {
      setError("掲載するメディアを1つ以上選んでください");
      return;
    }
    setError(null);
    setApproving({ submission: s, mediaUrls: selected });
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
                        {s.approvedPickId && s.instagramUrl && (
                          <label className="block">
                            <span className="text-[11px] text-ink-muted">
                              埋め込みコード (Instagram のシェア → 埋め込みコードをコピー)
                            </span>
                            <textarea
                              value={draft.embedHtml}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  embedHtml: e.target.value,
                                }))
                              }
                              rows={4}
                              placeholder='<blockquote class="instagram-media" data-instgrm-permalink="..." ...>'
                              className="mt-0.5 w-full rounded-lg border border-black/10 bg-paper px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-brand"
                            />
                            <p className="mt-1 text-[10px] text-ink-muted">
                              貼り付けて保存すると、ギャラリーがこの投稿の公式 Instagram 埋め込みカードに切り替わります。空欄のままだと変更なし。
                            </p>
                          </label>
                        )}
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
                        onClick={() => openApprove(s)}
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

      {approving && (
        <ApproveModal
          submission={approving.submission}
          mediaUrls={approving.mediaUrls}
          onClose={() => setApproving(null)}
          onApproved={(submissions) => {
            setItems(submissions);
            setApproving(null);
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

type ThumbChoice =
  | { kind: "auto"; status: "pending" | "ready" | "failed"; blob?: Blob; previewUrl?: string; error?: string }
  | { kind: "manual"; file?: File; previewUrl?: string }
  | { kind: "reuse"; url: string };

function ApproveModal({
  submission,
  mediaUrls,
  onClose,
  onApproved,
}: {
  submission: SubmissionEntry;
  mediaUrls: string[];
  onClose: () => void;
  onApproved: (submissions: SubmissionEntry[]) => void;
}) {
  const videoUrls = useMemo(
    () => mediaUrls.filter((u) => isVideo(u)),
    [mediaUrls],
  );
  const imageUrls = useMemo(
    () => mediaUrls.filter((u) => !isVideo(u)),
    [mediaUrls],
  );

  const [choices, setChoices] = useState<Record<string, ThumbChoice>>(() => {
    const init: Record<string, ThumbChoice> = {};
    for (const url of videoUrls) {
      init[url] = { kind: "auto", status: "pending" };
    }
    return init;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kick off auto-capture for every video on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const url of videoUrls) {
        try {
          const blob = await captureVideoPosterBlob(url);
          if (cancelled) return;
          const previewUrl = URL.createObjectURL(blob);
          setChoices((prev) => {
            const cur = prev[url];
            if (!cur || cur.kind !== "auto") return prev;
            return {
              ...prev,
              [url]: { kind: "auto", status: "ready", blob, previewUrl },
            };
          });
        } catch (err) {
          if (cancelled) return;
          const message = err instanceof Error ? err.message : "capture_failed";
          setChoices((prev) => {
            const cur = prev[url];
            if (!cur || cur.kind !== "auto") return prev;
            return {
              ...prev,
              [url]: { kind: "auto", status: "failed", error: message },
            };
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revoke blob preview URLs on unmount.
  useEffect(() => {
    return () => {
      for (const c of Object.values(choices)) {
        if ("previewUrl" in c && c.previewUrl) {
          URL.revokeObjectURL(c.previewUrl);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setChoice(url: string, next: ThumbChoice) {
    setChoices((prev) => {
      const old = prev[url];
      if (old && "previewUrl" in old && old.previewUrl && old.previewUrl !== ("previewUrl" in next ? next.previewUrl : undefined)) {
        URL.revokeObjectURL(old.previewUrl);
      }
      return { ...prev, [url]: next };
    });
  }

  function onManualFile(url: string, file: File) {
    const previewUrl = URL.createObjectURL(file);
    setChoice(url, { kind: "manual", file, previewUrl });
  }

  function previewSrc(url: string): string | undefined {
    const c = choices[url];
    if (!c) return undefined;
    if (c.kind === "reuse") return c.url;
    if (c.kind === "manual") return c.previewUrl;
    if (c.kind === "auto" && c.status === "ready") return c.previewUrl;
    return undefined;
  }

  async function submit() {
    setBusy(true);
    setError(null);

    const thumbnails: Record<string, string> = {};
    try {
      for (const url of videoUrls) {
        const c = choices[url];
        if (!c) continue;
        if (c.kind === "reuse") {
          thumbnails[url] = c.url;
        } else if (c.kind === "manual" && c.file) {
          thumbnails[url] = await uploadImageBlob(
            c.file,
            `poster-${Date.now()}-${c.file.name}`,
          );
        } else if (c.kind === "auto" && c.status === "ready" && c.blob) {
          thumbnails[url] = await uploadImageBlob(
            c.blob,
            `poster-${Date.now()}.jpg`,
          );
        }
        // missing/failed thumbnail: just don't set one. The pick will publish
        // without a poster — admin can fix it later from /admin/uploads.
      }
    } catch (err) {
      setBusy(false);
      setError(
        err instanceof Error
          ? `サムネのアップロードに失敗: ${err.message}`
          : "サムネのアップロードに失敗しました",
      );
      return;
    }

    const res = await fetch("/api/admin/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        id: submission.id,
        mediaUrls,
        thumbnails,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const detail = await res
        .json()
        .then((j) => j?.message || j?.error)
        .catch(() => null);
      setError(`承認に失敗しました (${res.status}${detail ? `: ${detail}` : ""})`);
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    onApproved(json.submissions);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl">承認してギャラリーに掲載</h2>
            <p className="text-xs text-ink-muted mt-1">
              「{submission.title}」 · {mediaUrls.length} 件のメディア
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-ink-muted hover:text-ink text-2xl disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {videoUrls.length === 0 ? (
          <p className="text-sm text-ink-muted">
            画像のみのため、このまま承認するとギャラリーに掲載されます。
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-ink">
              動画のサムネイル（ポスター画像）を設定します。
              一覧で動画タイルに表示されます。
            </p>
            {videoUrls.map((url) => {
              const c = choices[url];
              const p = previewSrc(url);
              return (
                <div
                  key={url}
                  className="rounded-2xl border border-black/10 p-4 flex gap-4"
                >
                  <div className="w-32 shrink-0 space-y-2">
                    <video
                      src={url}
                      className="w-full aspect-square object-cover bg-black/5 rounded-xl"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="text-[10px] text-ink-muted text-center">
                      動画
                    </div>
                    {p ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p}
                        alt="サムネプレビュー"
                        className="w-full aspect-square object-cover bg-paper rounded-xl border border-brand/40"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-xl bg-paper border border-dashed border-black/10 flex items-center justify-center text-[10px] text-ink-muted text-center px-1">
                        {c?.kind === "auto" && c.status === "pending"
                          ? "自動取得中..."
                          : "サムネなし"}
                      </div>
                    )}
                    <div className="text-[10px] text-ink-muted text-center">
                      サムネ
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`thumb-${url}`}
                        checked={c?.kind === "auto"}
                        onChange={() => {
                          // Re-run auto-capture if user toggles back.
                          setChoice(url, { kind: "auto", status: "pending" });
                          captureVideoPosterBlob(url)
                            .then((blob) => {
                              const previewUrl = URL.createObjectURL(blob);
                              setChoice(url, {
                                kind: "auto",
                                status: "ready",
                                blob,
                                previewUrl,
                              });
                            })
                            .catch((err) => {
                              setChoice(url, {
                                kind: "auto",
                                status: "failed",
                                error:
                                  err instanceof Error ? err.message : "failed",
                              });
                            });
                        }}
                      />
                      <span>自動生成（動画の先頭フレーム）</span>
                      {c?.kind === "auto" && c.status === "failed" && (
                        <span className="text-[11px] text-red-600">
                          失敗 ({c.error}) — 手動を選んでください
                        </span>
                      )}
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`thumb-${url}`}
                        className="mt-1"
                        checked={c?.kind === "manual"}
                        onChange={() => setChoice(url, { kind: "manual" })}
                      />
                      <div className="flex-1">
                        <span>手動アップロード</span>
                        {c?.kind === "manual" && (
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) onManualFile(url, f);
                            }}
                            className="mt-1 block w-full text-xs"
                          />
                        )}
                      </div>
                    </label>

                    {imageUrls.length > 0 && (
                      <div className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`thumb-${url}`}
                            checked={c?.kind === "reuse"}
                            onChange={() =>
                              setChoice(url, {
                                kind: "reuse",
                                url: imageUrls[0],
                              })
                            }
                          />
                          <span>同応募の画像を流用</span>
                        </label>
                        {c?.kind === "reuse" && (
                          <div className="flex gap-2 flex-wrap pl-6">
                            {imageUrls.map((iu) => (
                              <button
                                key={iu}
                                type="button"
                                onClick={() =>
                                  setChoice(url, { kind: "reuse", url: iu })
                                }
                                className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${
                                  c.url === iu
                                    ? "border-brand"
                                    : "border-transparent opacity-60"
                                }`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={iu}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
            {busy ? "処理中..." : "承認して掲載"}
          </button>
        </div>
      </div>
    </div>
  );
}
