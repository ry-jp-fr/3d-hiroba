/**
 * Capture a single frame from a video as a JPEG Blob, to be uploaded as a
 * poster/thumbnail. Runs entirely in the browser via <video> + <canvas>.
 *
 * Throws when the source can't be decoded (e.g. an iPhone .mov in a codec
 * the browser doesn't support, or a cross-origin URL that taints the canvas).
 * Callers should fall back to manual thumbnail upload in that case.
 */
export async function captureVideoPosterBlob(
  source: File | string,
  opts: { maxEdge?: number; quality?: number; seekSeconds?: number } = {},
): Promise<Blob> {
  const maxEdge = opts.maxEdge ?? 1280;
  const quality = opts.quality ?? 0.85;
  const seekSeconds = opts.seekSeconds ?? 0.1;

  const objectUrl = typeof source === "string" ? null : URL.createObjectURL(source);
  const src = objectUrl ?? (source as string);

  try {
    return await captureFrame(src, {
      maxEdge,
      quality,
      seekSeconds,
      crossOrigin: typeof source === "string",
    });
  } catch (firstErr) {
    // Cross-origin URLs sometimes refuse CORS but are fetchable. Re-fetch as a
    // blob and retry from an object URL, which avoids the canvas-taint path.
    if (typeof source === "string") {
      const res = await fetch(source);
      if (!res.ok) throw firstErr;
      const blob = await res.blob();
      const retryUrl = URL.createObjectURL(blob);
      try {
        return await captureFrame(retryUrl, {
          maxEdge,
          quality,
          seekSeconds,
          crossOrigin: false,
        });
      } finally {
        URL.revokeObjectURL(retryUrl);
      }
    }
    throw firstErr;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

async function captureFrame(
  src: string,
  opts: {
    maxEdge: number;
    quality: number;
    seekSeconds: number;
    crossOrigin: boolean;
  },
): Promise<Blob> {
  const video = document.createElement("video");
  if (opts.crossOrigin) video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = src;

  await new Promise<void>((resolve, reject) => {
    const onError = () => reject(new Error("video_load_failed"));
    video.addEventListener("loadedmetadata", () => resolve(), { once: true });
    video.addEventListener("error", onError, { once: true });
  });

  const seekTarget = Math.min(opts.seekSeconds, Math.max(0, (video.duration || 0) - 0.05));
  await new Promise<void>((resolve, reject) => {
    video.addEventListener("seeked", () => resolve(), { once: true });
    video.addEventListener("error", () => reject(new Error("video_seek_failed")), { once: true });
    try {
      video.currentTime = seekTarget;
    } catch (err) {
      reject(err);
    }
  });

  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) throw new Error("video_dimensions_unavailable");

  const scale = Math.min(1, opts.maxEdge / Math.max(w, h));
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unsupported");
  ctx.drawImage(video, 0, 0, cw, ch);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", opts.quality),
  );
  if (!blob || blob.size === 0) throw new Error("canvas_toBlob_failed");
  return blob;
}
