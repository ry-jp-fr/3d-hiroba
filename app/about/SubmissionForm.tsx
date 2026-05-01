"use client";

import { useState } from "react";

type FormData = {
  title: string;
  name: string;
  email: string;
  imageUrl?: string;
  instagramUrl?: string;
  notes?: string;
  consent: boolean;
  parentalConsent: boolean;
};

type FormErrors = {
  [key in keyof FormData]?: string;
};

export function SubmissionForm() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    name: "",
    email: "",
    imageUrl: "",
    instagramUrl: "",
    notes: "",
    consent: false,
    parentalConsent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "作品名を入力してください";
    }

    if (!formData.name.trim()) {
      newErrors.name = "お名前またはニックネームを入力してください";
    }

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    // Check that at least one of image or instagram URL is provided
    if (!formData.imageUrl?.trim() && !formData.instagramUrl?.trim()) {
      newErrors.imageUrl =
        "作品画像・動画またはInstagram投稿URLのどちらかを入力してください";
    }

    if (!formData.consent) {
      newErrors.consent = "掲載許諾に同意してください";
    }

    if (!formData.parentalConsent) {
      newErrors.parentalConsent = "保護者同意に同意してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "送信に失敗しました");
      }

      setSubmitMessage({
        type: "success",
        text: "ご応募ありがとうございます。運営側で確認させていただきます。",
      });

      // Reset form
      setFormData({
        title: "",
        name: "",
        email: "",
        imageUrl: "",
        instagramUrl: "",
        notes: "",
        consent: false,
        parentalConsent: false,
      });
    } catch (err) {
      setSubmitMessage({
        type: "error",
        text: err instanceof Error ? err.message : "送信に失敗しました",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <ul className="text-[11px] text-ink-muted space-y-1 mb-6">
        <li>・顔や個人が特定できる情報が写り込まないようご注意ください。</li>
        <li>・掲載後の削除をご希望の場合は、サイト運営までご連絡ください。</li>
      </ul>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 作品名 */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-ink mb-2">
            作品名 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            placeholder="例：ドラゴン、ライトセーバー"
            className={`w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand ${
              errors.title ? "border-red-300" : "border-black/10"
            }`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        {/* お名前／ニックネーム */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-ink mb-2">
            お名前／ニックネーム <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder="例：田中太郎、太郎さん"
            className={`w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand ${
              errors.name ? "border-red-300" : "border-black/10"
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ink mb-2">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="example@example.com"
            className={`w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand ${
              errors.email ? "border-red-300" : "border-black/10"
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* 作品画像・動画またはInstagram投稿URL */}
        <div className="space-y-4 rounded-lg border border-black/5 p-4 bg-white">
          <p className="text-sm font-semibold text-ink">
            作品画像・動画またはInstagram投稿URL <span className="text-red-500">*</span>
          </p>
          <p className="text-xs text-ink-muted">
            以下のどちらかを入力してください。
          </p>

          <div>
            <label htmlFor="imageUrl" className="block text-xs font-semibold text-ink mb-2">
              作品画像・動画URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={formData.imageUrl || ""}
              onChange={(e) => {
                setFormData({ ...formData, imageUrl: e.target.value });
                if (errors.imageUrl) setErrors({ ...errors, imageUrl: undefined });
              }}
              placeholder="https://..."
              className="w-full rounded-lg border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              あらかじめ画像・動画をクラウドストレージ等にアップロードし、共有URLを入力してください。
            </p>
          </div>

          <div className="flex items-center justify-center">
            <span className="text-xs text-ink-muted">または</span>
          </div>

          <div>
            <label htmlFor="instagramUrl" className="block text-xs font-semibold text-ink mb-2">
              Instagram投稿URL
            </label>
            <input
              id="instagramUrl"
              type="url"
              value={formData.instagramUrl || ""}
              onChange={(e) => {
                setFormData({ ...formData, instagramUrl: e.target.value });
                if (errors.imageUrl) setErrors({ ...errors, imageUrl: undefined });
              }}
              placeholder="https://instagram.com/p/..."
              className="w-full rounded-lg border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {errors.imageUrl && (
            <p className="text-xs text-red-500">{errors.imageUrl}</p>
          )}
        </div>

        {/* その他・補足事項 */}
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-ink mb-2">
            その他・補足事項（任意）
          </label>
          <textarea
            id="notes"
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="例：〇〇という工夫をしました"
            rows={4}
            className="w-full rounded-lg border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <p className="mt-1 text-[11px] text-ink-muted">
            Instagramで投稿済みの作品の掲載を希望される場合は、投稿URLをご記入ください。<br />
            作品について伝えたいことがあれば、あわせてご記入ください。
          </p>
        </div>

        {/* チェックボックス */}
        <div className="space-y-4 rounded-lg border border-black/5 p-4 bg-white">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => {
                setFormData({ ...formData, consent: e.target.checked });
                if (errors.consent) setErrors({ ...errors, consent: undefined });
              }}
              className="mt-1"
            />
            <span className="text-xs text-ink leading-relaxed">
              送信した作品画像・動画またはInstagram投稿URLの内容を、3DひろばWebサイトおよび関連する公式SNS・イベント・店頭展示等で紹介することに同意します。
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          {errors.consent && (
            <p className="text-xs text-red-500">{errors.consent}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.parentalConsent}
              onChange={(e) => {
                setFormData({ ...formData, parentalConsent: e.target.checked });
                if (errors.parentalConsent)
                  setErrors({ ...errors, parentalConsent: undefined });
              }}
              className="mt-1"
            />
            <span className="text-xs text-ink leading-relaxed">
              お子さまの作品を送信する場合、保護者として掲載に同意します。
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          {errors.parentalConsent && (
            <p className="text-xs text-red-500">{errors.parentalConsent}</p>
          )}
        </div>

        {/* Messages */}
        {submitMessage && (
          <div
            className={`rounded-lg p-4 text-sm ${
              submitMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-brand text-white font-semibold px-8 py-3 text-base hover:bg-brand-dark disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "送信中..." : "できた！をみせる"}
          </button>
        </div>
      </form>
    </section>
  );
}
