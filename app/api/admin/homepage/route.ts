import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { readCuration, updateCuration, DEFAULT_HOMEPAGE, type HomepageConfig } from "@/lib/curation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const curation = await readCuration();
    const homepage = curation.homepage || DEFAULT_HOMEPAGE;
    return NextResponse.json(homepage);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[homepage] GET failed:", message);
    return NextResponse.json(
      { error: "read_failed", message },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as HomepageConfig;

    const normalized: HomepageConfig = {
      galleryTitle: (body.galleryTitle ?? "").trim(),
      gallerySubtitleLabel: (body.gallerySubtitleLabel ?? "").trim(),
      galleryDescription: (body.galleryDescription ?? "").trim(),
    };

    const updated = await updateCuration((current) => ({
      ...current,
      homepage: normalized,
    }));

    revalidatePath("/");
    return NextResponse.json(updated.homepage);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[homepage] PUT failed:", message);
    return NextResponse.json(
      { error: "update_failed", message },
      { status: 500 },
    );
  }
}
