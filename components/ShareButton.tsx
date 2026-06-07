"use client";

import { useState } from "react";

export function ShareButton({
  url,
  title,
}: {
  url: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    if (typeof window === "undefined") return;
    const absoluteUrl = url.startsWith("http")
      ? url
      : new URL(url, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ url: absoluteUrl, title });
        return;
      } catch {
        // user cancelled or share unavailable; fall back to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard may be blocked
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className="relative flex items-center hover:opacity-70 transition"
      aria-label="シェア"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M22 3 9.5 13.5 2 11l20-8Z" />
        <path d="m22 3-9 19-3.5-8.5" />
      </svg>
      {copied && (
        <span
          role="status"
          className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-ink text-white px-2 py-0.5 rounded whitespace-nowrap"
        >
          リンクをコピーしました
        </span>
      )}
    </button>
  );
}
