# Meta App Review - Test Credentials & Instructions

**Application**: 3D Hiroba  
**App ID**: 26224957440539490  
**Review Status**: Pending oEmbed API Access  

---

## Test Environment Access

### Website Credentials
- **Production URL**: https://3d-hiroba.vercel.app
- **Admin Console**: https://3d-hiroba.vercel.app/admin
- **Test Account Email**: (provided upon request)
- **Test Account Password**: (provided via secure channel)

### Important Notes
- ⚠️ Do NOT share test credentials publicly
- ⚠️ Credentials are reset after each test cycle
- ⚠️ Test account permissions: Admin-only access
- ✅ All test data can be modified or deleted
- ✅ Production data is separate and protected

---

## Test Account Setup

### Admin Account
- **Username/Email**: test-admin@3d-hiroba.vercel.app
- **Password**: [Provided separately via Meta Dashboard]
- **Role**: Administrator
- **Permissions**: 
  - View all posts
  - Add new posts from Instagram
  - Edit post metadata
  - Delete posts
  - Manage gallery

### Test Instagram Business Account
- **Username**: @3d_hiroba_test (or similar)
- **Account Type**: Business
- **Setup**: Linked to test Facebook app
- **Sample Posts**: Multiple public posts available for testing

---

## Verification Scenarios

Test the following scenarios in order:

### ✅ Scenario 1: Homepage & Gallery Visibility

**Objective**: Verify the gallery displays correctly

**Steps**:
1. Navigate to https://3d-hiroba.vercel.app
2. Scroll to the gallery section
3. Verify:
   - ✅ Multiple post cards visible
   - ✅ Thumbnail images display correctly
   - ✅ Post titles and author names shown
   - ✅ Cards are responsive (try resizing browser)
   - ✅ Clicking a post opens Instagram link

**Expected Result**: Gallery loads correctly with all elements visible

**Troubleshooting**:
- If images don't load: Check Vercel Blob connectivity
- If gallery is empty: Ensure test posts have been registered
- If layout breaks: Clear cache (Ctrl+Shift+Del)

---

### ✅ Scenario 2: Admin Login & Dashboard

**Objective**: Verify admin authentication works

**Steps**:
1. Navigate to https://3d-hiroba.vercel.app/admin
2. Enter test credentials:
   - Email: test-admin@3d-hiroba.vercel.app
   - Password: [as provided]
3. Click "Log In"
4. Verify:
   - ✅ Login succeeds without errors
   - ✅ Dashboard loads
   - ✅ Post list is visible
   - ✅ "Add New Post" button is available
   - ✅ Logout button appears in top-right

**Expected Result**: Successfully logged in with full admin access

**Troubleshooting**:
- If login fails: Check email/password spelling
- If page doesn't load: Check network connection
- If redirected to homepage: Session may have expired; try again

---

### ✅ Scenario 3: Instagram URL Registration with oEmbed

**Objective**: Verify oEmbed API integration works

**Setup** (prepare these Instagram URLs beforehand):
- Public Instagram post URL (example format):
  - `https://www.instagram.com/p/ABC1234567abcdefg/`
- Test with multiple post types (photo, carousel, video)

**Steps**:
1. From admin dashboard, click "Add New Post" → "From Instagram URL"
2. Paste Instagram URL in the form:
   ```
   https://www.instagram.com/p/[SHORTCODE]/
   ```
3. Click "Fetch Details" or "Fetch from Instagram"
4. Wait for API response (should take 1-2 seconds)
5. Verify:
   - ✅ Post metadata appears (title, author, caption)
   - ✅ Thumbnail image loads (from oEmbed API)
   - ✅ Image preview is visible
   - ✅ Form fields are auto-populated
   - ✅ No API errors in console
6. Click "Save" or "Publish"
7. Verify:
   - ✅ Success message appears
   - ✅ Post is added to dashboard list
   - ✅ Post appears in homepage gallery immediately

**Expected Result**: oEmbed API successfully retrieves post metadata

**Troubleshooting**:
- If "og_not_found" error: Instagram URL format may be incorrect
- If timeout: oEmbed API may be rate-limited; wait and retry
- If image doesn't load: Vercel Blob storage issue; check connectivity
- If no auto-populate: Check FACEBOOK_APP_ID/SECRET environment variables

**API Details** (for debugging):
- Endpoint: `https://graph.facebook.com/v18.0/instagram_oembed`
- Method: GET with App Token
- Required params: `url` (Instagram post URL), `access_token`
- Response: Post metadata including `thumbnail_url`

---

### ✅ Scenario 4: Manual Image Upload (Fallback)

**Objective**: Verify fallback when oEmbed fails

**Steps**:
1. From admin dashboard, click "Add New Post" → "Manual Upload"
2. Upload a JPEG/PNG image (any 3D art photo)
   - Recommended size: 1080x1080px or similar
   - Max size: 30MB
3. Fill in form fields:
   - Title: "Test Post Title"
   - Author: "Test Author"
   - Caption: "Test caption text"
4. Click "Save" or "Publish"
5. Verify:
   - ✅ Image uploads successfully
   - ✅ Success message appears
   - ✅ Post appears in gallery
   - ✅ Image displays with correct aspect ratio

**Expected Result**: Manual upload works as fallback

**Troubleshooting**:
- If upload fails: Check file size and format
- If image doesn't display: Check Vercel Blob storage
- If form validation fails: Ensure all required fields filled

---

### ✅ Scenario 5: Gallery Display & User Interaction

**Objective**: Verify gallery displays all posts correctly

**Steps**:
1. Navigate to https://3d-hiroba.vercel.app
2. Look for both oEmbed and manually uploaded posts
3. Verify:
   - ✅ All post types display in same card format
   - ✅ Thumbnail images are visible and square-ish aspect ratio
   - ✅ Post titles and author names shown
   - ✅ Cards are clickable
4. Click on a post card
5. Verify:
   - ✅ Links to original Instagram post (for oEmbed posts)
   - ✅ Link opens in new tab
   - ✅ Original post visible on Instagram
6. For manual upload posts:
   - ✅ Images display correctly
   - ✅ No broken images or 404 errors

**Expected Result**: Gallery is visually consistent across all post sources

**Troubleshooting**:
- If cards have different layouts: CSS may have issues; check browser console
- If images don't load: Check Vercel Blob connectivity
- If links are broken: Check post permalink or URL format

---

### ✅ Scenario 6: Privacy Policy & Contact Form

**Objective**: Verify privacy documentation and user contact flow

**Steps**:
1. Navigate to https://3d-hiroba.vercel.app/privacy
2. Verify:
   - ✅ Privacy policy displays in Japanese
   - ✅ All sections visible (data collection, usage, storage, etc.)
   - ✅ Contact link visible at bottom
3. Click language toggle (if available) to view English version
4. Verify:
   - ✅ English version displays correctly
   - ✅ Same content structure
   - ✅ Professional tone and complete information
5. Navigate to https://3d-hiroba.vercel.app/contact
6. Fill in contact form:
   - Name: "Meta Reviewer"
   - Email: "reviewer@meta.example.com"
   - Subject: "Privacy Question"
   - Message: "Testing contact form for data deletion request"
7. Click "Send"
8. Verify:
   - ✅ Form validates (check for empty field errors)
   - ✅ Success message appears
   - ✅ Form clears after submission
9. Return to homepage and check footer
10. Verify:
    - ✅ "Privacy Policy" link in footer (points to /privacy)
    - ✅ "Contact" link in footer (points to /contact)
    - ✅ Links work correctly

**Expected Result**: Privacy documentation is complete and user contact flow works

**Troubleshooting**:
- If privacy page shows 404: Check file exists at `/app/privacy/page.tsx`
- If contact form doesn't submit: Check /api/contact endpoint
- If footer links missing: Ensure SiteFooter component updated
- If language toggle doesn't work: Check URL query parameter handling

---

### ✅ Scenario 7: Mobile Responsiveness

**Objective**: Verify application works on mobile devices

**Steps**:
1. Open https://3d-hiroba.vercel.app on mobile device (iOS Safari or Android Chrome)
   - Or: Use Chrome DevTools → Toggle Device Toolbar (F12)
2. Verify:
   - ✅ Homepage loads correctly
   - ✅ Gallery cards stack vertically (single column)
   - ✅ Images display correctly
   - ✅ Text is readable (font size appropriate)
3. Navigate to admin console on mobile
4. Verify:
   - ✅ Login form is usable
   - ✅ Dashboard is readable
   - ✅ Forms are touch-friendly
5. Test gallery on tablet (landscape)
6. Verify:
   - ✅ 2-3 column layout on tablet
   - ✅ Images scale appropriately

**Expected Result**: All features work correctly on mobile devices

**Troubleshooting**:
- If layout breaks: Check CSS media queries
- If images are too large: Check aspect ratio constraints
- If form is hard to use: Check input field sizes

---

## Test Data Management

### Sample Instagram URLs (for testing)
```
Instagram Post Formats:
- Photo post: https://www.instagram.com/p/[SHORTCODE]/
- Video post: https://www.instagram.com/p/[SHORTCODE]/
- Carousel: https://www.instagram.com/p/[SHORTCODE]/

Example (public test account):
- @3d_hiroba_test
- Use any public post from this account
```

### Resetting Test Data
- Delete posts via admin dashboard (no permanent deletion tool needed)
- Contact admin to reset test environment
- All changes are temporary (production not affected)

### Screenshot Locations
- Gallery: https://3d-hiroba.vercel.app (screenshot homepage)
- Admin console: https://3d-hiroba.vercel.app/admin (logged in)
- Privacy: https://3d-hiroba.vercel.app/privacy

---

## API & Technical Details (for debugging)

### Environment Variables (used by app)
```
FACEBOOK_APP_ID=26224957440539490
FACEBOOK_APP_SECRET=[not shown in docs]
BLOB_READ_WRITE_TOKEN=[Vercel Blob token]
```

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/picks` | GET | Fetch all posts |
| `/api/admin/picks` | POST | Register new post (with oEmbed fetch) |
| `/api/admin/picks` | PATCH | Update post metadata |
| `/api/admin/picks` | DELETE | Delete post |
| `/api/admin/upload` | POST | Upload image (fallback) |
| `/api/contact` | POST | Submit contact form |

### Browser Console
- Open DevTools (F12)
- Check Console tab for errors
- Look for logs starting with `[picks]` or `[upload]`
- Example successful log: `[picks] image_stored blob_url=https://...`

---

## Reporting Issues

If you encounter any issues during testing:

1. **Document the Problem**:
   - Screenshot or video of error
   - Steps to reproduce
   - Browser and OS version
   - Network conditions (if relevant)

2. **Check Error Messages**:
   - Browser console errors
   - API response errors
   - HTTP status codes

3. **Contact Support**:
   - Email: help@scrib3dpen.jp
   - Include: App ID, error details, reproduction steps

---

## Approval Process After Testing

Once all scenarios pass:

1. ✅ Reviewer confirms functionality
2. ✅ Reviewer verifies privacy compliance
3. ✅ Data use statement is accepted
4. ✅ Demo video is reviewed
5. ✅ App transitions to "Live" mode
6. ✅ Instagram oEmbed API access granted
7. ✅ Production environment enabled

### Timeline
- Meta review: 3-7 business days
- Notification: Email to app contact
- Access activation: Within 24 hours of approval

---

## Frequently Asked Questions

**Q: Can I modify the test data?**  
A: Yes, you have full admin access. Changes are temporary and don't affect production.

**Q: What if oEmbed API fails?**  
A: The app falls back to manual image upload. Both methods produce the same gallery display.

**Q: Is the test environment production data?**  
A: No, test environment is completely separate from production. All test data is non-critical.

**Q: How long does app review take?**  
A: Typically 3-7 business days, but may vary. Meta will email updates.

**Q: Can I re-test after changes?**  
A: Yes, we can reset the test environment for another review cycle.

**Q: What if I find a bug?**  
A: Document it and contact help@scrib3dpen.jp with details.

---

## Contact Information

**For Technical Issues**:
- Email: help@scrib3dpen.jp
- Response time: Within 24 hours

**For Meta-Related Questions**:
- Meta Developer Support: https://developers.facebook.com/support
- App Dashboard: https://developers.facebook.com/apps/26224957440539490

**For Privacy Concerns**:
- Privacy Policy: https://3d-hiroba.vercel.app/privacy
- Contact Form: https://3d-hiroba.vercel.app/contact

---

**Document Version**: 1.0  
**Created**: 2026-04-27  
**Last Updated**: 2026-04-27  
**Status**: Ready for Meta Reviewer
