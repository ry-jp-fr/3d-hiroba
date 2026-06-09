/**
 * Sanitize an Instagram embed HTML snippet pasted by an admin.
 * Returns the cleaned `<blockquote class="instagram-media" ...>` outer HTML
 * with any nested <script> stripped, or an empty string if the input is not
 * a valid Instagram embed.
 */
export function sanitizeEmbedHtml(html: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return "";
  }
  const parser = new DOMParser();
  try {
    const doc = parser.parseFromString(html, "text/html");
    const blockquote = doc.querySelector("blockquote.instagram-media");
    if (!blockquote) return "";
    blockquote.querySelectorAll("script").forEach((s) => s.remove());
    return blockquote.outerHTML;
  } catch {
    return "";
  }
}
