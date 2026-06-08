# Meta App Review Implementation Summary

**Date**: 2026-05-26
**Status**: Ready for re-submission to **Meta oEmbed Read**

---

## Overview

3D Hiroba calls the Meta oEmbed Read endpoint to obtain the official
Instagram embed HTML for each curated post, and renders that embed
unchanged as the gallery card itself. There is no thumbnail cache, no
image binary stored on our side, and no scheduled background job
touching Instagram resources. Instagram's own embed.js loads the post
image from www.instagram.com in the visitor's browser, so user-content
traffic never passes through our servers.

- **App ID**: 26224957440539490
- **API Version**: v19.0 (`graph.facebook.com/v19.0/instagram_oembed`)
- **Feature requested**: Meta oEmbed Read (the legacy "oEmbed Read" was
  retired 2025-10-01)
- **Deployment**: Vercel (production at https://www.3d-hiroba.jp)

---

## What changed since the previous (rejected) submission

| Change | Why |
|---|---|
| Migrated to **Meta oEmbed Read** feature | Legacy "oEmbed Read" retired 2025-10-01. |
| Stopped requesting `thumbnail_url`/`author_name`/`author_url`/`title` | These fields were removed from oEmbed responses 2025-11-03. We request only `html`. |
| **Gallery card now IS the official Instagram embed iframe** | Directly addresses 1.6 (use case invalid) — there is no longer any custom layout reproducing Instagram content. |
| Removed all server-side image caching | Directly addresses TOS 1.3 (persisting Platform Data). Instagram's embed.js loads the post image client-side from www.instagram.com. |
| Removed the weekly Vercel Cron refresh job | No cache to refresh. |
| API version bumped to v19.0 | v18.0 is being deprecated. |
| Use Case Description rewritten | Removed trigger words "unified gallery format" and "persistent availability". |

---

## Implementation

### `lib/og-image.ts`

- `fetchInstagramEmbedHtml(permalink)` — Meta oEmbed Read,
  `fields=html&omitscript=true&hidecaption=true`. Returns the `html`
  string only.
- `downloadAndStoreImage(imageUrl, shortcode)` — used only by the manual
  thumbnail upload fallback (for picks that don't have an Instagram
  embed and need a static image).

### `lib/curation.ts`

- `canonicalInstagramPermalink(rawUrl)` — normalizes any Instagram URL
  (including `/{username}/p/{shortcode}/`) to
  `https://www.instagram.com/p/<shortcode>/`.

### `app/api/admin/picks/route.ts`

- **POST** normalizes the input URL, calls `fetchInstagramEmbedHtml` to
  populate `embedHtml`. Admin may also paste an embed code directly,
  which we sanitize and store without calling Meta oEmbed Read.
- If neither an embedHtml nor a manually uploaded thumbnail is
  available for an instagram-url pick, POST returns 502
  `embed_unavailable_thumb_required` with a clear message in the UI.
- **DELETE** removes the curation entry and deletes any locally
  uploaded thumbnail Blob.

### `components/PostCard.tsx`

- When `post.embedHtml` is present, the card renders that HTML inside a
  `<div>` and calls `window.instgrm.Embeds.process()`. `embed.js` is
  loaded once from `www.instagram.com`.
- Picks without `embedHtml` (manual uploads, seed data) still render
  the existing custom card with our own thumbnail.

### `components/ImageLightbox.tsx`

- Unchanged. Used only by manual-upload cards (embed cards have their
  own "View on Instagram" affordance and don't open the lightbox).

### `lib/blob-utils.ts`

- `isBlobUrl`, `safeDelBlob` — shared between picks DELETE and the
  sheets API for cleaning up uploaded Blobs on removal.

---

## Legal & contact endpoints

| Component | Path |
|---|---|
| Privacy Policy | `/privacy` (JP/EN) |
| Data Deletion | `/data-deletion` |
| Contact | `/contact` |
| Deauthorization Callback | `POST /api/instagram/deauthorize` |

All four return 200 in production.

---

## Environment variables

| Name | Where | Notes |
|---|---|---|
| `FACEBOOK_APP_ID` | Vercel | Meta App ID |
| `FACEBOOK_APP_SECRET` | Vercel | Meta App Secret |
| `BLOB_READ_WRITE_TOKEN` | Vercel | Vercel Blob token (manual uploads only) |
| `ADMIN_PASSWORD` | Vercel | Admin panel password |

---

## Verification (local)

1. POST `/api/admin/picks` with `method: "instagram-url"` and a real IG
   URL → `curation.json` shows the new pick with `embedHtml`. No
   image is downloaded to Blob (`picks/` prefix has no new files).
2. Open `/` → the new pick appears as the official Instagram embed
   iframe, caption hidden, `embed.js` loaded from `www.instagram.com`,
   post image loaded directly from `*.cdninstagram.com` to the
   visitor's browser.
3. DELETE `/api/admin/picks?id=<id>` → curation entry gone. No Blob to
   delete (none was created).
4. Paste an admin-supplied embed code via "埋め込みコードから登録" →
   pick saved with the pasted HTML (no oEmbed call); same rendering
   as above.

---

## Related documents

- `META_APP_REVIEW_CHECKLIST.md` — submission form templates.
- `META_DATA_USE_STATEMENT.txt` — Data Use Statement (verbatim).
- `DEMO_VIDEO_SCRIPT.md` — demo recording script.
- `TEST_CREDENTIALS.md` — test account credentials for Meta reviewer.

---

**Last Updated**: 2026-05-26
