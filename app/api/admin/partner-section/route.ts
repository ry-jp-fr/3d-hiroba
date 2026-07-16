import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  readCuration,
  updateCuration,
  DEFAULT_PARTNER_SECTION,
  type PartnerSectionConfig,
} from "@/lib/curation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const curation = await readCuration();
    const partnerSection = curation.partnerSection || DEFAULT_PARTNER_SECTION;
    return NextResponse.json(partnerSection);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[partner-section] GET failed:", message);
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
    const body = (await req.json()) as PartnerSectionConfig;

    const heading = (body.heading ?? "").trim();
    const partnerBody = (body.body ?? "").trim();
    if (!heading) {
      return NextResponse.json(
        { error: "heading_required" },
        { status: 400 },
      );
    }
    if (!partnerBody) {
      return NextResponse.json({ error: "body_required" }, { status: 400 });
    }

    const linkText = (body.linkText ?? "").trim();
    const linkUrl = (body.linkUrl ?? "").trim();

    const normalized: PartnerSectionConfig = {
      heading: heading.slice(0, 120),
      body: partnerBody.slice(0, 2000),
      linkText: linkText ? linkText.slice(0, 60) : undefined,
      linkUrl: linkUrl ? linkUrl.slice(0, 500) : undefined,
    };

    const updated = await updateCuration((current) => ({
      ...current,
      partnerSection: normalized,
    }));

    // partnerSection is also rendered in the site-wide footer (root layout),
    // so revalidate the whole layout tree, not just /about.
    revalidatePath("/", "layout");
    return NextResponse.json(updated.partnerSection);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[partner-section] PUT failed:", message);
    return NextResponse.json(
      { error: "update_failed", message },
      { status: 500 },
    );
  }
}
