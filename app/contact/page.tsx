import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'お問い合わせ - 3Dひろば',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">お問い合わせ</h1>
          <p className="mt-2 text-gray-600">
            ご質問やご意見がありましたら、お気軽にお問い合わせください。
          </p>
        </div>

        <ContactForm />

        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-900">直接メール</h2>
          <p className="mt-2 text-gray-600">
            メールでのお問い合わせをご希望の場合は、以下のアドレスまでお気軽にご連絡ください。
          </p>
          <a
            href="mailto:ryo.yabuta@fermento-tokyo.com"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            ryo.yabuta@fermento-tokyo.com
          </a>
        </div>
      </div>
    </main>
  );
}
