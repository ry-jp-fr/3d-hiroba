import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import {
  createId,
  readCuration,
  updateCuration,
  type SheetDifficulty,
  type SheetEntry,
  type SheetProvider,
} from "@/lib/curation";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const DIFFICULTIES: SheetDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

const PROVIDERS: SheetProvider[] = ["scrib3d", "general"];

function parseDifficulty(value: unknown): SheetDifficulty | null {
  return DIFFICULTIES.includes(value as SheetDifficulty)
    ? (value as SheetDifficulty)
    : null;
}

function parseProvider(value: unknown): SheetProvider | null {
  return PROVIDERS.includes(value as SheetProvider)
    ? (value as SheetProvider)
    : null;
}

function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

async function safeDelBlob(url: string | undefined): Promise<void> {
  if (!url || !isBlobUrl(url)) return;
  try {
    await del(url);
  } catch (err) {
    console.warn("[sheets] blob delete failed:", err);
  }
}

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const data = await readCuration();
  return NextResponse.json({ sheets: data.sheets });
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const pdfUrl = String(body?.pdfUrl ?? "").trim();
  const difficulty = parseDifficulty(body?.difficulty);
  if (!title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  if (!pdfUrl) {
    return NextResponse.json({ error: "pdf_required" }, { status: 400 });
  }
  if (!difficulty) {
    return NextResponse.json({ error: "difficulty_invalid" }, { status: 400 });
  }
  const provider = parseProvider(body?.provider) ?? "scrib3d";
  const description =
    typeof body?.description === "string" && body.description.trim()
      ? body.description.trim()
      : undefined;
  const thumbnailUrl =
    typeof body?.thumbnailUrl === "string" && body.thumbnailUrl.trim()
      ? body.thumbnailUrl.trim()
      : undefined;

  const newSheet: SheetEntry = {
    id: createId("sheet"),
    title,
    description,
    difficulty,
    provider,
    pdfUrl,
    thumbnailUrl,
    addedAt: new Date().toISOString(),
  };

  const updated = await updateCuration((data) => ({
    ...data,
    sheets: [newSheet, ...data.sheets],
  }));
  revalidatePath("/sheets");
  return NextResponse.json({ sheets: updated.sheets });
}

export async function PATCH(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }

  const oldUrlsToDelete: string[] = [];

  const updated = await updateCuration((data) => {
    const existing = data.sheets.find((s) => s.id === id);
    if (!existing) return data;

    const next: SheetEntry = { ...existing };
    if (typeof body.title === "string") {
      const t = body.title.trim();
      if (t) next.title = t;
    }
    if (typeof body.description === "string") {
      next.description = body.description.trim() || undefined;
    }
    const diff = parseDifficulty(body.difficulty);
    if (diff) next.difficulty = diff;
    const prov = parseProvider(body.provider);
    if (prov) next.provider = prov;
    if (typeof body.pdfUrl === "string" && body.pdfUrl.trim()) {
      if (body.pdfUrl !== existing.pdfUrl) {
        oldUrlsToDelete.push(existing.pdfUrl);
      }
      next.pdfUrl = body.pdfUrl.trim();
    }
    if (typeof body.thumbnailUrl === "string") {
      const newThumb = body.thumbnailUrl.trim() || undefined;
      if (newThumb !== existing.thumbnailUrl && existing.thumbnailUrl) {
        oldUrlsToDelete.push(existing.thumbnailUrl);
      }
      next.thumbnailUrl = newThumb;
    }

    return {
      ...data,
      sheets: data.sheets.map((s) => (s.id === id ? next : s)),
    };
  });

  await Promise.all(oldUrlsToDelete.map(safeDelBlob));
  revalidatePath("/sheets");
  return NextResponse.json({ sheets: updated.sheets });
}

export async function DELETE(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }

  const data = await readCuration();
  const target = data.sheets.find((s) => s.id === id);

  const updated = await updateCuration((d) => ({
    ...d,
    sheets: d.sheets.filter((s) => s.id !== id),
  }));

  if (target) {
    await Promise.all([
      safeDelBlob(target.pdfUrl),
      safeDelBlob(target.thumbnailUrl),
    ]);
  }

  revalidatePath("/sheets");
  return NextResponse.json({ sheets: updated.sheets });
}
