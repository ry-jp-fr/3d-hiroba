import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateCuration } from "@/lib/curation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const pickId = typeof body?.pickId === "string" ? body.pickId : "";
  const action = body?.action === "unlike" ? "unlike" : "like";
  if (!pickId) {
    return NextResponse.json({ error: "pick_id_required" }, { status: 400 });
  }

  const delta = action === "like" ? 1 : -1;
  let nextCount = 0;
  let found = false;
  await updateCuration((data) => ({
    ...data,
    picks: data.picks.map((p) => {
      if (p.id !== pickId) return p;
      found = true;
      nextCount = Math.max(0, (p.likeCount ?? 0) + delta);
      return { ...p, likeCount: nextCount };
    }),
  }));

  if (!found) {
    return NextResponse.json({ error: "pick_not_found" }, { status: 404 });
  }

  revalidatePath("/");
  return NextResponse.json({ likeCount: nextCount });
}
