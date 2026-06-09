"use client";

import { FormEvent, useRef, useState } from "react";
import type { PickEntry } from "@/lib/curation";

type FormState = {
  method: "url" | "embed";
  permalink: string;
  embedHtml: string;
  title: string;
  author: string;
  authorUrl: string;
  caption: string;
  tags: string;
  postedAt: string;
  pentaComment: string;
};

const EMPTY: FormState = {
  method: "url",
  permalink: "",
  embedHtml: "",
  title: "",
  author: "",
  authorUrl: "",
  caption: "",
  tags: "",
  postedAt: "",
  pentaComment: "",
};

function extractShortcode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m?.[1] ?? null;
}

function extractPermalinkFromEmbed(html: string): string | null {
  const m = html.match(/data-instgrm-permalink="([^"]+)"/);
  return m?.[1] ?? null;
}

function sanitizeEmbedHtml(html: string): string {
  const parser = new DOMParser();
  try {
    const doc = parser.parseFromString(html, "text/html");
    const blockquote = doc.querySelector("blockquote.instagram-media");
    if (!blockquote) return "";
    blockquote.querySelectorAll("script").forEach((s) => s.remove());
    return blockquote.outerHTML;
  } catch {
    return "";
  }
}

export function InstagramUrlManager({ initial }: { initial: PickEntry[] }) {
  const [picks, setPicks] = useState<PickEntry[]>(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("登録中...");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PickEntry> | null>(null);
  const [editThumbFile, setEditThumbFile] = useState<File | null>(null);
  const [editThumbPreview, setEditThumbPreview] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setThumbnailFile(file);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  }

  function resetForm() {
    setForm(EMPTY);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadThumbnail(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error ?? `upload_failed_${res.status}`);
    }
    const { url } = await res.json() as { url: string };
    return url;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let permalinkToSubmit: string;
    let embedHtmlToSubmit: string | undefined;

    if (form.method === "url") {
      if (!form.permalink.trim()) {
        setError("投稿URLは必須です");
        return;
      }
      if (!extractShortcode(form.permalink)) {
        setError("Instagramの投稿URLを入力してください");
        return;
      }
      permalinkToSubmit = form.permalink.trim();
      embedHtmlToSubmit = undefined;
    } else {
      if (!form.embedHtml.trim()) {
        setError("埋め込みコードは必須です");
        return;
      }
      const sanitized = sanitizeEmbedHtml(form.embedHtml);
      if (!sanitized) {
        setError("埋め込みコードが無効です。Instagram のシェア → コードをコピーで取得したコードを貼り付けてください");
        return;
      }

      const permalinkFromEmbed = extractPermalinkFromEmbed(sanitized);
      if (!permalinkFromEmbed) {
        setError("埋め込みコードから投稿URLが抽出できません");
        return;
      }
      permalinkToSubmit = permalinkFromEmbed;
      embedHtmlToSubmit = sanitized;
    }

    let uploadedUrl: string | undefined;
    if (thumbnailFile) {
      setBusy(true);
      setBusyLabel("画像をアップロード中...");
      try {
        uploadedUrl = await uploadThumbnail(thumbnailFile);
      } catch (err) {
        setBusy(false);
        setError(`画像アップロードに失敗しました (${err instanceof Error ? err.message : "unknown"})`);
        return;
      }
    }

    setBusy(true);
    setBusyLabel(uploadedUrl ? "投稿を登録中..." : "Instagram からサムネを取得して登録中...");
    const res = await fetch("/api/admin/picks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        method: "instagram-url",
        mediaType: "image",
        permalink: permalinkToSubmit,
        embedHtml: embedHtmlToSubmit,
        mediaUrl: uploadedUrl,
        title: form.title.trim() || undefined,
        author: form.author.trim() || undefined,
        authorUrl: form.authorUrl.trim() || undefined,
        caption: form.caption.trim() || undefined,
        tags: form.tags,
        postedAt: form.postedAt || undefined,
        pentaComment: form.pentaComment.trim() || undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const errKey = j.error ?? res.status;
      const friendly =
        errKey === "embed_unavailable_thumb_required"
          ? "Instagram の埋め込みコード取得に失敗しました。Instagram の投稿で「シェア → 埋め込みコードをコピー」して貼り付けるか、サムネ画像を手動でアップロードしてください。"
          : `登録に失敗しました (${errKey})`;
      setError(friendly);
      return;
    }

    const refreshRes = await fetch("/api/admin/picks");
    const json = (await refreshRes.json()) as { picks: PickEntry[] };
    setPicks(json.picks.filter((p) => p.method === "instagram-url"));
    resetForm();
  }

  async function remove(p: PickEntry) {
    if (!confirm(`「${p.title ?? p.permalink ?? p.id}」を削除しますか？`)) return;
    const res = await fetch(`/api/admin/picks?id=${encodeURIComponent(p.id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("削除に失敗しました");
      return;
    }
    const json = (await res.json()) as { picks: PickEntry[] };
    setPicks(json.picks.filter((x) => x.method === "instagram-url"));
  }

  function startEdit(p: PickEntry) {
    setEditingId(p.id);
    setEditForm({ ...p });
    setEditThumbFile(null);
    setEditThumbPreview(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditThumbFile(null);
    setEditThumbPreview(null);
    setError(null);
  }

  function onEditThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setEditThumbFile(file);
    if (file) {
      setEditThumbPreview(URL.createObjectURL(file));
    } else {
      setEditThumbPreview(null);
    }
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    setBusy(true);
    setBusyLabel("保存中...");
    setError(null);
    try {
      let thumbnailUrl: string | undefined;
      if (editThumbFile) {
        setBusyLabel("画像をアップロード中...");
        thumbnailUrl = await uploadThumbnail(editThumbFile);
      }
      const updates: Record<string, unknown> = {
        title: editForm.title ?? "",
        author: editForm.author ?? "",
        authorUrl: editForm.authorUrl ?? "",
        caption: editForm.caption ?? "",
        pentaComment: editForm.pentaComment ?? "",
        postedAt: editForm.postedAt ?? "",
        tags: editForm.tags ?? [],
      };
      if (thumbnailUrl) updates.thumbnailUrl = thumbnailUrl;
      const rawEmbed = editForm.embedHtml ?? "";
      if (rawEmbed.trim()) {
        const sanitized = sanitizeEmbedHtml(rawEmbed);
        if (!sanitized) {
          setError(
            "埋め込みコードが無効です。Instagram のシェア → 埋め込みコードをコピーで取得したコードを貼り付けてください",
          );
          setBusy(false);
          return;
        }
        updates.embedHtml = sanitized;
      } else if (editForm.embedHtml === "") {
        updates.embedHtml = "";
      }
      const res = await fetch("/api/admin/picks", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: editingId, updates }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "update_failed");
      }
      const json = (await res.json()) as { picks: PickEntry[] };
      setPicks(json.picks.filter((p) => p.method === "instagram-url"));
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
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl border border-black/5 p-6 space-y-4"
      >
        <h2 className="font-bold text-lg">投稿を登録</h2>

        <div className="flex gap-2 p-3 bg-brand-light/30 rounded-xl">
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="radio"
              checked={form.method === "url"}
              onChange={() => { setForm({ ...EMPTY, method: "url" }); setThumbnailFile(null); setThumbnailPreview(null); }}
            />
            <span className="text-sm font-semibold">URLから登録</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="radio"
              checked={form.method === "embed"}
              onChange={() => { setForm({ ...EMPTY, method: "embed" }); setThumbnailFile(null); setThumbnailPreview(null); }}
            />
            <span className="text-sm font-semibold">埋め込みコードから登録</span>
          </label>
        </div>

        {form.method === "url" ? (
          <Field
            label="Instagram 投稿URL"
            required
            hint="Meta oEmbed Read で公式埋め込みコードを取得し、ギャラリーには Instagram 公式の埋め込みカード（キャプション非表示）として表示します。Meta 審査前は埋め込みコードを直接貼り付ける方が確実です。"
          >
            <input
              type="url"
              value={form.permalink}
              onChange={(e) => set("permalink", e.target.value)}
              placeholder="https://www.instagram.com/p/XXXXXXXX/"
              className={inputCls}
              required
            />
          </Field>
        ) : (
          <Field
            label="埋め込みコード"
            required
            hint="Instagram の投稿で「シェア → 埋め込みコードをコピー」して貼り付け。そのままギャラリーの公式埋め込みカードとして表示されます。"
          >
            <textarea
              value={form.embedHtml}
              onChange={(e) => set("embedHtml", e.target.value)}
              rows={4}
              placeholder='<blockquote class="instagram-media" data-instgrm-permalink="..."'
              className={inputCls}
              required
            />
          </Field>
        )}

        <Field
          label="サムネイル画像（任意・フォールバック）"
          hint="Instagram 公式埋め込みが取得できない場合のフォールバック。指定すると埋め込みではなくこの画像をカードに表示します。"
        >
          <div className="flex items-start gap-3">
            {thumbnailPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailPreview}
                alt="プレビュー"
                className="w-20 h-20 rounded-xl object-cover bg-paper flex-shrink-0 border border-black/10"
              />
            )}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onFileChange}
                className="block w-full text-sm text-ink-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-light file:text-brand-dark hover:file:bg-brand-light/80"
              />
            </div>
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="タイトル">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="ドラゴンの立体造形"
              className={inputCls}
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
          <Field label="作者名（@ユーザー名など）">
            <input
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              placeholder="@hiroba_user"
              className={inputCls}
            />
          </Field>
          <Field label="作者プロフィールURL">
            <input
              type="url"
              value={form.authorUrl}
              onChange={(e) => set("authorUrl", e.target.value)}
              placeholder="https://www.instagram.com/hiroba_user/"
              className={inputCls}
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
            placeholder="3dひろば, ドラゴン"
            className={inputCls}
          />
        </Field>

        <Field label="3Dぺんたコメント">
          <textarea
            value={form.pentaComment}
            onChange={(e) => set("pentaComment", e.target.value)}
            rows={2}
            placeholder="骨格から描いてるなんてすごい！"
            className={inputCls}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
          >
            {busy ? busyLabel : "登録する"}
          </button>
        </div>
      </form>

      <section>
        <h2 className="font-bold text-lg mb-4">登録済み ({picks.length})</h2>
        {picks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-ink-muted">
            まだ登録がありません。
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {picks.map((p) => (
              <li
                key={p.id}
                className="flex gap-3 bg-white rounded-2xl border border-black/5 p-3"
              >
                {p.mediaUrl || p.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.mediaUrl || p.thumbnailUrl}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover bg-paper flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-paper flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {p.title ?? "(無題)"}
                  </p>
                  <p className="text-xs text-ink-muted truncate">{p.author}</p>
                  {p.permalink && (
                    <a
                      href={p.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-[11px] text-brand-dark hover:underline truncate max-w-full"
                    >
                      {p.embedHtml ? "埋め込みコード" : p.permalink}
                    </a>
                  )}
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
              </li>
            ))}
          </ul>
        )}
      </section>

      {editingId && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">
                「{editForm.title ?? editForm.permalink ?? editForm.id}」を編集
              </h2>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-ink-muted hover:text-ink text-2xl"
              >
                ✕
              </button>
            </div>

            <Field
              label="サムネイル画像を差し替える"
              hint="新しく選ぶと、表示用のフォールバック画像が置き換わります。"
            >
              <div className="flex items-start gap-3">
                {(editThumbPreview ?? editForm.thumbnailUrl ?? editForm.mediaUrl) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      editThumbPreview ??
                      editForm.thumbnailUrl ??
                      editForm.mediaUrl
                    }
                    alt="プレビュー"
                    className="w-20 h-20 rounded-xl object-cover bg-paper flex-shrink-0 border border-black/10"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={onEditThumbChange}
                    className="block w-full text-sm text-ink-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-light file:text-brand-dark hover:file:bg-brand-light/80"
                  />
                </div>
              </div>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="タイトル">
                <input
                  value={editForm.title ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="投稿日">
                <input
                  type="date"
                  value={editForm.postedAt ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, postedAt: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="作者名">
                <input
                  value={editForm.author ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, author: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="作者プロフィールURL">
                <input
                  type="url"
                  value={editForm.authorUrl ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, authorUrl: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="キャプション">
              <textarea
                value={editForm.caption ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, caption: e.target.value })
                }
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
                onChange={(e) =>
                  setEditForm({ ...editForm, pentaComment: e.target.value })
                }
                rows={2}
                className={inputCls}
              />
            </Field>

            <Field
              label="埋め込みコード"
              hint="Instagram の投稿で「シェア → 埋め込みコードをコピー」したコードを貼り付け。保存するとギャラリーが公式 IG 埋め込みカードに切り替わります。空欄で保存すると埋め込みは外れます。"
            >
              <textarea
                value={editForm.embedHtml ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, embedHtml: e.target.value })
                }
                rows={4}
                placeholder='<blockquote class="instagram-media" data-instgrm-permalink="..." ...>'
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
                {busy ? busyLabel : "保存"}
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
