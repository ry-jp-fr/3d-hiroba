"use client";

import { useState } from "react";
import type { SubmissionEntry } from "@/lib/curation";

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;

function isVideo(url: string | undefined): boolean {
  return Boolean(url && VIDEO_EXT.test(url));
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

export function SubmissionsManager({
  initial,
}: {
  initial: SubmissionEntry[];
}) {
  const [items, setItems] = useState<SubmissionEntry[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function approve(s: SubmissionEntry) {
    if (s.approvedPickId) return;
    if (!confirm(`「${s.title}」を承認してギャラリーに掲載しますか？`)) return;
    setBusyId(s.id);
    setError(null);
    const res = await fetch("/api/admin/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "approve", id: s.id }),
    });
    setBusyId(null);
    if (!res.ok) {
      setError("承認に失敗しました");
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    setItems(json.submissions);
  }

  async function remove(s: SubmissionEntry) {
    if (!confirm(`「${s.title}」の応募を削除しますか？`)) return;
    setBusyId(s.id);
    setError(null);
    const res = await fetch(
      `/api/admin/submissions?id=${encodeURIComponent(s.id)}`,
      { method: "DELETE" },
    );
    setBusyId(null);
    if (!res.ok) {
      setError("削除に失敗しました");
      return;
    }
    const json = (await res.json()) as { submissions: SubmissionEntry[] };
    setItems(json.submissions);
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-ink-muted">
          まだ応募はありません。
        </div>
      )}

      <ul className="space-y-3">
        {items.map((s) => {
          const approved = Boolean(s.approvedPickId);
          const busy = busyId === s.id;
          return (
            <li
              key={s.id}
              className="bg-white rounded-2xl border border-black/5 p-5 flex flex-col sm:flex-row gap-4"
            >
              <div className="sm:w-36 shrink-0">
                {s.imageUrl ? (
                  isVideo(s.imageUrl) ? (
                    <video
                      src={s.imageUrl}
                      className="w-full aspect-square object-cover rounded-xl bg-black/5"
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="w-full aspect-square object-cover rounded-xl bg-black/5"
                    />
                  )
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-paper border border-dashed border-black/10 flex items-center justify-center text-xs text-ink-muted text-center px-2">
                    Instagram
                    <br />
                    投稿URL
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <h2 className="font-bold text-base truncate">{s.title}</h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {formatDate(s.submittedAt)} · {s.name}
                    </p>
                  </div>
                  {approved && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      承認済み
                    </span>
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

                <div className="flex items-center gap-2 pt-2">
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
                    onClick={() => remove(s)}
                    disabled={busy}
                    className="text-xs px-3 py-1.5 rounded-full text-red-700 hover:bg-red-50 disabled:opacity-40"
                  >
                    削除
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
