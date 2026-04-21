import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createId,
  normalizeHashtag,
  readCuration,
  updateCuration,
} from "@/lib/curation";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const data = await readCuration();
  return NextResponse.json({ hashtags: data.hashtags });
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = await req.json().catch(() => null);
  const tag = normalizeHashtag(String(body?.tag ?? ""));
  if (!tag) {
    return NextResponse.json({ error: "tag_required" }, { status: 400 });
  }
  const updated = await updateCuration((data) => {
    if (data.hashtags.some((h) => h.tag.toLowerCase() === tag.toLowerCase())) {
      return data;
    }
    return {
      ...data,
      hashtags: [
        ...data.hashtags,
        {
          id: createId("tag"),
          tag,
          enabled: true,
          addedAt: new Date().toISOString(),
        },
      ],
    };
  });
  revalidatePath("/");
  return NextResponse.json({ hashtags: updated.hashtags });
}

export async function PATCH(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  const enabled = Boolean(body?.enabled);
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  const updated = await updateCuration((data) => ({
    ...data,
    hashtags: data.hashtags.map((h) =>
      h.id === id ? { ...h, enabled } : h,
    ),
  }));
  revalidatePath("/");
  return NextResponse.json({ hashtags: updated.hashtags });
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
    hashtags: data.hashtags.filter((h) => h.id !== id),
  }));
  revalidatePath("/");
  return NextResponse.json({ hashtags: updated.hashtags });
}
