"use client";

import { FormEvent, useState } from "react";
import type { PickEntry } from "@/lib/curation";

type FormState = {
  method: "url" | "embed";
  permalink: string;
  mediaUrl: string;
  embedHtml: string;
  thumbnailUrl: string;
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
  mediaUrl: "",
  embedHtml: "",
  thumbnailUrl: "",
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.method === "url") {
      if (!form.permalink.trim()) {
        setError("投稿URLは必須です");
        return;
      }
      if (!extractShortcode(form.permalink)) {
        setError("Instagramの投稿URLを入力してください");
        return;
      }
      if (!form.mediaUrl.trim()) {
        setError("カバー画像URLは必須です");
        return;
      }

      setBusy(true);
      const res = await fetch("/api/admin/picks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          method: "instagram-url",
          mediaType: "image",
          permalink: form.permalink.trim(),
          mediaUrl: form.mediaUrl.trim(),
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
        setError(`登録に失敗しました (${j.error ?? res.status})`);
        return;
      }
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

      setBusy(true);
      const res = await fetch("/api/admin/picks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          method: "instagram-url",
          mediaType: "image",
          permalink: permalinkFromEmbed,
          embedHtml: sanitized,
          thumbnailUrl: form.thumbnailUrl.trim() || undefined,
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
        setError(`登録に失敗しました (${j.error ?? res.status})`);
        return;
      }
    }

    const refreshRes = await fetch("/api/admin/picks");
    const json = (await refreshRes.json()) as { picks: PickEntry[] };
    setPicks(json.picks.filter((p) => p.method === "instagram-url"));
    setForm(EMPTY);
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
              onChange={() => setForm({ ...EMPTY, method: "url" })}
            />
            <span className="text-sm font-semibold">URLから登録</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="radio"
              checked={form.method === "embed"}
              onChange={() => setForm({ ...EMPTY, method: "embed" })}
            />
            <span className="text-sm font-semibold">埋め込みコードから登録</span>
          </label>
        </div>

        {form.method === "url" ? (
          <>
            <Field label="Instagram 投稿URL" required>
              <input
                type="url"
                value={form.permalink}
                onChange={(e) => set("permalink", e.target.value)}
                placeholder="https://www.instagram.com/p/XXXXXXXX/"
                className={inputCls}
                required
              />
            </Field>

            <Field
              label="カバー画像URL"
              required
              hint="Instagramの画像は直リンクNGな場合があるため、別ホスト（Cloudinary等）にアップロードしたURLを推奨"
            >
              <input
                type="url"
                value={form.mediaUrl}
                onChange={(e) => set("mediaUrl", e.target.value)}
                placeholder="https://res.cloudinary.com/..../image.jpg"
                className={inputCls}
                required
              />
            </Field>
          </>
        ) : (
          <>
            <Field
              label="埋め込みコード"
              required
              hint="Instagram で投稿を開き「シェア」→「コードをコピー」で取得したHTMLコードを貼り付けてください"
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

            <Field
              label="サムネイル画像URL"
              hint="ギャラリーに表示する画像。省略した場合はグレースケールプレースホルダーになります"
            >
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => set("thumbnailUrl", e.target.value)}
                placeholder="https://res.cloudinary.com/..../thumb.jpg"
                className={inputCls}
              />
            </Field>
          </>
        )}

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
            {busy ? "登録中..." : "登録する"}
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
                  <div className="mt-2 flex justify-end">
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
