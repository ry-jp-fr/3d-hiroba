'use client';

import { useState } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'other',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormState('error');
      setErrorMessage('有効なメールアドレスを入力してください。');
      return;
    }

    if (!formData.name.trim() || !formData.message.trim()) {
      setFormState('error');
      setErrorMessage('すべてのフィールドを入力してください。');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || '送信に失敗しました。');
      }

      setFormState('success');
      setFormData({
        name: '',
        email: '',
        subject: 'other',
        message: '',
      });
    } catch (err) {
      setFormState('error');
      setErrorMessage(
        err instanceof Error ? err.message : '送信に失敗しました。'
      );
    }
  };

  return (
    <>
      {formState === 'success' && (
        <div className="mb-8 rounded-lg bg-green-50 p-4 text-green-700">
          ご送信ありがとうございました。確認してのちご返信させていただきます。
        </div>
      )}

      {formState === 'error' && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={formState === 'submitting'}
            required
            className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            placeholder="山田太郎"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={formState === 'submitting'}
            required
            className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            placeholder="example@example.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            件名 <span className="text-red-500">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={formState === 'submitting'}
            className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          >
            <option value="privacy">プライバシーについてのご質問</option>
            <option value="deletion">データ削除のご要望</option>
            <option value="other">その他のお問い合わせ</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            メッセージ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            disabled={formState === 'submitting'}
            required
            rows={6}
            className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            placeholder="ご質問・ご意見をお聞かせください。"
          />
        </div>

        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {formState === 'submitting' ? '送信中...' : '送信'}
        </button>
      </form>
    </>
  );
}
