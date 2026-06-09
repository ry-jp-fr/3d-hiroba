import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import {
  canonicalInstagramPermalink,
  createId,
  readCuration,
  updateCuration,
  type PickEntry,
  type PickMediaType,
  type SubmissionEntry,
} from "@/lib/curation";
import { getSubmissionMediaUrls } from "@/lib/submission-media";
import { resolveMediaType } from "@/lib/media-type-server";
import { collectUsedUrls } from "@/lib/blob-usage";
import { requireAdmin } from "@/lib/admin-auth";
import { fetchInstagramEmbedHtml } from "@/lib/og-image";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

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
  const permanent = searchParams.get("permanent") === "true";
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }

  if (!permanent) {
    // Soft delete: move to trash so it can be restored (metadata + notes kept).
    const updated = await updateCuration((data) => ({
      ...data,
      submissions: data.submissions.map((s) =>
        s.id === id && !s.deletedAt
          ? { ...s, deletedAt: new Date().toISOString() }
          : s,
      ),
    }));
    return NextResponse.json({ submissions: updated.submissions });
  }

  // Permanent delete: remove the submission and clean up blob files that are
  // not referenced anywhere else.
  let urlsToDelete: string[] = [];
  const updated = await updateCuration((data) => {
    const target = data.submissions.find((s) => s.id === id);
    const nextSubmissions = data.submissions.filter((s) => s.id !== id);
    if (target) {
      const nextData = { ...data, submissions: nextSubmissions };
      const stillUsed = collectUsedUrls(nextData);
      urlsToDelete = getSubmissionMediaUrls(target).filter(
        (u) => isBlobUrl(u) && !stillUsed.has(u),
      );
    }
    return { ...data, submissions: nextSubmissions };
  });

  await Promise.all(
    urlsToDelete.map((u) =>
      del(u).catch((err) =>
        console.warn("[admin/submissions] blob delete failed:", err),
      ),
    ),
  );

  return NextResponse.json({ submissions: updated.submissions });
}

async function buildPickForMedia(
  sub: SubmissionEntry,
  mediaUrl: string | undefined,
  mediaType: PickMediaType,
  thumbnailUrl?: string,
): Promise<PickEntry> {
  const useUpload = Boolean(mediaUrl);
  let permalink = sub.instagramUrl;
  let embedHtml: string | undefined;

  // Instagram-url picks (no media uploaded) need the official embed HTML
  // to render in the gallery; manual-upload picks display the local image
  // so we don't call oEmbed for them.
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
        // Meta App Review may not be approved yet, or the post may belong
        // to a user the app cannot read. Pick still gets created so the
        // admin can paste the share-dialog embed code via
        // /admin/instagram-urls.
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
    mediaType: useUpload ? mediaType : "image",
    mediaUrl,
    thumbnailUrl:
      mediaType === "video" && thumbnailUrl
        ? thumbnailUrl.slice(0, 500)
        : undefined,
    caption: sub.notes,
    tags: [],
    permalink,
    pentaComment: undefined,
    embedHtml,
    addedAt: new Date().toISOString(),
  };
}

async function handleCreate(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  const mediaUrls: string[] = Array.isArray(body.mediaUrls)
    ? body.mediaUrls
        .map((u: unknown) => (typeof u === "string" ? u.trim() : ""))
        .filter((u: string) => u.length > 0)
    : [];
  const instagramUrl =
    typeof body.instagramUrl === "string" && body.instagramUrl.trim()
      ? body.instagramUrl.trim()
      : undefined;
  if (mediaUrls.length === 0 && !instagramUrl) {
    return NextResponse.json({ error: "media_required" }, { status: 400 });
  }

  const entry: SubmissionEntry = {
    id: createId("sub"),
    title,
    name,
    email,
    imageUrl: mediaUrls[0],
    mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    instagramUrl,
    notes:
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : undefined,
    consent: body.consent !== false,
    parentalConsent: body.parentalConsent !== false,
    submittedAt: new Date().toISOString(),
  };

  const updated = await updateCuration((data) => ({
    ...data,
    submissions: [entry, ...data.submissions],
  }));
  return NextResponse.json({ submissions: updated.submissions });
}

async function handleRestore(id: string) {
  let missing = false;
  const updated = await updateCuration((data) => {
    const target = data.submissions.find((s) => s.id === id);
    if (!target) {
      missing = true;
      return data;
    }
    return {
      ...data,
      submissions: data.submissions.map((s) =>
        s.id === id ? { ...s, deletedAt: undefined } : s,
      ),
    };
  });
  if (missing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ submissions: updated.submissions });
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const action = String(body?.action ?? "");

  if (action === "create") {
    return handleCreate(body ?? {});
  }

  const id = String(body?.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }

  if (action === "restore") {
    return handleRestore(id);
  }

  if (action !== "approve") {
    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }

  const selectedMediaUrls: string[] | null = Array.isArray(body?.mediaUrls)
    ? (body!.mediaUrls as unknown[])
        .map((u) => (typeof u === "string" ? u.trim() : ""))
        .filter((u) => u.length > 0)
    : null;

  const thumbnailMap: Record<string, string> = {};
  if (body?.thumbnails && typeof body.thumbnails === "object") {
    for (const [k, v] of Object.entries(body.thumbnails as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim()) {
        thumbnailMap[k] = v.trim();
      }
    }
  }

  try {
    // Validate and figure out which media to publish, then resolve each
    // media's true type (image/video) via the Blob Content-Type before the
    // write transaction.
    const current = await readCuration();
    const target = current.submissions.find((s) => s.id === id);
    if (!target) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (target.approvedPickId) {
      return NextResponse.json({ error: "already_approved" }, { status: 409 });
    }
    const submissionMedia = getSubmissionMediaUrls(target);
    const allowed = new Set(submissionMedia);
    const chosen =
      selectedMediaUrls !== null
        ? selectedMediaUrls.filter((u) => allowed.has(u))
        : submissionMedia;
    if (selectedMediaUrls !== null && chosen.length === 0 && submissionMedia.length > 0) {
      return NextResponse.json(
        { error: "no_media_selected", message: "掲載するメディアを1つ以上選んでください" },
        { status: 400 },
      );
    }

    const typeByUrl = new Map<string, PickMediaType>();
    await Promise.all(
      chosen.map(async (url) => {
        typeByUrl.set(url, await resolveMediaType(url));
      }),
    );

    // Build picks (including any oEmbed Read calls) before the transaction
    // so the updateCuration callback stays read-modify-write only.
    const picks: PickEntry[] =
      chosen.length > 0
        ? await Promise.all(
            chosen.map((url) =>
              buildPickForMedia(
                target,
                url,
                typeByUrl.get(url) ?? "image",
                thumbnailMap[url],
              ),
            ),
          )
        : [await buildPickForMedia(target, undefined, "image")];

    let conflict = false;
    let missing = false;
    const updated = await updateCuration((data) => {
      const t = data.submissions.find((s) => s.id === id);
      if (!t) {
        missing = true;
        return data;
      }
      if (t.approvedPickId) {
        conflict = true;
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
