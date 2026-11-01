type Props = {
  youtubeId: string | null;
  title: string;
};

export function YouTubeEmbed({ youtubeId, title }: Props) {
  if (!youtubeId) {
    return (
      <div className="aspect-video rounded-2xl border border-dashed border-black/10 bg-white flex flex-col items-center justify-center gap-2 text-ink-muted">
        <span className="text-2xl">🎬</span>
        <span className="text-sm font-semibold">動画は準備中です</span>
        <span className="text-xs">公開までしばらくお待ちください</span>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-video rounded-2xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      </div>
      <a
        href={`https://youtu.be/${youtubeId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs font-semibold text-brand-dark"
      >
        YouTubeアプリで開く ↗
      </a>
    </div>
  );
}
