import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";
import seedManualPostsData from "@/data/manual-posts.json";

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

export type HeroPhoto = {
  imageUrl: string;
  author?: string;
  alt?: string;
};

export type HeroConfig = {
  eyebrow: string;
  titleAccent: string;
  titleRest: string;
  description: string;
  photo1: HeroPhoto;
  photo2: HeroPhoto;
};

export const DEFAULT_HERO: HeroConfig = {
  eyebrow: "できた！って、うれしい。",
  titleAccent: "できた！",
  titleRest: "が、\nつながる。",
  description:
    "3Dひろばは、3Dペンで生まれた「できた！」を 親子でみせあい、ゆるやかにつながっていく参加型のひろばです。はじめての一本でも、まだ途中でも、「できてうれしい」を、そのまま持ってきてください。",
  photo1: {
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
    author: "@hiroba_user_a",
    alt: "ドラゴンの3Dペン作品",
  },
  photo2: {
    imageUrl:
      "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=900&q=80",
    author: "@hiroba_user_e",
    alt: "和風ランタンの3Dペン作品",
  },
};

export type CurationData = {
  hashtags: HashtagEntry[];
  picks: PickEntry[];
  seedManualPostsImported?: boolean;
  hero?: HeroConfig;
};

type SeedManualPost = {
  id: string;
  title?: string;
  author?: string;
  authorUrl?: string;
  imageUrl: string;
  caption?: string;
  tags?: string[];
  permalink?: string;
  postedAt?: string;
  pentaComment?: string;
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
      seedManualPostsImported: parsed.seedManualPostsImported,
      hero: parsed.hero,
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
  const { blobs } = await list({ prefix: BLOB_PATHNAME });
  const found = blobs.find((b) => b.pathname === BLOB_PATHNAME);
  if (!found) {
    // Blob doesn't exist yet — seed with bundled data/curation.json.
    return await seedBlobFromLocal();
  }
  // Append uploadedAt as a cache-buster so the Vercel Blob CDN doesn't serve
  // stale content after an overwrite. Without this, a read-modify-write cycle
  // can silently overwrite fresh data with a cached older version.
  const version = found.uploadedAt
    ? new Date(found.uploadedAt).getTime()
    : Date.now();
  const bustedUrl = `${found.url}${found.url.includes("?") ? "&" : "?"}v=${version}`;
  const res = await fetch(bustedUrl, { cache: "no-store" });
  if (!res.ok) {
    // Do NOT fall back to default/empty data here. Returning empty would
    // cause a subsequent write to destroy real data. Surface the error.
    throw new Error(`blob_fetch_failed_${res.status}`);
  }
  const parsed = (await res.json()) as Partial<CurationData>;
  return {
    hashtags: parsed.hashtags ?? [],
    picks: parsed.picks ?? [],
    seedManualPostsImported: parsed.seedManualPostsImported,
  };
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
      seedManualPostsImported: parsed.seedManualPostsImported,
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

async function migrateSeedManualPosts(
  data: CurationData,
): Promise<CurationData> {
  if (data.seedManualPostsImported) return data;

  const seedPosts =
    (seedManualPostsData as { posts?: SeedManualPost[] }).posts ?? [];
  const seedPicks: PickEntry[] = seedPosts.map((p) => ({
    id: `seed-manual-${p.id}`,
    method: "manual-upload",
    title: p.title,
    author: p.author,
    authorUrl: p.authorUrl,
    mediaType: "image",
    mediaUrl: p.imageUrl,
    caption: p.caption,
    tags: p.tags ?? [],
    permalink: p.permalink,
    postedAt: p.postedAt,
    pentaComment: p.pentaComment,
    addedAt: p.postedAt ?? new Date().toISOString(),
  }));

  const existingIds = new Set(data.picks.map((p) => p.id));
  const additions = seedPicks.filter((p) => !existingIds.has(p.id));
  const next: CurationData = {
    ...data,
    picks: [...data.picks, ...additions],
    seedManualPostsImported: true,
  };
  await writeCuration(next);
  return next;
}

export async function readCuration(): Promise<CurationData> {
  const raw = useBlob() ? await readFromBlob() : await readFromFile();
  return migrateSeedManualPosts(raw);
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
