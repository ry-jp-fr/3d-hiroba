import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="text-sm font-semibold text-brand-dark tracking-widest mb-3">
        404
      </p>
      <h1 className="text-3xl font-bold">ページが見つかりません</h1>
      <p className="mt-4 text-ink-muted">
        お探しのページは移動または削除された可能性があります。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-brand text-white px-5 py-2.5 font-semibold hover:bg-brand-dark"
      >
        トップへ戻る
      </Link>
    </div>
  );
}
