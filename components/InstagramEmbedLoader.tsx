"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process?: () => void;
      };
    };
  }
}

export function InstagramEmbedLoader() {
  useEffect(() => {
    if (window.instgrm?.Embeds?.process) {
      window.instgrm.Embeds.process();
    }
  }, []);

  return (
    <Script
      id="instagram-embed-script"
      src="https://www.instagram.com/embed.js"
      strategy="lazyOnload"
      onLoad={() => {
        window.instgrm?.Embeds?.process?.();
      }}
    />
  );
}
