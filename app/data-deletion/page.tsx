import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'データ削除リクエスト | 3Dひろば',
  robots: { index: false, follow: false },
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ユーザーデータの削除
        </h1>
        <p className="text-gray-500 text-sm mb-10">User Data Deletion Request</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">削除できるデータ</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>ギャラリーに掲載されているあなたの投稿・画像</li>
            <li>投稿に紐づくタイトル・キャプション・作者情報</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">削除リクエストの方法</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-3">
            <li>
              下のボタンからお問い合わせページを開く
            </li>
            <li>
              件名で「<strong>データ削除のご要望</strong>」を選択する
            </li>
            <li>
              メッセージ欄に削除希望の投稿URL または 作者名を記載して送信する
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">対応時間</h2>
          <p className="text-gray-700">
            リクエスト受領後、<strong>10日以内</strong>に対応いたします。
            削除完了後にご連絡のメールをお送りします。
          </p>
        </section>

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-1 font-medium">削除リクエストを送る</p>
            <p className="text-sm text-gray-500">
              メールでのご連絡も受け付けています：{' '}
              <a href="mailto:help@scrib3dpen.jp" className="text-blue-600 hover:underline">
                help@scrib3dpen.jp
              </a>
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 text-center whitespace-nowrap"
          >
            お問い合わせフォーム
          </Link>
        </div>
      </div>
    </main>
  );
}
