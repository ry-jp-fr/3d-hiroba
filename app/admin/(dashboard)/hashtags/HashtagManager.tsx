"use client";

import { FormEvent, useState, useTransition } from "react";
import type { HashtagEntry } from "@/lib/curation";

export function HashtagManager({ initial }: { initial: HashtagEntry[] }) {
  const [hashtags, setHashtags] = useState<HashtagEntry[]>(initial);
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = tag.trim().replace(/^#/, "");
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/hashtags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tag: trimmed }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("追加に失敗しました");
      return;
    }
    const json = (await res.json()) as { hashtags: HashtagEntry[] };
    startTransition(() => {
      setHashtags(json.hashtags);
      setTag("");
    });
  }

  async function toggle(h: HashtagEntry) {
    const optimistic = hashtags.map((x) =>
      x.id === h.id ? { ...x, enabled: !h.enabled } : x,
    );
    setHashtags(optimistic);
    const res = await fetch("/api/admin/hashtags", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: h.id, enabled: !h.enabled }),
    });
    if (!res.ok) {
      setHashtags(hashtags);
      setError("更新に失敗しました");
      return;
    }
    const json = (await res.json()) as { hashtags: HashtagEntry[] };
    setHashtags(json.hashtags);
  }

  async function remove(h: HashtagEntry) {
    if (!confirm(`#${h.tag} を削除しますか？`)) return;
    const res = await fetch(`/api/admin/hashtags?id=${encodeURIComponent(h.id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("削除に失敗しました");
      return;
    }
    const json = (await res.json()) as { hashtags: HashtagEntry[] };
    setHashtags(json.hashtags);
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={onAdd}
        className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border border-black/5 p-4"
      >
        <div className="flex-1 flex items-center rounded-xl border border-black/10 bg-paper px-3">
          <span className="text-ink-muted pr-1">#</span>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="3dひろば"
            className="flex-1 bg-transparent py-2 text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !tag.trim()}
          className="rounded-full bg-brand text-white font-semibold px-5 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "追加中..." : "ハッシュタグを追加"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="space-y-2">
        {hashtags.length === 0 && (
          <li className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-ink-muted">
            まだハッシュタグが登録されていません。
          </li>
        )}
        {hashtags.map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between bg-white rounded-2xl border border-black/5 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">#{h.tag}</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  h.enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-black/5 text-ink-muted"
                }`}
              >
                {h.enabled ? "取得中" : "停止中"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggle(h)}
                className="text-xs px-3 py-1.5 rounded-full bg-paper hover:bg-black/5"
              >
                {h.enabled ? "停止" : "再開"}
              </button>
              <button
                type="button"
                onClick={() => remove(h)}
                className="text-xs px-3 py-1.5 rounded-full text-red-700 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
