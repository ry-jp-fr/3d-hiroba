import { readCuration, DEFAULT_PARTNER_SECTION } from "@/lib/curation";
import { PartnerSectionManager } from "./PartnerSectionManager";

export const dynamic = "force-dynamic";

export default async function PartnerSectionPage() {
  const curation = await readCuration();
  const partnerSection = curation.partnerSection ?? DEFAULT_PARTNER_SECTION;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">公式パートナー</h1>
      <p className="text-ink-muted mb-8">
        /about ページの「公式パートナーについて」セクションを編集します。
      </p>
      <PartnerSectionManager initialData={partnerSection} />
    </div>
  );
}
