import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createId,
  readCuration,
  updateCuration,
  type CampaignPage,
} from "@/lib/curation";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9-]+$/;

function parseSlug(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const data = await readCuration();
  return NextResponse.json({ campaigns: data.campaigns ?? [] });
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const slug = parseSlug(body.slug);
  const bodyText = typeof body.body === "string" ? body.body.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  const current = await readCuration();
  if ((current.campaigns ?? []).some((c) => c.slug === slug)) {
    return NextResponse.json({ error: "slug_taken" }, { status: 409 });
  }

  const campaign: CampaignPage = {
    id: createId("campaign"),
    slug,
    title: title.slice(0, 120),
    imageUrl:
      typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim().slice(0, 500)
        : undefined,
    body: bodyText.slice(0, 5000),
    startDate:
      typeof body.startDate === "string" && body.startDate.trim()
        ? body.startDate.trim()
        : undefined,
    endDate:
      typeof body.endDate === "string" && body.endDate.trim()
        ? body.endDate.trim()
        : undefined,
    ctaLabel:
      typeof body.ctaLabel === "string" && body.ctaLabel.trim()
        ? body.ctaLabel.trim().slice(0, 40)
        : undefined,
    ctaUrl:
      typeof body.ctaUrl === "string" && body.ctaUrl.trim()
        ? body.ctaUrl.trim().slice(0, 500)
        : undefined,
    published: Boolean(body.published),
    createdAt: new Date().toISOString(),
  };

  const updated = await updateCuration((data) => ({
    ...data,
    campaigns: [campaign, ...(data.campaigns ?? [])],
  }));
  revalidatePath(`/campaign/${slug}`);
  return NextResponse.json({ campaigns: updated.campaigns });
}

export async function PATCH(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  const updates = (body?.updates ?? {}) as Record<string, unknown>;

  let missing = false;
  let slugConflict = false;
  const revalidatePaths = new Set<string>();

  const updated = await updateCuration((data) => {
    const list = data.campaigns ?? [];
    const target = list.find((c) => c.id === id);
    if (!target) {
      missing = true;
      return data;
    }

    const next: CampaignPage = { ...target };

    if (updates.slug !== undefined) {
      const slug = parseSlug(updates.slug);
      if (!slug || !SLUG_RE.test(slug)) {
        slugConflict = true;
        return data;
      }
      if (slug !== target.slug && list.some((c) => c.slug === slug)) {
        slugConflict = true;
        return data;
      }
      revalidatePaths.add(`/campaign/${target.slug}`);
      next.slug = slug;
    }
    if (updates.title !== undefined)
      next.title = String(updates.title).trim().slice(0, 120);
    if (updates.imageUrl !== undefined) {
      const v = String(updates.imageUrl).trim();
      next.imageUrl = v ? v.slice(0, 500) : undefined;
    }
    if (updates.body !== undefined)
      next.body = String(updates.body).trim().slice(0, 5000);
    if (updates.startDate !== undefined) {
      const v = String(updates.startDate).trim();
      next.startDate = v || undefined;
    }
    if (updates.endDate !== undefined) {
      const v = String(updates.endDate).trim();
      next.endDate = v || undefined;
    }
    if (updates.ctaLabel !== undefined) {
      const v = String(updates.ctaLabel).trim();
      next.ctaLabel = v ? v.slice(0, 40) : undefined;
    }
    if (updates.ctaUrl !== undefined) {
      const v = String(updates.ctaUrl).trim();
      next.ctaUrl = v ? v.slice(0, 500) : undefined;
    }
    if (updates.published !== undefined)
      next.published = Boolean(updates.published);

    revalidatePaths.add(`/campaign/${next.slug}`);

    return {
      ...data,
      campaigns: list.map((c) => (c.id === id ? next : c)),
    };
  });

  if (missing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (slugConflict) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 409 });
  }
  for (const p of revalidatePaths) revalidatePath(p);
  return NextResponse.json({ campaigns: updated.campaigns });
}

export async function DELETE(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }

  const current = await readCuration();
  const target = (current.campaigns ?? []).find((c) => c.id === id);

  const updated = await updateCuration((data) => ({
    ...data,
    campaigns: (data.campaigns ?? []).filter((c) => c.id !== id),
  }));

  if (target) revalidatePath(`/campaign/${target.slug}`);
  return NextResponse.json({ campaigns: updated.campaigns });
}
