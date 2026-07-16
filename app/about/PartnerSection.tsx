import type { PartnerSectionConfig } from "@/lib/curation";

function isInternalLink(url: string): boolean {
  return url.startsWith("/");
}

// Splits body text on the first occurrence of linkText and wraps it in an
// anchor. Falls back to plain text (no link) when linkText/linkUrl aren't
// both set, or when linkText isn't actually present in the body.
function renderBody(config: PartnerSectionConfig) {
  const { body, linkText, linkUrl } = config;
  if (!linkText?.trim() || !linkUrl?.trim()) {
    return body;
  }
  const idx = body.indexOf(linkText);
  if (idx === -1) return body;

  const before = body.slice(0, idx);
  const after = body.slice(idx + linkText.length);
  const internal = isInternalLink(linkUrl);

  return (
    <>
      {before}
      <a
        href={linkUrl}
        target={internal ? undefined : "_blank"}
        rel={internal ? undefined : "noopener noreferrer"}
        className="text-brand-dark font-semibold hover:underline"
      >
        {linkText}
      </a>
      {after}
    </>
  );
}

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
        {renderBody(config)}
      </p>
    </section>
  );
}
