"use client";

import { LikeButton } from "./LikeButton";
import { ShareButton } from "./ShareButton";

export function EngagementButtons({
  pickId,
  likeCount,
  shareUrl,
  shareTitle,
}: {
  pickId: string;
  likeCount: number;
  shareUrl: string;
  shareTitle?: string;
}) {
  return (
    <div className="flex items-center gap-4 text-ink">
      <LikeButton pickId={pickId} initialCount={likeCount} />
      <ShareButton url={shareUrl} title={shareTitle} />
    </div>
  );
}
