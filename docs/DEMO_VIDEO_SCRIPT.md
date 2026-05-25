# Demo Video Script for Meta oEmbed Read App Review

**Application**: 3D Hiroba
**Feature**: Meta oEmbed Read
**Duration**: 4–6 minutes
**Format**: Screen recording (desktop browser + admin console + storage view)

---

## Goal of the demo

Show the Meta reviewer, end-to-end:

1. Where the **official Instagram embed** appears (the modal — this is the
   product of the oEmbed Read call).
2. That the gallery grid does **not** reproduce Instagram content; it
   displays only a small thumbnail derived from the public `og:image`.
3. That the cached thumbnail is **deleted immediately** when an
   administrator removes the pick.

These three points address every concern raised in the previous
rejection.

---

## Scene plan

| # | Duration | Content |
|---|---|---|
| 1 | 0:30 | Homepage gallery grid (custom card UI = thumbnails only). |
| 2 | 1:30 | Click a card → modal opens with the **official Instagram embed iframe** (`hidecaption=true`, embed.js loaded from www.instagram.com). |
| 3 | 1:30 | Admin console: paste an Instagram URL → pick is added with embed HTML + cached og:image thumbnail. |
| 4 | 1:00 | Admin removes the pick → show in Vercel Blob (or DevTools/Network) that `picks/<shortcode>.jpg` is gone immediately. |
| 5 | 0:30 | Privacy Policy / Data Deletion / Contact pages briefly. |

---

## Scene 1 — Gallery overview (0:00 – 0:30)

**Visual**: https://www.3d-hiroba.jp

**Narration**:
> "3D Hiroba is a community gallery for families sharing 3D pen creations.
> Each card you see is a small thumbnail derived from the public Instagram
> post page's og:image meta tag — we do not reproduce Instagram content in
> the grid. Clicking a card opens the official Instagram embed."

**Actions**:
1. Load the homepage.
2. Scroll the gallery, hover a few cards.

---

## Scene 2 — Official embed in detail modal (0:30 – 2:00) ⭐ key scene

**Visual**: Click a gallery card; modal opens.

**Narration**:
> "The detail view is the official Instagram embed returned by Meta
> oEmbed Read. We pass `hidecaption=true` and `omitscript=true`, and we
> load `embed.js` directly from `www.instagram.com`. The reviewer can
> verify in DevTools that the iframe is Instagram's own."

**Actions**:
1. Click a card.
2. Open browser DevTools → Network panel → filter "instagram".
3. Show requests to `www.instagram.com/embed.js` and the embed iframe.
4. Show the modal: caption is hidden, the iframe is rendered untouched.
5. Close the modal.

---

## Scene 3 — Add pick via Instagram URL (2:00 – 3:30)

**Visual**: `/admin/instagram-urls`

**Narration**:
> "When an administrator adds a featured post, we call Meta oEmbed Read
> once to obtain the embed HTML, and we read the og:image meta tag from
> the public post page to derive the small thumbnail shown in the grid.
> The thumbnail is stored in our object storage as a temporary cache."

**Actions**:
1. Log into the admin console.
2. Open the "Instagram URL" tab.
3. Paste a public Instagram post URL.
4. Click "Register". Show:
   - The success state in the form.
   - The new entry in the "Registered" list with thumbnail.
5. (Optional) Open Vercel Blob dashboard in another tab and show the new
   file at `picks/<shortcode>.jpg` with a recent timestamp.

---

## Scene 4 — Deletion removes the cached image immediately (3:30 – 4:30) ⭐ key scene

**Visual**: Same admin page, then the Vercel Blob dashboard.

**Narration**:
> "When the administrator removes a pick, the cached image is deleted
> from object storage in the same operation. The cache is also
> automatically refreshed every 7 days by a scheduled job, so we treat
> it as a transient cache and not as a persistent copy of Platform Data."

**Actions**:
1. Click "削除" (Delete) on the pick added in Scene 3.
2. Confirm the dialog.
3. Refresh the Blob dashboard → the file `picks/<shortcode>.jpg` is
   gone.
4. (Optional) Show `vercel.json` and
   `app/api/cron/refresh-thumbnails/route.ts` in an editor for 5
   seconds, narrating: "And here is the weekly refresh job."

---

## Scene 5 — Privacy, Data Deletion, Contact (4:30 – 5:00)

**Visual**: `/privacy`, `/data-deletion`, `/contact`

**Narration**:
> "Our Privacy Policy, Data Deletion instructions, and Contact form are
> all linked from the site footer."

**Actions**:
1. Click through each page briefly (3–5 seconds each).
2. Show the bilingual toggle on `/privacy`.

---

## What to AVOID showing

- Real passwords, App Secrets, or CRON_SECRET values.
- Devtools tabs that expose other site cookies.
- Any "unified gallery format" language in the narration or screen text.
- The legacy product name "oEmbed Read" (it is now **Meta oEmbed Read**).

---

## Voiceover (full, English)

> "3D Hiroba is a community gallery for families sharing 3D pen
> creations. The grid you see is built from small thumbnails derived
> from the public Instagram post page's og:image meta tag — we don't
> reproduce Instagram content here.
>
> When you click a card, the detail view is the official Instagram embed
> returned by Meta oEmbed Read. We pass hidecaption=true and
> omitscript=true, and load embed.js from www.instagram.com. You can
> verify in DevTools that the iframe is Instagram's own.
>
> In the admin console, administrators add featured posts by pasting an
> Instagram URL. We call Meta oEmbed Read once to obtain the embed HTML,
> and read the og:image meta tag from the public post page for the
> thumbnail. The thumbnail is stored in object storage as a temporary
> cache.
>
> When the administrator removes a pick, the cached image is deleted
> from object storage in the same operation. The cache is also
> automatically refreshed every seven days by a scheduled job, so we
> treat it as a transient cache, not a persistent copy of Platform
> Data.
>
> Our Privacy Policy, Data Deletion instructions, and Contact form are
> all linked from the site footer."

---

## Recording checklist

- [ ] App is in Live mode (or shown working against the Meta oEmbed Read
      sandbox).
- [ ] A test Instagram URL is prepared and known to return a valid
      embed.
- [ ] Vercel Blob dashboard tab is opened ahead of time.
- [ ] DevTools Network panel is visible during Scene 2.
- [ ] No real `CRON_SECRET`, `FACEBOOK_APP_SECRET`, or admin password
      is on screen.
- [ ] Final length: 4–6 minutes.
- [ ] Export: MP4 (H.264), 1920×1080.

---

**Last Updated**: 2026-05-25
