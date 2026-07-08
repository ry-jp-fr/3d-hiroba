"use client";

import { useState } from "react";
import type { BannerEntry } from "@/lib/curation";
import { uploadImageBlob } from "@/lib/upload-image-blob";

const MAX_BANNERS = 6;

function newDraftBanner(): BannerEntry {
  const rand = Math.random().toString(36).slice(2, 8);
  return {
    id: `banner-${Date.now().toString(36)}-${rand}`,
    imageUrl: "",
    linkUrl: undefined,
    alt: undefined,
  };
}

export function BannerManager({ initial }: { initial: BannerEntry[] }) {
  const [banners, setBanners] = useState<BannerEntry[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function patchBanner(id: string, patch: Partial<BannerEntry>) {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  }

  function removeBanner(id: string) {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  function moveBanner(id: string, dir: -1 | 1) {
    setBanners((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  }

  function addBanner() {
    if (banners.length >= MAX_BANNERS) return;
    setBanners((prev) => [...prev, newDraftBanner()]);
  }

  async function handleUpload(id: string, file: File) {
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImageBlob(file, file.name);
      patchBanner(id, { imageUrl: url });
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

  async function save() {
    const missingImage = banners.some((b) => !b.imageUrl.trim());
    if (missingImage) {
      setError("画像が未設定のバナーがあります。画像を設定するか削除してください。");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ banners }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "save_failed");
      }
      const json = (await res.json()) as { banners: BannerEntry[] };
      setBanners(json.banners);
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
      {banners.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-ink-muted">
          バナーはまだありません。「バナーを追加」から登録してください。
        </p>
      ) : (
        banners.map((banner, i) => (
          <section
            key={banner.id}
            className="bg-white rounded-3xl border border-black/5 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">バナー {i + 1}</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBanner(banner.id, -1)}
                  disabled={busy || i === 0}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-black/10 hover:bg-black/5 disabled:opacity-30"
                  aria-label="上へ"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBanner(banner.id, 1)}
                  disabled={busy || i === banners.length - 1}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-black/10 hover:bg-black/5 disabled:opacity-30"
                  aria-label="下へ"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeBanner(banner.id)}
                  disabled={busy}
                  className="ml-2 text-xs px-3 py-1.5 rounded-full text-red-700 hover:bg-red-50 disabled:opacity-30"
                >
                  削除
                </button>
              </div>
            </div>

            <div className="w-full max-w-md aspect-[3/1] rounded-2xl bg-paper overflow-hidden">
              {banner.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={banner.imageUrl}
                  alt={banner.alt ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-ink-muted">
                  画像なし（推奨 1200×400px / 3:1）
                </div>
              )}
            </div>

            <Field label="画像ファイルをアップロード">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    handleUpload(banner.id, f).then(() => {
                      e.target.value = "";
                    });
                  }
                }}
                disabled={busy}
                className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-light file:text-brand-dark file:font-semibold hover:file:bg-brand-light/70"
              />
            </Field>

            <Field label="または画像 URL を直接指定">
              <input
                value={banner.imageUrl}
                onChange={(e) =>
                  patchBanner(banner.id, { imageUrl: e.target.value })
                }
                className={inputCls}
                placeholder="https://..."
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field
                label="リンク先 URL（任意）"
                hint="クリックで移動する先。空欄なら画像だけ表示。/sheets のようなサイト内パスも可"
              >
                <input
                  value={banner.linkUrl ?? ""}
                  onChange={(e) =>
                    patchBanner(banner.id, {
                      linkUrl: e.target.value || undefined,
                    })
                  }
                  className={inputCls}
                  placeholder="https://... または /sheets"
                />
              </Field>
              <Field label="代替テキスト (alt)">
                <input
                  value={banner.alt ?? ""}
                  onChange={(e) =>
                    patchBanner(banner.id, {
                      alt: e.target.value || undefined,
                    })
                  }
                  className={inputCls}
                  placeholder="バナーの内容説明"
                />
              </Field>
            </div>
          </section>
        ))
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addBanner}
          disabled={busy || banners.length >= MAX_BANNERS}
          className="rounded-full border border-black/10 px-5 py-2 text-sm font-semibold hover:bg-black/5 disabled:opacity-40"
        >
          + バナーを追加{banners.length >= MAX_BANNERS ? `（最大 ${MAX_BANNERS} 件）` : ""}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "処理中..." : "保存"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}
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
