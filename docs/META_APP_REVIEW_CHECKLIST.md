# Meta App Review Checklist — Meta oEmbed Read

3D Hiroba's submission for the **Meta oEmbed Read** feature (the successor
to the deprecated "oEmbed Read", retired 2025-10-01).

## Pre-Submission Checklist

### Application Setup
- [x] Facebook App created (App ID: 26224957440539490)
- [x] Type: Consumer
- [x] Platform: Website
- [x] Environment variables set in Vercel:
  - `FACEBOOK_APP_ID`
  - `FACEBOOK_APP_SECRET`
  - `BLOB_READ_WRITE_TOKEN`
  - `CRON_SECRET`
- [x] API version: **v19.0** (graph.facebook.com/v19.0/instagram_oembed)

### Legal & Contact
- [x] Privacy Policy: https://www.3d-hiroba.jp/privacy (JP/EN)
- [x] Data Deletion Instructions: https://www.3d-hiroba.jp/data-deletion
- [x] Contact form: https://www.3d-hiroba.jp/contact
- [x] Contact email: help@scrib3dpen.jp

### Product Configuration
- [x] Withdraw legacy "oEmbed Read" submission
- [x] Add **Meta oEmbed Read** under Products → Add Product
- [x] App domains: www.3d-hiroba.jp, 3d-hiroba.jp

---

## Submission Form Template (verbatim)

### "What is your app's primary purpose?"

```
3D Hiroba is a community gallery where children and parents share 3D pen
creations. Administrators curate publicly available Instagram posts as
featured items, and each featured post is displayed using the official
Instagram embed returned by Meta oEmbed Read.
```

### "Describe how your app uses Instagram data" (Use Case Description)

```
3D Hiroba is a community gallery for children sharing 3D pen creations.
Administrators curate publicly available Instagram posts as featured items.
For each featured post, we call the Meta oEmbed Read endpoint to obtain the
official embed HTML, which is rendered inside a modal dialog exactly as
Instagram provides it (using hidecaption=true and omitscript=true, with
embed.js loaded from www.instagram.com). The gallery grid itself does not
reproduce Instagram content; it shows only a small thumbnail obtained from
the publicly accessible post page — first the post page's og:image meta
tag, falling back to the publicly embeddable view at
www.instagram.com/p/<shortcode>/embed/captioned/ (the same view that
embed.js renders inside the iframe). This thumbnail is temporarily cached
in our CDN-backed object storage to reduce load on Instagram's image
servers, is automatically refreshed every 7 days by a scheduled job, and
is immediately deleted when the administrator removes the post. We do not
store engagement metrics, author profile data, or any non-public
information. We do not combine Instagram data with other datasets, do not
use it for advertising, and do not share it with third parties.
```

### "Which fields will you request from oEmbed?"

```
Only the html field. The endpoint is called with:
  ?url=<canonical permalink>
  &access_token=<APP_ID>|<APP_SECRET>
  &omitscript=true
  &hidecaption=true
  &fields=html
We do not request author_name, author_url, thumbnail_url,
thumbnail_width, thumbnail_height, or title.
```

### "Who has access to this data?"

```
- Site administrators (authentication-gated /admin route).
- End users see the public gallery and the official Instagram embed.
- No third-party integrations.
```

### "What is your data retention policy?"

```
Curation metadata is kept while the post is featured. The cached og:image
in our object storage is refreshed every 7 days by a Vercel Cron job and
deleted immediately when the administrator removes the post (the API
DELETE handler removes both the curation entry and the cached Blob in the
same operation).
```

---

## Demo Recording

See `DEMO_VIDEO_SCRIPT.md`. The demo must show:

1. Admin pastes an Instagram URL.
2. Detail modal opens with the **official Instagram embed iframe** (with
   caption hidden, embed.js loaded from www.instagram.com).
3. Admin removes the pick → the cached image in object storage is gone
   in the same flow (show a network/devtools panel or storage view).

---

## Critical "Don'ts" (lessons from previous rejection)

| Avoid | Reason |
|---|---|
| Describing the grid as a "unified gallery format" | Reads as 1.6 violation (reproducing Instagram in a custom shell). |
| Saying images are "stored indefinitely" or "persistent" | Reads as TOS 1.3 violation (persisting Platform Data). |
| Requesting `thumbnail_url`, `author_name`, `author_url`, `title` | These fields were removed from oEmbed on 2025-11-03. |
| Referencing the retired "oEmbed Read" feature | Replaced by "Meta oEmbed Read" on 2025-10-01. |

---

## After Approval

1. Switch app to Live Mode (Settings → Basic).
2. Verify Vercel Cron is enabled in the dashboard (Settings → Cron Jobs).
3. Verify `CRON_SECRET` is set as a production environment variable.
4. Trigger one manual cron run via:
   ```
   curl -H "Authorization: Bearer $CRON_SECRET" \
     https://www.3d-hiroba.jp/api/cron/refresh-thumbnails
   ```
   and confirm `ogImageRefreshedAt` was updated.

---

## References

- Meta oEmbed Read docs: https://developers.facebook.com/docs/features-reference/oembed-read
- Meta Platform Terms: https://developers.facebook.com/terms/
- Vercel Cron: https://vercel.com/docs/cron-jobs

---

**Last Updated**: 2026-05-25
**Status**: Ready for re-submission to "Meta oEmbed Read"
