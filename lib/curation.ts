import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";

export type HashtagEntry = {
  id: string;
  tag: string;
  enabled: boolean;
  addedAt: string;
};

export type PickMethod = "instagram-url" | "manual-upload";
export type PickMediaType = "image" | "video";

export type PickEntry = {
  id: string;
  method: PickMethod;
  title?: string;
  author?: string;
  authorUrl?: string;
  mediaType: PickMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  tags: string[];
  permalink?: string;
  postedAt?: string;
  pentaComment?: string;
  addedAt: string;
};

export type CurationData = {
  hashtags: HashtagEntry[];
  picks: PickEntry[];
};

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "curation.json");
const BLOB_PATHNAME = "curation/curation.json";

const defaultData: CurationData = {
  hashtags: [],
  picks: [],
};

function useBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function ensureFile() {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), "utf8");
  }
}

async function readFromFile(): Promise<CurationData> {
  await ensureFile();
  const raw = await fs.readFile(filePath, "utf8");
  try {
    const parsed = JSON.parse(raw) as Partial<CurationData>;
    return {
      hashtags: parsed.hashtags ?? [],
      picks: parsed.picks ?? [],
    };
  } catch {
    return { ...defaultData };
  }
}

async function writeToFile(data: CurationData): Promise<void> {
  await ensureFile();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function readFromBlob(): Promise<CurationData> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME });
    const found = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!found) {
      // Seed with default in Blob if nothing is there yet
      return await seedBlobFromLocal();
    }
    const res = await fetch(found.url, { cache: "no-store" });
    if (!res.ok) return { ...defaultData };
    const parsed = (await res.json()) as Partial<CurationData>;
    return {
      hashtags: parsed.hashtags ?? [],
      picks: parsed.picks ?? [],
    };
  } catch {
    return { ...defaultData };
  }
}

async function seedBlobFromLocal(): Promise<CurationData> {
  // Try to read the bundled data/curation.json shipped with the deploy and
  // upload it as the initial Blob content.
  let initial: CurationData = { ...defaultData };
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<CurationData>;
    initial = {
      hashtags: parsed.hashtags ?? [],
      picks: parsed.picks ?? [],
    };
  } catch {
    // fall through to default
  }
  await writeToBlob(initial);
  return initial;
}

async function writeToBlob(data: CurationData): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

export async function readCuration(): Promise<CurationData> {
  if (useBlob()) return readFromBlob();
  return readFromFile();
}

export async function writeCuration(data: CurationData): Promise<void> {
  if (useBlob()) return writeToBlob(data);
  return writeToFile(data);
}

export async function updateCuration(
  updater: (data: CurationData) => CurationData | Promise<CurationData>,
): Promise<CurationData> {
  const current = await readCuration();
  const next = await updater(current);
  await writeCuration(next);
  return next;
}

export function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export function extractInstagramShortcode(url: string): string | null {
  const match = url.match(
    /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/,
  );
  return match?.[1] ?? null;
}

export function normalizeHashtag(tag: string): string {
  return tag.trim().replace(/^#/, "");
}
