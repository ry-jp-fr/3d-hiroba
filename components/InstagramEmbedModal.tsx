"use client";

import { useEffect } from "react";

export function InstagramEmbedModal({
  open,
  onOpenChange,
  embedHtml,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedHtml?: string;
}) {
  useEffect(() => {
    if (!open || !embedHtml) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = "//www.instagram.com/embed.js";
    document.body.appendChild(script);

    const handleLoad = () => {
      if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
      }
    };

    script.onload = handleLoad;

    return () => {
      document.body.removeChild(script);
    };
  }, [open, embedHtml]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto relative shadow-2xl">
        <button
          onClick={() => onOpenChange(false)}
          className="sticky top-4 right-4 float-right text-ink-muted hover:text-ink text-xl leading-none w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="p-6">
          {embedHtml && (
            <div
              className="instagram-embed-container"
              dangerouslySetInnerHTML={{ __html: embedHtml }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process?: () => void;
      };
    };
  }
}
