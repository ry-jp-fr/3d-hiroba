"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "3dhiroba_liked_picks";

function readLikedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeLikedSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore quota / private mode errors
  }
}

export function LikeButton({
  pickId,
  initialCount,
}: {
  pickId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(readLikedSet().has(pickId));
  }, [pickId]);

  async function toggle() {
    if (busy) return;
    const nextLiked = !liked;
    const delta = nextLiked ? 1 : -1;
    setBusy(true);
    setLiked(nextLiked);
    setCount((c) => Math.max(0, c + delta));
    const set = readLikedSet();
    if (nextLiked) set.add(pickId);
    else set.delete(pickId);
    writeLikedSet(set);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pickId,
          action: nextLiked ? "like" : "unlike",
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as { likeCount?: number };
        if (typeof json.likeCount === "number") setCount(json.likeCount);
      } else {
        throw new Error(`${res.status}`);
      }
    } catch {
      // revert on failure
      setLiked(!nextLiked);
      setCount((c) => Math.max(0, c - delta));
      const revert = readLikedSet();
      if (nextLiked) revert.delete(pickId);
      else revert.add(pickId);
      writeLikedSet(revert);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="flex items-center gap-1 hover:opacity-70 transition disabled:opacity-50"
      aria-pressed={liked}
      aria-label={liked ? "いいねを取り消す" : "いいね"}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={liked ? "#ec4899" : "none"}
        stroke={liked ? "#ec4899" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 && (
        <span className="text-xs font-semibold tabular-nums">{count}</span>
      )}
    </button>
  );
}
