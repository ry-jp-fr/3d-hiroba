import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createId,
  extractInstagramShortcode,
  normalizeHashtag,
  readCuration,
  updateCuration,
  type PickEntry,
  type PickMediaType,
  type PickMethod,
} from "@/lib/curation";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((t) => normalizeHashtag(String(t)))
      .filter((t) => t.length > 0);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,、\s]+/)
      .map((t) => normalizeHashtag(t))
      .filter((t) => t.length > 0);
  }
  return [];
}

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const data = await readCuration();
  return NextResponse.json({ picks: data.picks });
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const method = String(body.method ?? "") as PickMethod;
  if (method !== "instagram-url" && method !== "manual-upload") {
    return NextResponse.json({ error: "invalid_method" }, { status: 400 });
  }

  const mediaType = (String(body.mediaType ?? "image") as PickMediaType) ===
    "video"
    ? "video"
    : "image";
  const mediaUrl = String(body.mediaUrl ?? "").trim();
  if (!mediaUrl) {
    return NextResponse.json(
      { error: "media_url_required" },
      { status: 400 },
    );
  }

  let permalink = typeof body.permalink === "string" ? body.permalink.trim() : "";
  if (method === "instagram-url") {
    if (!permalink) {
      return NextResponse.json(
        { error: "permalink_required" },
        { status: 400 },
      );
    }
    if (!extractInstagramShortcode(permalink)) {
      return NextResponse.json(
        { error: "invalid_instagram_url" },
        { status: 400 },
      );
    }
  }

  const pick: PickEntry = {
    id: createId("pick"),
    method,
    title: body.title ? String(body.title).slice(0, 120) : undefined,
    author: body.author ? String(body.author).slice(0, 80) : undefined,
    authorUrl: body.authorUrl ? String(body.authorUrl).slice(0, 300) : undefined,
    mediaType,
    mediaUrl,
    thumbnailUrl: body.thumbnailUrl
      ? String(body.thumbnailUrl).slice(0, 500)
      : undefined,
    caption: body.caption ? String(body.caption).slice(0, 2000) : undefined,
    tags: parseTags(body.tags),
    permalink: permalink || undefined,
    postedAt: body.postedAt ? String(body.postedAt) : undefined,
    pentaComment: body.pentaComment
      ? String(body.pentaComment).slice(0, 400)
      : undefined,
    addedAt: new Date().toISOString(),
  };

  const updated = await updateCuration((data) => ({
    ...data,
    picks: [pick, ...data.picks],
  }));
  revalidatePath("/");
  return NextResponse.json({ pick, picks: updated.picks });
}

export async function PATCH(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  const updates = body.updates ?? {};
  const updated = await updateCuration((data) => ({
    ...data,
    picks: data.picks.map((p) => {
      if (p.id !== id) return p;
      const next: PickEntry = { ...p };
      if (updates.title !== undefined) next.title = String(updates.title);
      if (updates.author !== undefined) next.author = String(updates.author);
      if (updates.authorUrl !== undefined)
        next.authorUrl = String(updates.authorUrl);
      if (updates.caption !== undefined)
        next.caption = String(updates.caption);
      if (updates.pentaComment !== undefined)
        next.pentaComment = String(updates.pentaComment);
      if (updates.postedAt !== undefined)
        next.postedAt = String(updates.postedAt);
      if (updates.thumbnailUrl !== undefined)
        next.thumbnailUrl = String(updates.thumbnailUrl);
      if (updates.tags !== undefined) next.tags = parseTags(updates.tags);
      return next;
    }),
  }));
  revalidatePath("/");
  return NextResponse.json({ picks: updated.picks });
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
    picks: data.picks.filter((p) => p.id !== id),
  }));
  revalidatePath("/");
  return NextResponse.json({ picks: updated.picks });
}
