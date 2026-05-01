import { NextResponse } from "next/server";

type SubmissionData = {
  title: string;
  name: string;
  email: string;
  imageUrl?: string;
  instagramUrl?: string;
  notes?: string;
  consent: boolean;
  parentalConsent: boolean;
};

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

    // At least one of image or instagram URL must be provided
    if (!body.imageUrl?.trim() && !body.instagramUrl?.trim()) {
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

    // TODO: Save submission to database or external service
    // For now, we just log it
    console.log("[submission] New submission received:", {
      title: body.title,
      name: body.name,
      email: body.email,
      hasImage: !!body.imageUrl,
      hasInstagramUrl: !!body.instagramUrl,
      timestamp: new Date().toISOString(),
    });

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
