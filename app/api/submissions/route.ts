import { NextResponse } from "next/server";
import { createId, updateCuration } from "@/lib/curation";

type SubmissionData = {
  title: string;
  name: string;
  email: string;
  imageUrl?: string;
  mediaUrls?: string[];
  instagramUrl?: string;
  notes?: string;
  consent: boolean;
  parentalConsent: boolean;
};

const MAX_MEDIA = 10;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubmissionData;

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "title_required", message: "作品名を入力してください" },
        { status: 400 }
      );
    }

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "name_required", message: "お名前またはニックネームを入力してください" },
        { status: 400 }
      );
    }

    if (!body.email?.trim()) {
      return NextResponse.json(
        { error: "email_required", message: "メールアドレスを入力してください" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "email_invalid", message: "有効なメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    // Normalize mediaUrls: prefer the array, fall back to legacy imageUrl
    const mediaUrls: string[] = Array.isArray(body.mediaUrls)
      ? body.mediaUrls
          .map((u) => (typeof u === "string" ? u.trim() : ""))
          .filter((u): u is string => u.length > 0)
      : body.imageUrl?.trim()
        ? [body.imageUrl.trim()]
        : [];

    if (mediaUrls.length > MAX_MEDIA) {
      return NextResponse.json(
        {
          error: "too_many_media",
          message: `アップロードできるのは最大 ${MAX_MEDIA} 件までです`,
        },
        { status: 400 }
      );
    }

    // At least one media or instagram URL must be provided
    if (mediaUrls.length === 0 && !body.instagramUrl?.trim()) {
      return NextResponse.json(
        {
          error: "media_required",
          message: "作品画像・動画またはInstagram投稿URLのどちらかを入力してください",
        },
        { status: 400 }
      );
    }

    // Validate consent
    if (!body.consent) {
      return NextResponse.json(
        { error: "consent_required", message: "掲載許諾に同意してください" },
        { status: 400 }
      );
    }

    if (!body.parentalConsent) {
      return NextResponse.json(
        { error: "parental_consent_required", message: "保護者同意に同意してください" },
        { status: 400 }
      );
    }

    const entry = {
      id: createId("sub"),
      title: body.title.trim(),
      name: body.name.trim(),
      email: body.email.trim(),
      imageUrl: mediaUrls[0] || undefined,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      instagramUrl: body.instagramUrl?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
      consent: body.consent,
      parentalConsent: body.parentalConsent,
      submittedAt: new Date().toISOString(),
    };

    await updateCuration((data) => ({
      ...data,
      submissions: [entry, ...data.submissions],
    }));

    return NextResponse.json(
      {
        success: true,
        message: "ご応募ありがとうございます。運営側で確認させていただきます。",
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[submissions] failed:", message);
    return NextResponse.json(
      { error: "submission_failed", message: "送信に失敗しました" },
      { status: 500 }
    );
  }
}
