import type { PartnerSectionConfig } from "@/lib/curation";
import { renderPartnerBody } from "@/lib/partner-section-link";

export function PartnerSection({
  config,
}: {
  config: PartnerSectionConfig;
}) {
  return (
    <section id="partner">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">
        {config.heading}
      </h2>
      <p className="text-ink-muted leading-relaxed whitespace-pre-line">
        {renderPartnerBody(config, "text-brand-dark font-semibold hover:underline")}
      </p>
    </section>
  );
}
