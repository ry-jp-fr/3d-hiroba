import { readCuration } from "@/lib/curation";
import { HashtagManager } from "./HashtagManager";

export const dynamic = "force-dynamic";

export default async function HashtagsPage() {
  const data = await readCuration();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          HASHTAG
        </p>
        <h1 className="mt-2 text-2xl font-bold">ハッシュタグで選定</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          登録したハッシュタグを Instagram Graph API (hashtag search) で検索し、
          最近の投稿を自動的にギャラリーに取り込みます。
          スイッチで一時的に無効化すると、取得対象から外せます。
        </p>
      </div>
      <HashtagManager initial={data.hashtags} />
    </div>
  );
}
