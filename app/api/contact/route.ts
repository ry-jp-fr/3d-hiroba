import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'invalid_body', message: 'リクエスト本体が無効です。' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = body;

    // Basic validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'name_required', message: 'お名前を入力してください。' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'email_required', message: 'メールアドレスを入力してください。' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'invalid_email', message: '有効なメールアドレスを入力してください。' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'message_required', message: 'メッセージを入力してください。' },
        { status: 400 }
      );
    }

    const subjectStr = subject || 'other';

    const contactMessage: ContactMessage = {
      name: name.trim().slice(0, 200),
      email: email.trim().slice(0, 255),
      subject: subjectStr.slice(0, 50),
      message: message.trim().slice(0, 5000),
      timestamp: new Date().toISOString(),
    };

    // Log the contact message (in production, this would be saved to a database or sent via email)
    console.log('[contact] received_message:', {
      name: contactMessage.name,
      email: contactMessage.email,
      subject: contactMessage.subject,
      timestamp: contactMessage.timestamp,
    });

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'メッセージが正常に送信されました。',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[contact] submission_failed:', err);
    return NextResponse.json(
      {
        error: 'submission_failed',
        message: '送信処理に失敗しました。後ほどお試しください。',
      },
      { status: 500 }
    );
  }
}
