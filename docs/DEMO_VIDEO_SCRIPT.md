# Demo Video Script for Meta oEmbed Read App Review

**Application**: 3D Hiroba
**Feature**: Meta oEmbed Read
**Duration**: 3–5 minutes
**Format**: Screen recording (desktop browser + admin console)

---

## Goal of the demo

Show the Meta reviewer, end-to-end:

1. The gallery grid card **IS** the official Instagram embed iframe
   (not a custom card reproducing Instagram content).
2. Admin registers a post by pasting a URL; the official embed is the
   only thing rendered.
3. Admin removes the post; nothing remains on our side.

These three points address every concern raised in the previous
rejection.

---

## Scene plan

| # | Duration | Content |
|---|---|---|
| 1 | 0:30 | Homepage gallery — every card is an Instagram embed iframe (caption hidden). |
| 2 | 0:30 | Open DevTools → Network panel → show the embed iframe is served from www.instagram.com, post image from *.cdninstagram.com. |
| 3 | 1:00 | Admin console: paste an Instagram URL → pick added; oEmbed Read call visible in logs. |
| 4 | 0:45 | New pick appears in the gallery as the embed iframe, identical to existing ones. |
| 5 | 0:30 | Admin removes the pick → it disappears from the gallery. |
| 6 | 0:30 | Privacy Policy / Data Deletion / Contact pages briefly. |

---

## Scene 1 — Gallery overview (0:00 – 0:30)

**Visual**: https://www.3d-hiroba.jp

**Narration**:
> "3D Hiroba is a community gallery for families sharing 3D pen
> creations. Every Instagram-featured card you see is the official
> Instagram embed iframe — caption hidden via the hidecaption parameter,
> everything else loaded directly from Instagram. We do not reproduce
> Instagram content in any custom layout."

**Actions**:
1. Load the homepage.
2. Scroll the gallery so several embed cards are visible.

---

## Scene 2 — Verify it's the official embed (0:30 – 1:00) ⭐ key scene

**Visual**: DevTools

**Narration**:
> "DevTools confirms the embed is Instagram's own iframe and that the
> post image is loaded from Instagram's CDN, never from us."

**Actions**:
1. Open DevTools → Network panel.
2. Filter "instagram" → show `embed.js` loaded from `www.instagram.com`.
3. Click an embed card; show the iframe whose `src` is on
   `www.instagram.com`.
4. Filter "cdninstagram" → show the post image fetched from
   `*.cdninstagram.com` by the iframe, not our server.

---

## Scene 3 — Register a new pick by pasting an Instagram URL (1:00 – 2:00)

**Visual**: `/admin/instagram-urls`

**Narration**:
> "When an administrator adds a featured post, we call Meta oEmbed Read
> exactly once to obtain the official embed HTML with hidecaption=true
> and omitscript=true. We store only that HTML string. No image is
> downloaded, no thumbnail is cached."

**Actions**:
1. Log into the admin console.
2. Open the "Instagram URL" tab.
3. Paste a public Instagram post URL.
4. Click "登録する".
5. (Optional) Show Vercel logs:
   `[picks] embed_html_fetched shortcode=...`
6. The new entry appears in the "Registered" list.

---

## Scene 4 — New pick appears as embed (2:00 – 2:45)

**Visual**: Back to homepage.

**Actions**:
1. Refresh the homepage.
2. The new pick is now rendered as the official Instagram embed
   iframe, identical in structure to the other cards.
3. Click "View on Instagram" on the embed → goes to instagram.com.

---

## Scene 5 — Deletion (2:45 – 3:15) ⭐ key scene

**Visual**: Admin → remove pick.

**Narration**:
> "When the administrator removes a pick, the curation entry is
> deleted. Because we never stored any image, there is nothing else to
> clean up."

**Actions**:
1. Click "削除" on the newly added pick.
2. Confirm.
3. Return to the homepage; the embed is gone.

---

## Scene 6 — Privacy, Data Deletion, Contact (3:15 – 3:45)

**Visual**: `/privacy`, `/data-deletion`, `/contact`

**Actions**:
1. Click through each page briefly (3–5 seconds each).
2. Show the bilingual toggle on `/privacy`.

---

## What to AVOID showing

- Real passwords, App Secrets, or admin credentials.
- DevTools tabs that expose other cookies.
- Any "unified gallery format" language in the narration or on-screen
  text.
- The legacy product name "oEmbed Read" (it is now **Meta oEmbed Read**).
- Any CSS overlay that hides parts of the embed iframe.

---

## Voiceover (full, English)

> "3D Hiroba is a community gallery for families sharing 3D pen
> creations. Every Instagram-featured card in the gallery is the
> official Instagram embed iframe with the caption hidden via
> hidecaption=true. DevTools confirms that the iframe is served from
> www.instagram.com and the post image is loaded directly from
> Instagram's CDN — no Instagram media ever passes through our
> servers.
>
> Administrators add featured posts by pasting an Instagram URL. We
> call Meta oEmbed Read exactly once to obtain the embed HTML and
> store only that HTML string. No image is downloaded, no thumbnail
> is cached.
>
> When the administrator removes a pick, the curation entry is
> deleted. Because we never stored any image, there is nothing else
> to clean up.
>
> Our Privacy Policy, Data Deletion instructions, and Contact form are
> linked from the site footer."

---

## Recording checklist

- [ ] At least one Instagram pick already exists so Scene 1 has
      content.
- [ ] A test Instagram URL is prepared and known to return a valid
      embed.
- [ ] DevTools Network panel is visible during Scene 2.
- [ ] No real `FACEBOOK_APP_SECRET` or admin password is on screen.
- [ ] Final length: 3–5 minutes.
- [ ] Export: MP4 (H.264), 1920×1080.

---

**Last Updated**: 2026-05-26
