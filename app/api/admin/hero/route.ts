import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_HERO,
  readCuration,
  updateCuration,
  type HeroConfig,
  type HeroPhoto,
} from "@/lib/curation";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function normalizePhoto(
  input: unknown,
  fallback: HeroPhoto,
): HeroPhoto {
  if (!input || typeof input !== "object") return fallback;
  const obj = input as Record<string, unknown>;
  const imageUrl =
    typeof obj.imageUrl === "string" && obj.imageUrl.trim().length > 0
      ? obj.imageUrl.trim()
      : fallback.imageUrl;
  return {
    imageUrl,
    author:
      typeof obj.author === "string" ? obj.author.trim() || undefined : fallback.author,
    alt:
      typeof obj.alt === "string" ? obj.alt.trim() || undefined : fallback.alt,
  };
}

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const data = await readCuration();
  return NextResponse.json({ hero: data.hero ?? DEFAULT_HERO });
}

export async function PUT(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const current = (await readCuration()).hero ?? DEFAULT_HERO;
  const next: HeroConfig = {
    eyebrow:
      typeof body.eyebrow === "string" ? body.eyebrow : current.eyebrow,
    titleAccent:
      typeof body.titleAccent === "string"
        ? body.titleAccent
        : current.titleAccent,
    titleRest:
      typeof body.titleRest === "string" ? body.titleRest : current.titleRest,
    description:
      typeof body.description === "string"
        ? body.description
        : current.description,
    photo1: normalizePhoto(body.photo1, current.photo1),
    photo2: normalizePhoto(body.photo2, current.photo2),
  };

  await updateCuration((data) => ({ ...data, hero: next }));
  revalidatePath("/");
  return NextResponse.json({ hero: next });
}
