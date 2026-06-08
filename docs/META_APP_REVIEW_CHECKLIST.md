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
  - `BLOB_READ_WRITE_TOKEN` (for admin manual uploads)
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
featured items, and each featured post is rendered as the official
Instagram embed returned by Meta oEmbed Read — both as the gallery card
and as the detail view.
```

### "Describe how your app uses Instagram data" (Use Case Description)

```
3D Hiroba is a community gallery for children sharing 3D pen creations.
Administrators curate publicly available Instagram posts as featured
items. For each featured post we call the Meta oEmbed Read endpoint
exactly once to obtain the official embed HTML (with hidecaption=true
and omitscript=true), and we render that HTML unchanged as the gallery
card itself — Instagram's own embed iframe loads in the visitor's
browser and the post image, profile, and "View on Instagram" link come
straight from www.instagram.com. We do not download, cache, or
otherwise persist any image, caption, author profile, or engagement
data from Instagram. The only Instagram-derived data we store is the
embed HTML string returned by Meta oEmbed Read, kept alongside the
canonical permalink so the embed can be re-rendered on subsequent page
loads; both are deleted immediately when the administrator removes the
pick. We do not combine Instagram data with other datasets, do not use
it for advertising, and do not share it with third parties.
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
- End users see the public gallery and the official Instagram embed
  loaded directly from www.instagram.com.
- No third-party integrations.
```

### "What is your data retention policy?"

```
Only the embed HTML string and the canonical permalink are kept while
the post is featured. There is no image cache — Instagram's embed.js
loads the post image directly from www.instagram.com in the visitor's
browser, so no Instagram media binaries ever pass through our servers.
Deleting a pick removes the curation entry immediately.
```

---

## Demo Recording

See `DEMO_VIDEO_SCRIPT.md`. The demo must show:

1. Admin pastes an Instagram URL.
2. The pick appears in the gallery as the **official Instagram embed
   iframe**, with caption hidden, embed.js loaded from
   www.instagram.com, and all visual elements unchanged.
3. Clicking the embed's "View on Instagram" link goes to instagram.com.
4. Admin removes the pick → the embed disappears from the gallery and
   nothing remains on our side.

---

## Critical "Don'ts" (lessons from previous rejection)

| Avoid | Reason |
|---|---|
| Describing the grid as a "unified gallery format" | Reads as 1.6 violation (reproducing Instagram in a custom shell). The new design IS the Instagram embed, not a custom shell. |
| Saying images are "stored", "cached", "persistent", etc. | We genuinely don't store any Instagram media now — say so clearly. |
| Requesting `thumbnail_url`, `author_name`, `author_url`, `title` | These fields were removed from oEmbed on 2025-11-03. We only request `html`. |
| Referencing the retired "oEmbed Read" feature | Replaced by "Meta oEmbed Read" on 2025-10-01. |
| Any CSS that crops/hides parts of the embed iframe | Violates Meta's embed brand guidelines. We only use the official hidecaption=true parameter. |

---

## After Approval

1. Switch app to Live Mode (Settings → Basic).
2. Confirm the URL-mode admin flow works against arbitrary public posts
   (pre-approval it works only for posts owned by app developers).

---

## References

- Meta oEmbed Read docs: https://developers.facebook.com/docs/features-reference/oembed-read
- Meta Platform Terms: https://developers.facebook.com/terms/
- Instagram Brand Guidelines: https://about.meta.com/brand/resources/instagram/

---

**Last Updated**: 2026-05-26
**Status**: Ready for re-submission to "Meta oEmbed Read"
