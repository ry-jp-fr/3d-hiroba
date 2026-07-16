"use client";

import { useState } from "react";
import type { PartnerSectionConfig } from "@/lib/curation";

export function PartnerSectionManager({
  initialData,
}: {
  initialData: PartnerSectionConfig;
}) {
  const [config, setConfig] = useState<PartnerSectionConfig>(initialData);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    if (!config.heading.trim()) {
      setError("見出しを入力してください");
      return;
    }
    if (!config.body.trim()) {
      setError("本文を入力してください");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/partner-section", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "save_failed");
      }
      const json = (await res.json()) as PartnerSectionConfig;
      setConfig(json);
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

  const linkPreviewOk =
    !config.linkUrl || (config.linkText ?? "").trim().length > 0;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl border border-black/5 p-6 space-y-4">
        <h2 className="font-bold text-lg">公式パートナーセクション</h2>
        <p className="text-xs text-ink-muted">
          /about ページ末尾に表示される見出しと本文です。
        </p>

        <Field label="見出し">
          <input
            value={config.heading}
            onChange={(e) => setConfig({ ...config, heading: e.target.value })}
            className={inputCls}
            placeholder="公式パートナーについて"
          />
        </Field>

        <Field label="本文" hint="改行はそのまま表示されます">
          <textarea
            value={config.body}
            onChange={(e) => setConfig({ ...config, body: e.target.value })}
            rows={5}
            className={inputCls}
            placeholder="Scrib3D（スクリブ3D）は、3Dひろばの公式パートナーです。"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="リンクにする語句（任意）"
            hint="本文中でこの語句と完全一致する部分がリンクになります。例: Scrib3D"
          >
            <input
              value={config.linkText ?? ""}
              onChange={(e) =>
                setConfig({ ...config, linkText: e.target.value })
              }
              className={inputCls}
              placeholder="Scrib3D"
            />
          </Field>
          <Field
            label="リンク先 URL（任意）"
            hint="両方入力すると本文中の語句がリンクになります"
          >
            <input
              value={config.linkUrl ?? ""}
              onChange={(e) =>
                setConfig({ ...config, linkUrl: e.target.value })
              }
              className={inputCls}
              placeholder="https://..."
            />
          </Field>
        </div>

        {!linkPreviewOk && (
          <p className="text-xs text-amber-700">
            リンク先 URL のみ入力されています。リンクを有効にするには「リンクにする語句」も入力してください。
          </p>
        )}
        {config.linkUrl && config.linkText?.trim() && (
          <p className="text-xs text-ink-muted">
            {config.body.includes(config.linkText.trim())
              ? `「${config.linkText.trim()}」がリンクになります。`
              : `本文中に「${config.linkText.trim()}」という語句が見つからないため、リンクは表示されません。`}
          </p>
        )}
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
