import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  canonicalInstagramPermalink,
  createId,
  readCuration,
  updateCuration,
  type PickEntry,
  type PickMediaType,
  type SubmissionEntry,
} from "@/lib/curation";
import { requireAdmin } from "@/lib/admin-auth";
import { fetchInstagramEmbedHtml } from "@/lib/og-image";

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

async function buildPickFromSubmission(
  sub: SubmissionEntry,
): Promise<PickEntry> {
  const useUpload = Boolean(sub.imageUrl);
  let embedHtml: string | undefined;
  let permalink = sub.instagramUrl;

  if (!useUpload && sub.instagramUrl) {
    const canonical = canonicalInstagramPermalink(sub.instagramUrl);
    if (canonical) {
      permalink = canonical;
      const html = await fetchInstagramEmbedHtml(canonical);
      if (html) {
        embedHtml = html;
        console.log(
          `[admin/submissions] embed_html_fetched submission=${sub.id}`,
        );
      } else {
        // Meta App Review may not be approved yet, or the post may belong to
        // a user the app cannot read. The pick still gets created so the
        // admin can paste the embed code manually via /admin/instagram-urls.
        console.warn(
          `[admin/submissions] embed_html_unavailable submission=${sub.id} url=${sub.instagramUrl}`,
        );
      }
    }
  }

  return {
    id: createId(useUpload ? "manual" : "url"),
    method: useUpload ? "manual-upload" : "instagram-url",
    title: sub.title,
    author: sub.name,
    mediaType: useUpload ? inferMediaType(sub.imageUrl) : "image",
    mediaUrl: sub.imageUrl,
    caption: sub.notes,
    tags: [],
    permalink,
    pentaComment: undefined,
    embedHtml,
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
    const updated = await updateCuration(async (data) => {
      const target = data.submissions.find((s) => s.id === id);
      if (!target) {
        missing = true;
        return data;
      }
      if (target.approvedPickId) {
        conflict = true;
        return data;
      }
      const pick = await buildPickFromSubmission(target);
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
