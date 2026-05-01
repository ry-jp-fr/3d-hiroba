"use client";

import { useState } from "react";
import type { HomepageConfig } from "@/lib/curation";

export function HomepageManager({
  initialData,
}: {
  initialData: HomepageConfig;
}) {
  const [homepage, setHomepage] = useState<HomepageConfig>(initialData);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(homepage),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "save_failed");
      }
      setMessage("保存しました");
    } catch (err) {
      setError(
        err instanceof Error
          ? `保存に失敗しました: ${err.message}`
          : "保存に失敗しました",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl border border-black/5 p-6 space-y-4">
        <h2 className="font-bold text-lg">ギャラリーセクション</h2>

        <Field label="ギャラリータイトル">
          <input
            value={homepage.galleryTitle}
            onChange={(e) =>
              setHomepage({ ...homepage, galleryTitle: e.target.value })
            }
            className={inputCls}
            placeholder="みんなの「できた！」"
          />
        </Field>

        <Field
          label="サブタイトルラベル"
          hint="ピックアップ件数の前に表示される文字"
        >
          <input
            value={homepage.gallerySubtitleLabel}
            onChange={(e) =>
              setHomepage({ ...homepage, gallerySubtitleLabel: e.target.value })
            }
            className={inputCls}
            placeholder="ピックアップ"
          />
        </Field>

        <Field label="説明文">
          <textarea
            value={homepage.galleryDescription}
            onChange={(e) =>
              setHomepage({ ...homepage, galleryDescription: e.target.value })
            }
            rows={3}
            className={inputCls}
            placeholder="Instagramで #3dひろば をつけて投稿すると、このひろばに掲載される可能性があります。掲載作品は全国の実店舗モニターで紹介されることも。"
          />
        </Field>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "処理中..." : "保存"}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-black/10 bg-paper px-3 py-2 text-sm focus:outline-none focus:border-brand";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </label>
  );
}
