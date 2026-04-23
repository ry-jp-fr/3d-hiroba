import Link from "next/link";
import { readCuration } from "@/lib/curation";
import { getGalleryData } from "@/lib/posts";
import { adminPasswordEnabled } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const curation = await readCuration();
  const gallery = await getGalleryData();

  const hashtagCount = curation.hashtags.filter((h) => h.enabled).length;
  const urlCount = curation.picks.filter(
    (p) => p.method === "instagram-url",
  ).length;
  const uploadCount = curation.picks.filter(
    (p) => p.method === "manual-upload",
  ).length;

  const cards = [
    {
      href: "/admin/hashtags",
      title: "ハッシュタグで選定",
      body: "対象ハッシュタグを登録すると、Instagram Graph APIから自動で作品を取り込みます。",
      stat: `${hashtagCount} 件有効`,
      color: "bg-pink-50 border-pink-100",
    },
    {
      href: "/admin/instagram-urls",
      title: "URLで選定",
      body: "個別のInstagram投稿URLを登録して、ピンポイントで作品を掲載します。",
      stat: `${urlCount} 件登録`,
      color: "bg-violet-50 border-violet-100",
    },
    {
      href: "/admin/uploads",
      title: "手動アップロード",
      body: "Instagramを経由せず、画像や動画を直接アップロードして掲載します。",
      stat: `${uploadCount} 件登録`,
      color: "bg-amber-50 border-amber-100",
    },
    {
      href: "/admin/hero",
      title: "トップページを編集",
      body: "トップの見出し・説明文・メイン画像 2 枚を変更できます。",
      stat: "",
      color: "bg-emerald-50 border-emerald-100",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-semibold text-brand-dark tracking-widest">
          DASHBOARD
        </p>
        <h1 className="mt-2 text-3xl font-bold">作品管理ダッシュボード</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed">
          3Dひろばに掲載する作品を、ハッシュタグ・URL・手動アップロードの3つの方法で選定できます。
          編集内容はすぐにサイトに反映されます。
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`rounded-3xl border ${card.color} p-6 hover:shadow-md transition-shadow flex flex-col`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{card.title}</h2>
              <span className="text-[11px] font-semibold text-ink-muted bg-white rounded-full px-2 py-1">
                {card.stat}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed flex-1">
              {card.body}
            </p>
            <span className="mt-4 text-sm font-semibold text-brand-dark">
              管理する →
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl bg-white border border-black/5 p-6">
        <h2 className="font-bold text-lg">現在の掲載状況</h2>
        <dl className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Stat label="総掲載数" value={gallery.posts.length} />
          <Stat
            label="ハッシュタグ取得"
            value={gallery.instagramCount}
            note={
              gallery.instagramConfigured
                ? gallery.hashtags.map((t) => `#${t}`).join(" ")
                : "Instagram API未接続"
            }
          />
          <Stat label="URL選定" value={gallery.instagramUrlCount} />
          <Stat label="手動アップロード" value={gallery.uploadCount} />
        </dl>
        {gallery.instagramError && (
          <p className="mt-4 text-xs text-red-600">
            Instagram取得エラー: {gallery.instagramError}
          </p>
        )}
      </section>

      <section className="rounded-3xl bg-white border border-black/5 p-6">
        <h2 className="font-bold text-lg">運用メモ</h2>
        <ul className="mt-4 space-y-2 text-sm text-ink-muted list-disc list-inside">
          <li>
            Instagram Graph API の認証情報は <code>.env.local</code> の
            <code className="mx-1">INSTAGRAM_ACCESS_TOKEN</code>/
            <code>INSTAGRAM_BUSINESS_ACCOUNT_ID</code> で設定します。
          </li>
          <li>
            管理画面のパスワードは環境変数
            <code className="mx-1">ADMIN_PASSWORD</code>
            を設定すると有効化されます。未設定の場合は誰でもアクセスできます。
            {adminPasswordEnabled() ? (
              <span className="ml-2 text-green-700 font-semibold">（有効）</span>
            ) : (
              <span className="ml-2 text-amber-700 font-semibold">
                （未設定）
              </span>
            )}
          </li>
          <li>
            ハッシュタグの自動取得は1時間ごとにキャッシュが更新されます。
          </li>
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="rounded-2xl bg-paper px-4 py-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-bold">{value}</dd>
      {note && <p className="mt-1 text-[11px] text-ink-muted">{note}</p>}
    </div>
  );
}
