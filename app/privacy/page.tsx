import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 3Dひろば",
  description: "3Dひろばのプライバシーポリシーをご確認ください",
  robots: { index: false, follow: false },
};

export default function PrivacyPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const lang = searchParams.lang === "en" ? "en" : "ja";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Language Toggle */}
        <div className="flex justify-end gap-2 mb-8">
          <a
            href="?lang=ja"
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              lang === "ja"
                ? "bg-brand text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            日本語
          </a>
          <a
            href="?lang=en"
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              lang === "en"
                ? "bg-brand text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            English
          </a>
        </div>

        {lang === "ja" ? <PrivacyJA /> : <PrivacyEN />}

        {/* Contact Link */}
        <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-gray-700 mb-4">
            {lang === "ja"
              ? "プライバシーに関するご質問やご不明な点がございましたら、お気軽にお問い合わせください。"
              : "If you have any questions or concerns about our privacy practices, please contact us."}
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors"
          >
            {lang === "ja" ? "お問い合わせ" : "Contact Us"}
          </a>
        </div>
      </div>
    </div>
  );
}

function PrivacyJA() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
      <p className="text-gray-600 mb-8">最終更新：2026年4月27日</p>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 概要</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          3Dひろば（以下「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の適切な取扱いを行うことをお約束します。本ポリシーは、当サイトで収集する情報、その利用目的、保護方法について説明しています。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 収集する情報</h2>
        <p className="text-gray-700 leading-relaxed mb-4">当サイトは以下の情報を収集します：</p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>
            <strong>Instagram投稿情報</strong>：ハッシュタグを通じて、公開されているInstagram投稿のメタデータ（ユーザー名、投稿キャプション、投稿画像、投稿日時）
          </li>
          <li>
            <strong>ユーザー登録情報</strong>：ユーザーがサイトに登録した作品情報（作者名、作者URL、タイトル、説明文など）
          </li>
          <li>
            <strong>アップロード画像</strong>：ユーザーが手動でアップロードした画像・動画ファイル
          </li>
          <li>
            <strong>管理情報</strong>：サイト管理者が設定するハッシュタグ設定、ギャラリー設定など
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          <strong>当サイトは個人識別情報（メールアドレス、電話番号など）を意図的に収集しません。</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 情報の利用目的</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>ギャラリーへの作品表示・公開</li>
          <li>ユーザー投稿作品の保存・管理</li>
          <li>サイト機能の改善・アップデート</li>
          <li>エラーの診断・修正</li>
          <li>利用規約違反の検出・対応</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 情報の保存と管理</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          収集したデータは、Vercel（アメリカの展開・ホスティング企業）のBlobストレージおよびNext.jsサーバーに保存されます。データは定期的にバックアップされ、セキュアな環境で管理されています。
        </p>
        <p className="text-gray-700 leading-relaxed">
          キャッシュデータ（Instagram API取得済み情報など）は、最大1時間保持された後、自動的に削除されます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 第三者サービス</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          当サイトは、以下のサービスと連携しており、これらサービスプロバイダーは独自のプライバシーポリシーに基づいて情報を取扱います：
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Meta（Instagram）</strong>：公開投稿情報の取得（読み取り専用）
          </li>
          <li>
            <strong>Vercel</strong>：画像・動画ファイルのホスティング
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          これらサービスプロバイダーの詳細情報については、各社のプライバシーポリシーをご確認ください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookie と認証</h2>
        <p className="text-gray-700 leading-relaxed">
          管理パネルへのログイン時、当サイトは<strong>httpOnly Secure</strong> Cookie を使用してセッション情報を保存します。このCookieは安全な接続（HTTPS）を通じてのみ送受信され、JavaScriptからアクセスできません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. ユーザーの権利</h2>
        <p className="text-gray-700 leading-relaxed mb-4">ユーザーは以下の権利を有します：</p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>削除権</strong>：登録した作品の削除をリクエストできます
          </li>
          <li>
            <strong>訂正権</strong>：登録情報の修正をリクエストできます
          </li>
          <li>
            <strong>照会権</strong>：当サイトが保持するユーザー情報の確認をリクエストできます
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          これらのリクエストは、お問い合わせフォームからお送りください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. セキュリティ</h2>
        <p className="text-gray-700 leading-relaxed">
          当サイトは、収集した情報を保護するために、適切な技術的・組織的措置を実施しています。ただし、インターネット通信は完全に安全でないため、100% の安全を保証することはできません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 児童のプライバシー</h2>
        <p className="text-gray-700 leading-relaxed">
          当サイトは親子向けのサービスです。18歳未満のお子様がサイトを利用する場合、保護者の監督下で利用いただくことをお願いします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. ポリシーの変更</h2>
        <p className="text-gray-700 leading-relaxed">
          このプライバシーポリシーは、法律の変更やサービス改善に伴い、予告なく変更されることがあります。重大な変更がある場合は、サイト内で通知いたします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. 連携・パートナーシップ</h2>
        <p className="text-gray-700 leading-relaxed">
          3Dひろばは、Scrib3D（スクリブ3D）と協力して運営されています。詳細情報は、<a href="/partners" className="text-brand hover:underline">パートナーページ</a>をご参照ください。
        </p>
      </section>
    </article>
  );
}

function PrivacyEN() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: April 27, 2026</p>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          3D-Hiroba (hereinafter "the Site") respects user privacy and commits to appropriately handling personal information. This policy explains what information we collect, how we use it, and how we protect it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Site collects the following information:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>
            <strong>Instagram Post Information</strong>: Public Instagram post metadata via hashtags (username, caption, images, post date)
          </li>
          <li>
            <strong>User Submission Information</strong>: Artwork details submitted by users (artist name, artist URL, title, description)
          </li>
          <li>
            <strong>Uploaded Media</strong>: Images and video files manually uploaded by users
          </li>
          <li>
            <strong>Admin Settings</strong>: Hashtag and gallery configurations set by administrators
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          <strong>The Site does not intentionally collect personal identifying information (email addresses, phone numbers, etc.).</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Information</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Displaying and publishing artworks in the gallery</li>
          <li>Storing and managing user submissions</li>
          <li>Improving and updating site features</li>
          <li>Diagnosing and fixing errors</li>
          <li>Detecting and responding to policy violations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Management</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Collected data is stored on Vercel (US-based hosting company) Blob storage and Next.js servers. Data is regularly backed up and managed in a secure environment.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Cached data (such as previously fetched Instagram API information) is automatically deleted after a maximum of 1 hour.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Site integrates with the following services, which operate under their own privacy policies:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Meta (Instagram)</strong>: Retrieving public post information (read-only)
          </li>
          <li>
            <strong>Vercel</strong>: Hosting images and video files
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          Please review each service provider's privacy policy for more details.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Authentication</h2>
        <p className="text-gray-700 leading-relaxed">
          When logging into the admin panel, the Site uses <strong>httpOnly Secure</strong> cookies to store session information. These cookies are transmitted only over secure connections (HTTPS) and cannot be accessed by JavaScript.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Rights</h2>
        <p className="text-gray-700 leading-relaxed mb-4">Users have the following rights:</p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Right to Deletion</strong>: Request deletion of submitted artworks
          </li>
          <li>
            <strong>Right to Correction</strong>: Request correction of registered information
          </li>
          <li>
            <strong>Right to Access</strong>: Request information about what data we hold about you
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          Please submit such requests through our contact form.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Security</h2>
        <p className="text-gray-700 leading-relaxed">
          The Site implements appropriate technical and organizational measures to protect collected information. However, no internet transmission is completely secure, and we cannot guarantee 100% safety.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
        <p className="text-gray-700 leading-relaxed">
          The Site is designed for family use. If children under 18 use the Site, please do so under parental supervision.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Policy Changes</h2>
        <p className="text-gray-700 leading-relaxed">
          This privacy policy may be updated without notice to comply with legal changes or improve services. We will notify you of significant changes through the Site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Partnerships</h2>
        <p className="text-gray-700 leading-relaxed">
          3D-Hiroba is operated in partnership with Scrib3D. For more details, see the <a href="/partners" className="text-brand hover:underline">partners page</a>.
        </p>
      </section>
    </article>
  );
}
