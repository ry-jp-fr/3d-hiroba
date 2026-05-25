import { NextResponse } from "next/server";
import {
  canonicalInstagramPermalink,
  extractInstagramShortcode,
  readCuration,
  updateCuration,
  type PickEntry,
} from "@/lib/curation";
import {
  downloadAndStoreImage,
  fetchOgImageFromPublicPage,
} from "@/lib/og-image";
import { safeDelBlob } from "@/lib/blob-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const REQUEST_CONCURRENCY = 5;

type Outcome =
  | { id: string; status: "refreshed"; mediaUrl: string }
  | { id: string; status: "skipped"; reason: string }
  | { id: string; status: "failed"; reason: string };

function needsRefresh(pick: PickEntry, now: number): boolean {
  if (pick.method !== "instagram-url") return false;
  if (!pick.permalink) return false;
  const last = pick.ogImageRefreshedAt
    ? Date.parse(pick.ogImageRefreshedAt)
    : 0;
  return !last || now - last >= REFRESH_INTERVAL_MS;
}

async function refreshOne(pick: PickEntry): Promise<Outcome> {
  const shortcode = extractInstagramShortcode(pick.permalink ?? "");
  const canonical = canonicalInstagramPermalink(pick.permalink ?? "");
  if (!shortcode || !canonical) {
    return { id: pick.id, status: "skipped", reason: "no_shortcode" };
  }

  const ogUrl = await fetchOgImageFromPublicPage(canonical);
  if (!ogUrl) {
    return { id: pick.id, status: "failed", reason: "og_not_found" };
  }

  let newMediaUrl: string;
  try {
    newMediaUrl = await downloadAndStoreImage(ogUrl, shortcode);
  } catch (err) {
    return {
      id: pick.id,
      status: "failed",
      reason: err instanceof Error ? err.message : "download_failed",
    };
  }

  const oldMediaUrl = pick.mediaUrl;
  const refreshedAt = new Date().toISOString();

  // Re-check inside the transaction in case admin deleted the pick mid-flight.
  let applied = false;
  await updateCuration((data) => {
    const idx = data.picks.findIndex((p) => p.id === pick.id);
    if (idx < 0) return data;
    applied = true;
    const next = [...data.picks];
    next[idx] = {
      ...next[idx],
      mediaUrl: newMediaUrl,
      ogImageRefreshedAt: refreshedAt,
    };
    return { ...data, picks: next };
  });

  if (!applied) {
    // Pick was deleted while we were downloading; clean up the orphan Blob.
    await safeDelBlob(newMediaUrl);
    return { id: pick.id, status: "skipped", reason: "pick_removed" };
  }

  // The Blob is overwritten in place (same pathname), so we don't need to
  // delete the old URL — but if Vercel rotated the suffix we'd leak. Compare
  // and clean up the legacy URL if it differs.
  if (oldMediaUrl && oldMediaUrl !== newMediaUrl) {
    await safeDelBlob(oldMediaUrl);
  }

  return { id: pick.id, status: "refreshed", mediaUrl: newMediaUrl };
}

async function runInBatches<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const slice = items.slice(i, i + size);
    const settled = await Promise.allSettled(slice.map(fn));
    for (const s of settled) {
      if (s.status === "fulfilled") results.push(s.value);
    }
  }
  return results;
}

export async function GET(req: Request) {
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("unauthorized", { status: 401 });
  }

  const data = await readCuration();
  const now = Date.now();
  const targets = data.picks.filter((p) => needsRefresh(p, now));

  if (targets.length === 0) {
    return NextResponse.json({ scanned: data.picks.length, refreshed: 0 });
  }

  const outcomes = await runInBatches(targets, REQUEST_CONCURRENCY, refreshOne);

  const summary = {
    scanned: data.picks.length,
    candidates: targets.length,
    refreshed: outcomes.filter((o) => o.status === "refreshed").length,
    failed: outcomes.filter((o) => o.status === "failed").length,
    skipped: outcomes.filter((o) => o.status === "skipped").length,
    outcomes,
  };
  console.log("[cron/refresh-thumbnails]", JSON.stringify(summary));
  return NextResponse.json(summary);
}
