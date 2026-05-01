import { readCuration, DEFAULT_HOMEPAGE } from "@/lib/curation";
import { HomepageManager } from "./HomepageManager";

export default async function HomepagePage() {
  const curation = await readCuration();
  const homepage = curation.homepage || DEFAULT_HOMEPAGE;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">トップページテキスト</h1>
      <p className="text-ink-muted mb-8">ギャラリーセクションのテキストを編集します。</p>
      <HomepageManager initialData={homepage} />
    </div>
  );
}
