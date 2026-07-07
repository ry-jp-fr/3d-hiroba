"use client";

import { useState } from "react";
import type { SheetsPageConfig } from "@/lib/curation";

export function SheetsIntroManager({
  initial,
}: {
  initial: SheetsPageConfig;
}) {
  const [config, setConfig] = useState<SheetsPageConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/sheets", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "save_failed");
      }
      const json = (await res.json()) as { sheetsPage: SheetsPageConfig };
      setConfig(json.sheetsPage);
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
    <section className="bg-white rounded-3xl border border-black/5 p-6 space-y-4">
      <h2 className="font-bold text-lg">ページ紹介文</h2>
      <p className="text-xs text-ink-muted">
        /sheets ページ上部に表示されるタイトルと紹介文です。
      </p>

      <Field label="タイトル">
        <input
          value={config.title}
          onChange={(e) => setConfig({ ...config, title: e.target.value })}
          className={inputCls}
          placeholder="なぞりシート"
        />
      </Field>

      <Field label="紹介文" hint="改行はそのまま表示されます">
        <textarea
          value={config.description}
          onChange={(e) =>
            setConfig({ ...config, description: e.target.value })
          }
          rows={3}
          className={inputCls}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full bg-brand text-white font-semibold px-6 py-2 text-sm hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "保存中..." : "紹介文を保存"}
        </button>
      </div>
    </section>
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
