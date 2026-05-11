import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createId,
  readCuration,
  updateCuration,
  type PickEntry,
  type PickMediaType,
  type SubmissionEntry,
} from "@/lib/curation";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const data = await readCuration();
  return NextResponse.json({ submissions: data.submissions });
}

export async function DELETE(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  const updated = await updateCuration((data) => ({
    ...data,
    submissions: data.submissions.filter((s) => s.id !== id),
  }));
  return NextResponse.json({ submissions: updated.submissions });
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;

function inferMediaType(url: string | undefined): PickMediaType {
  if (url && VIDEO_EXT.test(url)) return "video";
  return "image";
}

function buildPickFromSubmission(sub: SubmissionEntry): PickEntry {
  const useUpload = Boolean(sub.imageUrl);
  return {
    id: createId(useUpload ? "manual" : "url"),
    method: useUpload ? "manual-upload" : "instagram-url",
    title: sub.title,
    author: sub.name,
    mediaType: useUpload ? inferMediaType(sub.imageUrl) : "image",
    mediaUrl: sub.imageUrl,
    caption: sub.notes,
    tags: [],
    permalink: sub.instagramUrl,
    pentaComment: undefined,
    addedAt: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? "");
  const id = String(body?.id ?? "");
  if (action !== "approve") {
    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }

  try {
    let conflict = false;
    let missing = false;
    const updated = await updateCuration((data) => {
      const target = data.submissions.find((s) => s.id === id);
      if (!target) {
        missing = true;
        return data;
      }
      if (target.approvedPickId) {
        conflict = true;
        return data;
      }
      const pick = buildPickFromSubmission(target);
      return {
        ...data,
        picks: [pick, ...data.picks],
        submissions: data.submissions.map((s) =>
          s.id === id ? { ...s, approvedPickId: pick.id } : s,
        ),
      };
    });

    if (missing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (conflict) {
      return NextResponse.json({ error: "already_approved" }, { status: 409 });
    }
    revalidatePath("/");
    return NextResponse.json({ submissions: updated.submissions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[admin/submissions] approve failed:", message);
    return NextResponse.json(
      { error: "approve_failed", message },
      { status: 500 },
    );
  }
}
