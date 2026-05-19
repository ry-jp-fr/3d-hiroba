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
import { getSubmissionMediaUrls } from "@/lib/submission-media";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const data = await readCuration();
  return NextResponse.json({ submissions: data.submissions });
}

export async function PATCH(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  const titleRaw = body?.title;
  const nameRaw = body?.name;
  const newTitle =
    typeof titleRaw === "string" ? titleRaw.trim() : undefined;
  const newName = typeof nameRaw === "string" ? nameRaw.trim() : undefined;
  if (newTitle === undefined && newName === undefined) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }
  if (newTitle !== undefined && !newTitle) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  if (newName !== undefined && !newName) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  let missing = false;
  const updated = await updateCuration((data) => {
    const target = data.submissions.find((s) => s.id === id);
    if (!target) {
      missing = true;
      return data;
    }
    const nextTitle = newTitle ?? target.title;
    const nextName = newName ?? target.name;
    const nextSubmissions = data.submissions.map((s) =>
      s.id === id ? { ...s, title: nextTitle, name: nextName } : s,
    );
    const nextPicks = target.approvedPickId
      ? data.picks.map((p) =>
          p.id === target.approvedPickId
            ? { ...p, title: nextTitle, author: nextName }
            : p,
        )
      : data.picks;
    return {
      ...data,
      submissions: nextSubmissions,
      picks: nextPicks,
    };
  });

  if (missing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  revalidatePath("/");
  return NextResponse.json({ submissions: updated.submissions });
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

function buildPickForMedia(
  sub: SubmissionEntry,
  mediaUrl: string | undefined,
): PickEntry {
  const useUpload = Boolean(mediaUrl);
  return {
    id: createId(useUpload ? "manual" : "url"),
    method: useUpload ? "manual-upload" : "instagram-url",
    title: sub.title,
    author: sub.name,
    mediaType: useUpload ? inferMediaType(mediaUrl) : "image",
    mediaUrl,
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
  const selectedMediaUrls: string[] | null = Array.isArray(body?.mediaUrls)
    ? body.mediaUrls
        .map((u: unknown) => (typeof u === "string" ? u.trim() : ""))
        .filter((u: string) => u.length > 0)
    : null;

  try {
    let conflict = false;
    let missing = false;
    let noMediaSelected = false;
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
      const submissionMedia = getSubmissionMediaUrls(target);
      const allowed = new Set(submissionMedia);
      const chosen =
        selectedMediaUrls !== null
          ? selectedMediaUrls.filter((u) => allowed.has(u))
          : submissionMedia;

      const picks: PickEntry[] =
        chosen.length > 0
          ? chosen.map((url) => buildPickForMedia(target, url))
          : [buildPickForMedia(target, undefined)];

      if (selectedMediaUrls !== null && chosen.length === 0 && submissionMedia.length > 0) {
        noMediaSelected = true;
        return data;
      }

      return {
        ...data,
        picks: [...picks, ...data.picks],
        submissions: data.submissions.map((s) =>
          s.id === id
            ? {
                ...s,
                approvedPickId: picks[0].id,
                approvedPickIds: picks.map((p) => p.id),
              }
            : s,
        ),
      };
    });

    if (missing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (conflict) {
      return NextResponse.json({ error: "already_approved" }, { status: 409 });
    }
    if (noMediaSelected) {
      return NextResponse.json(
        { error: "no_media_selected", message: "掲載するメディアを1つ以上選んでください" },
        { status: 400 },
      );
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
