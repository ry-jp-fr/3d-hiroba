# Meta App Review Implementation Summary

**Date**: 2026-05-25
**Status**: Ready for re-submission to **Meta oEmbed Read**

---

## Overview

3D Hiroba calls the Meta oEmbed Read endpoint to obtain the official
Instagram embed HTML for each curated post, and renders it inside a modal
dialog. The gallery grid shows only a small thumbnail derived from the
public post page's `og:image` meta tag; the thumbnail is cached for 7
days at a time and deleted on pick removal.

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
| Stopped requesting `thumbnail_url`/`author_name`/`author_url`/`title` from oEmbed | These fields were removed from oEmbed responses 2025-11-03. |
| Detail modal now renders the **official Instagram embed** via `embed.js` | Addresses 1.6 (use case invalid): the embed is the genuine, untouched Instagram render. |
| Thumbnail is `og:image` from the public post page, cached for 7 days, refreshed by Vercel Cron, deleted on pick removal | Replaces the previous "persistent" Blob copy of oEmbed thumbnail_url; satisfies TOS 1.3 by treating the cache as transient. |
| API version bumped to v19.0 | v18.0 is being deprecated. |
| Use Case Description rewritten | Removed trigger words "unified gallery format" and "persistent availability". |

---

## Implementation

### `lib/og-image.ts`

- `fetchInstagramEmbedHtml(permalink)` — Meta oEmbed Read,
  `fields=html&omitscript=true&hidecaption=true`. Returns the `html`
  string only.
- `fetchOgImageFromPublicPage(permalink)` — fetches the public post page
  with a browser User-Agent and extracts the `og:image` meta tag.
- `downloadAndStoreImage(imageUrl, shortcode)` — saves the image to
  Vercel Blob at `picks/<shortcode>.<ext>` with `allowOverwrite: true`.

### `lib/curation.ts`

- `PickEntry.ogImageRefreshedAt` — ISO timestamp used by the Cron job.
- `canonicalInstagramPermalink(rawUrl)` — normalizes any Instagram URL
  (including `/{username}/p/{shortcode}/`) to
  `https://www.instagram.com/p/<shortcode>/`.

### `app/api/admin/picks/route.ts`

- **POST** normalizes the input URL, calls `fetchInstagramEmbedHtml` to
  populate `embedHtml`, calls `fetchOgImageFromPublicPage` +
  `downloadAndStoreImage` to populate `mediaUrl`, and stamps
  `ogImageRefreshedAt`.
- **DELETE** removes the curation entry and immediately deletes the
  cached Blob (both `mediaUrl` and `thumbnailUrl`) via
  `lib/blob-utils.safeDelBlob`.

### `app/api/cron/refresh-thumbnails/route.ts` (new)

- Path: `/api/cron/refresh-thumbnails`
- Schedule: `0 3 * * 0` (Sunday 03:00 UTC) — see `vercel.json`.
- Auth: `Authorization: Bearer ${CRON_SECRET}`.
- For each pick older than 7 days: refetch og:image, overwrite the Blob
  in place, update `ogImageRefreshedAt`. Concurrency capped at 5.
  Re-checks pick existence inside the update transaction so concurrent
  admin deletions never resurrect a removed pick.

### `components/ImageLightbox.tsx`

- When `post.embedHtml` is present, render it via
  `dangerouslySetInnerHTML` and load `embed.js` from `www.instagram.com`
  (cached as a singleton; re-processed on each mount).
- Falls back to the existing `<img>` / `<video>` render for legacy data.

### `lib/blob-utils.ts` (new)

- `isBlobUrl`, `safeDelBlob` — extracted from
  `app/api/admin/sheets/route.ts` and shared with picks DELETE + Cron.

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
| `BLOB_READ_WRITE_TOKEN` | Vercel | Vercel Blob token |
| `CRON_SECRET` | Vercel | Random string sent by Vercel Cron in `Authorization: Bearer` |
| `ADMIN_PASSWORD` | Vercel | Admin panel password |

---

## Verification (local)

1. POST `/api/admin/picks` with `method: "instagram-url"` and a real IG
   URL → `curation.json` shows the new pick with `embedHtml`, `mediaUrl`
   (Blob), and `ogImageRefreshedAt`.
2. Open `/` → click a card → detail modal shows the official IG embed,
   caption hidden, `embed.js` loaded from `www.instagram.com`.
3. DELETE `/api/admin/picks?id=<id>` → curation entry gone AND the file
   at `picks/<shortcode>.jpg` is removed from Vercel Blob.
4. `curl -H "Authorization: Bearer $CRON_SECRET" \
     http://localhost:3000/api/cron/refresh-thumbnails` →
   `ogImageRefreshedAt` is updated; the same call without the header
   returns 401.

---

## Related documents

- `META_APP_REVIEW_CHECKLIST.md` — submission form templates.
- `META_DATA_USE_STATEMENT.txt` — Data Use Statement (verbatim).
- `DEMO_VIDEO_SCRIPT.md` — demo recording script.
- `TEST_CREDENTIALS.md` — test account credentials for Meta reviewer.

---

**Last Updated**: 2026-05-25
