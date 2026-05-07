import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "invalid_body" },
        { status: 400 }
      );
    }

    console.log("[instagram/deauthorize] received request:", {
      userId: body.user_id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("[instagram/deauthorize] error:", err);
    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}
