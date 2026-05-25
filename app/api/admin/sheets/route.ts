import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createId,
  readCuration,
  updateCuration,
  type SheetDifficulty,
  type SheetEntry,
  type SheetProvider,
} from "@/lib/curation";
import { requireAdmin } from "@/lib/admin-auth";
import { safeDelBlob } from "@/lib/blob-utils";

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

type ParsedSheet = Omit<SheetEntry, "id" | "addedAt">;

function parseSheetInput(
  input: unknown,
): { sheet: ParsedSheet } | { error: string } {
  const obj = (input ?? {}) as Record<string, unknown>;
  const title = String(obj.title ?? "").trim();
  const pdfUrl = String(obj.pdfUrl ?? "").trim();
  const difficulty = parseDifficulty(obj.difficulty);
  if (!title) return { error: "title_required" };
  if (!pdfUrl) return { error: "pdf_required" };
  if (!difficulty) return { error: "difficulty_invalid" };
  const provider = parseProvider(obj.provider) ?? "scrib3d";
  const description =
    typeof obj.description === "string" && obj.description.trim()
      ? obj.description.trim()
      : undefined;
  const thumbnailUrl =
    typeof obj.thumbnailUrl === "string" && obj.thumbnailUrl.trim()
      ? obj.thumbnailUrl.trim()
      : undefined;
  return {
    sheet: { title, description, difficulty, provider, pdfUrl, thumbnailUrl },
  };
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

  if (Array.isArray((body as { items?: unknown })?.items)) {
    const items = (body as { items: unknown[] }).items;
    if (items.length === 0) {
      return NextResponse.json({ error: "items_empty" }, { status: 400 });
    }
    const parsed: ParsedSheet[] = [];
    for (let i = 0; i < items.length; i++) {
      const result = parseSheetInput(items[i]);
      if ("error" in result) {
        return NextResponse.json(
          { error: result.error, index: i },
          { status: 400 },
        );
      }
      parsed.push(result.sheet);
    }
    const now = new Date().toISOString();
    const newSheets: SheetEntry[] = parsed.map((p) => ({
      id: createId("sheet"),
      ...p,
      addedAt: now,
    }));
    const updated = await updateCuration((data) => ({
      ...data,
      sheets: [...newSheets, ...data.sheets],
    }));
    revalidatePath("/sheets");
    return NextResponse.json({
      sheets: updated.sheets,
      created: newSheets.length,
    });
  }

  const result = parseSheetInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const newSheet: SheetEntry = {
    id: createId("sheet"),
    ...result.sheet,
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

  if (Array.isArray((body as { order?: unknown })?.order)) {
    const order = (body as { order: string[] }).order;
    const updated = await updateCuration((data) => {
      const idSet = new Set(order);
      const ordered = order
        .map((id) => data.sheets.find((s) => s.id === id))
        .filter((s): s is SheetEntry => s !== undefined);
      const remaining = data.sheets.filter((s) => !idSet.has(s.id));
      return { ...data, sheets: [...ordered, ...remaining] };
    });
    revalidatePath("/sheets");
    return NextResponse.json({ sheets: updated.sheets });
  }

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
