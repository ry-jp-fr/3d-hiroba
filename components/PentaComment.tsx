"use client";

export function PentaComment({ comment }: { comment: string }) {
  return (
    <div className="flex items-center gap-2 bg-brand-light/70 rounded-2xl px-3 h-[62px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/penta.png"
        alt=""
        aria-hidden
        className="w-[42px] h-[42px] rounded-full object-contain bg-white flex-shrink-0 shadow-sm"
      />
      <p className="text-[11px] sm:text-xs text-ink leading-snug line-clamp-2">
        {comment}
      </p>
    </div>
  );
}
