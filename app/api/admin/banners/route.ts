import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createId,
  readCuration,
  updateCuration,
  type BannerEntry,
} from "@/lib/curation";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const MAX_BANNERS = 6;

function normalizeBanner(input: unknown): BannerEntry | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const imageUrl =
    typeof obj.imageUrl === "string" ? obj.imageUrl.trim().slice(0, 500) : "";
  if (!imageUrl) return null;
  const linkUrl =
    typeof obj.linkUrl === "string"
      ? obj.linkUrl.trim().slice(0, 500) || undefined
      : undefined;
  const alt =
    typeof obj.alt === "string"
      ? obj.alt.trim().slice(0, 200) || undefined
      : undefined;
  const id =
    typeof obj.id === "string" && obj.id.trim()
      ? obj.id.trim()
      : createId("banner");
  return { id, imageUrl, linkUrl, alt };
}

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const data = await readCuration();
  return NextResponse.json({ banners: data.banners ?? [] });
}

export async function PUT(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || !Array.isArray(body.banners)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (body.banners.length > MAX_BANNERS) {
    return NextResponse.json(
      { error: "too_many_banners", max: MAX_BANNERS },
      { status: 400 },
    );
  }

  const banners = (body.banners as unknown[])
    .map(normalizeBanner)
    .filter((b): b is BannerEntry => b !== null);

  await updateCuration((data) => ({ ...data, banners }));
  revalidatePath("/");
  return NextResponse.json({ banners });
}
