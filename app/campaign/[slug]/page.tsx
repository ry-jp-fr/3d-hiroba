import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readCuration, type CampaignPage } from "@/lib/curation";

export const revalidate = 3600;

async function findCampaign(slug: string): Promise<CampaignPage | null> {
  const data = await readCuration();
  const campaign = (data.campaigns ?? []).find((c) => c.slug === slug);
  if (!campaign || !campaign.published) return null;
  return campaign;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await findCampaign(slug);
  if (!campaign) return { title: "3Dひろば" };
  return {
    title: `${campaign.title} | 3Dひろば`,
    description: campaign.body.slice(0, 120),
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function isInternal(url: string): boolean {
  return url.startsWith("/");
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await findCampaign(slug);
  if (!campaign) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const isEnded = Boolean(campaign.endDate && campaign.endDate < today);
  const hasRange = Boolean(campaign.startDate || campaign.endDate);
  const hasCta = Boolean(campaign.ctaLabel && campaign.ctaUrl);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      {campaign.imageUrl && (
        <div className="mb-8 aspect-[3/2] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {hasRange && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-light text-brand-dark">
              {campaign.startDate ? formatDate(campaign.startDate) : ""}
              {campaign.startDate && campaign.endDate ? " 〜 " : ""}
              {campaign.endDate ? formatDate(campaign.endDate) : ""}
            </span>
          )}
          {isEnded && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-200 text-gray-600">
              終了しました
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          {campaign.title}
        </h1>
        {campaign.lead && (
          <p className="mt-4 text-lg text-ink leading-relaxed whitespace-pre-line font-medium">
            {campaign.lead}
          </p>
        )}
      </header>

      {campaign.overview && campaign.overview.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">開催概要</h2>
          <div className="rounded-2xl border border-black/5 overflow-hidden bg-white">
            <table className="w-full text-sm">
              <tbody>
                {campaign.overview.map((row, i) => (
                  <tr
                    key={i}
                    className={i > 0 ? "border-t border-black/5" : undefined}
                  >
                    <th className="w-28 sm:w-36 bg-paper px-4 py-3 text-left font-semibold text-ink align-top whitespace-nowrap">
                      {row.label}
                    </th>
                    <td className="px-4 py-3 text-ink leading-relaxed whitespace-pre-line">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {campaign.body && (
        <p className="text-ink leading-relaxed whitespace-pre-line mb-10">
          {campaign.body}
        </p>
      )}

      {hasCta && (
        <a
          href={campaign.ctaUrl}
          target={isInternal(campaign.ctaUrl!) ? undefined : "_blank"}
          rel={isInternal(campaign.ctaUrl!) ? undefined : "noopener noreferrer"}
          className="inline-block rounded-full bg-brand text-white font-semibold px-8 py-3 text-base hover:bg-brand-dark transition-colors"
        >
          {campaign.ctaLabel}
        </a>
      )}
    </article>
  );
}
