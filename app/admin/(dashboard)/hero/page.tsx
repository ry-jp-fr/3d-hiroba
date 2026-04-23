import { DEFAULT_HERO, readCuration } from "@/lib/curation";
import { HeroManager } from "./HeroManager";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  const data = await readCuration();
  const hero = data.hero ?? DEFAULT_HERO;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          HERO
        </p>
        <h1 className="mt-2 text-2xl font-bold">トップページを編集</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          トップページの見出し、説明文、メイン画像を編集できます。
          画像はアップロードまたは URL 指定が可能です。
        </p>
      </div>
      <HeroManager initial={hero} />
    </div>
  );
}
