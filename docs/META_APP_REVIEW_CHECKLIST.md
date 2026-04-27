# Meta App Review Checklist

This document outlines the configuration required in the Meta Developer Dashboard for approving the Instagram oEmbed API access for 3D Hiroba.

## Pre-Submission Checklist

### ✅ Application Setup
- [x] Facebook App Created (App ID: 26224957440539490)
- [x] App Role: Set as Developer
- [x] App Mode: Development (switching to Live once approved)
- [x] Platform Added: Website
- [x] Environment Variables Configured:
  - `FACEBOOK_APP_ID`
  - `FACEBOOK_APP_SECRET`

### ✅ Legal Requirements
- [x] Privacy Policy Published: https://3d-hiroba.vercel.app/privacy
  - Bilingual (Japanese/English)
  - robots: noindex, nofollow
  - Sections: data collection, usage, storage, third parties, cookies, rights, security
  
- [x] Contact Information Available: https://3d-hiroba.vercel.app/contact
  - Contact form for privacy questions
  - Direct email: ryo.yabuta@fermento-tokyo.com
  
- [x] Terms of Service (Optional but recommended for future)

### 📋 Meta Dashboard Configuration Steps

#### 1. Navigate to App Dashboard
- Go to https://developers.facebook.com/apps/
- Select App ID: 26224957440539490

#### 2. Configure Basic Settings
- **App Name**: 3D Hiroba
- **App Type**: Consumer
- **Category**: Photography, Art, Culture
- **App Domain**: 3d-hiroba.vercel.app
- **App Domains**: 
  - 3d-hiroba.vercel.app
  - vercel.app

#### 3. Add Privacy Policy URL
- Go to Settings → Basic
- **Privacy Policy URL**: https://3d-hiroba.vercel.app/privacy
- **Data Use Statement**: See below

#### 4. Configure Instagram Product
- Left sidebar: Products
- Search for "Instagram Graph API"
- Click "Set Up"
- Version: v18.0 or latest
- Read Permissions: 
  - `instagram_business_account` (if using business account)
  - Or use `public_content` for public post access

#### 5. Configure Permissions
- Go to Tools → Graph API Explorer
- Select: Instagram Basic Display
- Permissions needed:
  - `instagram_business_content_read`
  - `user_profile` (for test account)
  - Or `public_content` (public posts)

#### 6. Create Test Account
- Settings → Roles → Test Users
- Create test account with Instagram Business Account linked
- Grant all permissions for testing

#### 7. Submit for Review
- Go to App Roles → Switch to Live Mode
- Or: Settings → App Roles → Submit for Live App
- Select feature: Instagram Graph API (oEmbed)
- Provide:
  - Use Case Description (see DATA_USE_STATEMENT.md)
  - Demo video (see DEMO_VIDEO_SCRIPT.md)
  - Test account credentials (see TEST_CREDENTIALS.md)

---

## Data Use Statement (to include in Meta submission)

**Application**: 3D Hiroba
**Feature**: Instagram Post oEmbed Data Retrieval
**Purpose**: Display Instagram community posts in gallery format

### Data Collected
- Instagram Post ID / Shortcode
- Post Author Name
- Post Caption/Description
- Post Thumbnail Image (OG image)
- Post Permalink
- Timestamp

### Data Usage
- **Primary**: Display in community gallery on homepage
- **Secondary**: Curation and content management by site administrator
- **Storage**: Vercel Blob (persistent image storage to prevent link expiry)
- **Cache**: Server-side cache, max 1 hour

### Data Retention
- Posts: Indefinite (stored in Firestore)
- Images: Indefinite (stored in Vercel Blob)
- Cache: 1 hour TTL

### Third-Party Access
- None. Data is not shared with third parties.
- Instagram API access is read-only for oEmbed data.

### User Rights
- Users can request data deletion via /contact page
- Admin can delete posts from gallery
- No data sold or transferred

---

## Submission Form Template

When submitting via Meta Dashboard, use the following template:

### "What is your app's primary purpose?"
```
3D Hiroba is a community gallery where users and parents share 
3D pen creations. Administrators curate featured posts from Instagram 
using the Instagram oEmbed API to display them in a unified gallery format.
```

### "Which Meta products or features does your app use?"
```
- Instagram Graph API (oEmbed endpoint)
- oEmbed API (for retrieving post metadata and thumbnail images)
```

### "Describe how your app uses Instagram data"
```
The app retrieves public Instagram post metadata (author name, caption, 
thumbnail image) via the oEmbed endpoint (graph.facebook.com/instagram_oembed) 
to display featured community creations in a gallery grid format. 

The thumbnail image is cached and stored in Vercel Blob to ensure persistent 
availability. Data is never sold, shared, or used for purposes other than 
gallery display and content curation.
```

### "Who has access to this data?"
```
- Site administrators only (for curation)
- End users see only public-facing gallery display
- No third-party integrations
```

### "What is your data retention policy?"
```
Posts are stored indefinitely in the application database as part of the 
community gallery. Images are stored in Vercel Blob cloud storage. 
Users can request deletion via the contact form (/contact page).
```

### "Have you reviewed Meta's data use terms?"
```
Yes. The application complies with:
- Instagram Platform Policy
- Facebook Data Use Restrictions
- Meta Platform Terms
```

---

## Timeline

| Step | Estimated Time | Status |
|------|----------------|--------|
| Create app & configure basics | 1 hour | ✅ Done |
| Create privacy policy page | 2-3 hours | ✅ Done |
| Create contact page | 1-2 hours | ✅ Done |
| Record demo video | 30-45 min | ⏳ Pending |
| Submit for review | 15 min | ⏳ Pending |
| Meta review process | 3-7 days | ⏳ Pending |

---

## Common Issues & Solutions

### "Feature not available for your app"
**Solution**: Ensure app is in Development mode initially. Request Live Mode only after approval.

### "Invalid App Domain"
**Solution**: Domain must match exactly. Use: `3d-hiroba.vercel.app` (not with http://)

### "Permission not approved"
**Solution**: Submit for review with proper use case description and demo video.

### "Test user not authorized"
**Solution**: 
1. Create test user in Meta Dashboard
2. Assign Instagram Business Account to test user
3. Grant permissions through Instagram API
4. Accept invitation in test user's Instagram account

---

## After Approval

Once Instagram Graph API is approved:

1. **Switch App to Live Mode**
   - Settings → Basic → Switch to Live Mode
   - This enables the app for production use

2. **Update Environment Variables**
   - FACEBOOK_APP_ID (already set)
   - FACEBOOK_APP_SECRET (already set - was rotated)

3. **Re-enable oEmbed Feature Code**
   - Re-enable `fetchInstagramOgImage()` in `/lib/og-image.ts`
   - Remove manual image upload workaround (or keep as fallback)
   - Test with real Instagram URLs

4. **Monitor API Usage**
   - Check Meta Dashboard → Insights
   - Monitor rate limits
   - Set up alerts if needed

5. **Maintain Documentation**
   - Keep privacy policy and contact pages updated
   - Document any data policy changes
   - Respond to user data requests promptly

---

## Helpful Links

- Meta Developer Dashboard: https://developers.facebook.com/
- Instagram Graph API Docs: https://developers.facebook.com/docs/instagram-api
- Instagram oEmbed Docs: https://developers.facebook.com/docs/instagram/oembed
- API Rate Limits: https://developers.facebook.com/docs/graph-api/overview/rate-limiting
- Data Use Policy: https://developers.facebook.com/policy/data-use/

---

**Last Updated**: 2026-04-27
**Status**: Ready for submission
**Next Step**: Record demo video and submit to Meta
