"use client";

import { useRef, useState } from "react";
import type { HeroConfig, HeroPhoto } from "@/lib/curation";

type UploadedMeta = {
  url: string;
  mediaType: "image" | "video";
  mime: string;
  size: number;
};

export function HeroManager({ initial }: { initial: HeroConfig }) {
  const [hero, setHero] = useState<HeroConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const photo1InputRef = useRef<HTMLInputElement>(null);
  const photo2InputRef = useRef<HTMLInputElement>(null);

  function updatePhoto(
    which: "photo1" | "photo2",
    patch: Partial<HeroPhoto>,
  ) {
    setHero((prev) => ({
      ...prev,
      [which]: { ...prev[which], ...patch },
    }));
  }

  async function uploadFile(file: File): Promise<UploadedMeta> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const errorMsg = j.message ? `${j.error}: ${j.message}` : (j.error ?? "upload_failed");
      throw new Error(errorMsg);
    }
    return (await res.json()) as UploadedMeta;
  }

  async function handleImageUpload(
    which: "photo1" | "photo2",
    file: File,
  ) {
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadFile(file);
      updatePhoto(which, { imageUrl: uploaded.url });
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
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(hero),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "save_failed");
      }
      const json = (await res.json()) as { hero: HeroConfig };
      setHero(json.hero);
      setMessage("保存しました");
    } catch (err) {
      setError(
        err instanceof Error ? `保存に失敗しました: ${err.message}` : "保存に失敗しました",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl border border-black/5 p-6 space-y-4">
        <h2 className="font-bold text-lg">テキスト</h2>

        <Field label="上部の小見出し（例: できた！って、うれしい。）">
          <input
            value={hero.eyebrow}
            onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
            className={inputCls}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="タイトル 強調部分"
            hint="オレンジで強調される先頭文字列"
          >
            <input
              value={hero.titleAccent}
              onChange={(e) =>
                setHero({ ...hero, titleAccent: e.target.value })
              }
              className={inputCls}
              placeholder="できた！"
            />
          </Field>
          <Field
            label="タイトル 続き"
            hint="改行は Enter。例: が、↵つながる。"
          >
            <textarea
              value={hero.titleRest}
              onChange={(e) =>
                setHero({ ...hero, titleRest: e.target.value })
              }
              rows={2}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="説明文">
          <textarea
            value={hero.description}
            onChange={(e) => setHero({ ...hero, description: e.target.value })}
            rows={4}
            className={inputCls}
          />
        </Field>
      </section>

      <section className="bg-white rounded-3xl border border-black/5 p-6 space-y-4">
        <h2 className="font-bold text-lg">画像 1（左上・大きい方）</h2>
        <PhotoEditor
          photo={hero.photo1}
          onChange={(patch) => updatePhoto("photo1", patch)}
          onUpload={(file) => handleImageUpload("photo1", file)}
          inputRef={photo1InputRef}
          busy={busy}
        />
      </section>

      <section className="bg-white rounded-3xl border border-black/5 p-6 space-y-4">
        <h2 className="font-bold text-lg">画像 2（右下・小さい方）</h2>
        <PhotoEditor
          photo={hero.photo2}
          onChange={(patch) => updatePhoto("photo2", patch)}
          onUpload={(file) => handleImageUpload("photo2", file)}
          inputRef={photo2InputRef}
          busy={busy}
        />
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

function PhotoEditor({
  photo,
  onChange,
  onUpload,
  inputRef,
  busy,
}: {
  photo: HeroPhoto;
  onChange: (patch: Partial<HeroPhoto>) => void;
  onUpload: (file: File) => Promise<void>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  busy: boolean;
}) {
  return (
    <div className="grid sm:grid-cols-[160px_1fr] gap-4">
      <div className="w-40 h-40 rounded-2xl bg-paper overflow-hidden flex-shrink-0">
        {photo.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.imageUrl}
            alt={photo.alt ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-ink-muted">
            画像なし
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Field label="画像ファイルをアップロード">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f).then(() => {
                if (inputRef.current) inputRef.current.value = "";
              });
            }}
            disabled={busy}
            className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-light file:text-brand-dark file:font-semibold hover:file:bg-brand-light/70"
          />
        </Field>
        <Field label="または画像 URL を直接指定">
          <input
            value={photo.imageUrl}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            className={inputCls}
            placeholder="https://..."
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="表示する作者名（任意）" hint="例: @hiroba_user_a">
            <input
              value={photo.author ?? ""}
              onChange={(e) => onChange({ author: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="代替テキスト (alt)">
            <input
              value={photo.alt ?? ""}
              onChange={(e) => onChange({ alt: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
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
