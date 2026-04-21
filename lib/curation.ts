import { promises as fs } from "fs";
import path from "path";

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

const defaultData: CurationData = {
  hashtags: [],
  picks: [],
};

async function ensureFile() {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), "utf8");
  }
}

export async function readCuration(): Promise<CurationData> {
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

export async function writeCuration(data: CurationData): Promise<void> {
  await ensureFile();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
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
