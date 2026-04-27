# Demo Video Script for Meta App Review

**Application**: 3D Hiroba  
**Feature**: Instagram oEmbed Post Integration  
**Total Duration**: 5-7 minutes  
**Format**: Screen recording (desktop browser + admin console)  

---

## Video Sections Overview

| Section | Duration | Content |
|---------|----------|---------|
| Scene 1 | 30 sec | Homepage & Gallery Overview |
| Scene 2 | 1:30 min | Admin Console & Login |
| Scene 3 | 1:30 min | Instagram URL Registration (oEmbed) |
| Scene 4 | 1:00 min | Gallery Display with Featured Post |
| Scene 5 | 1:00 min | Privacy Policy & Data Protection |

**Total**: ~5-6 minutes

---

## Detailed Scripts

### SCENE 1: Homepage & Gallery Overview (0:00 - 0:30)

**Visual**: Record browser on 3d-hiroba.vercel.app

**Narration** (English/Japanese):
> "3D Hiroba is a community gallery where parents and children share their 3D pen creations. Our application features a curated collection of the best posts from Instagram, displayed in a unified gallery format."

**Actions**:
1. Load https://3d-hiroba.vercel.app
2. Scroll down to show gallery section
3. Show several card tiles with images and titles
4. Click on one card to show Instagram link (opens in new tab)

**Key Points to Show**:
- ✅ Clean, consistent gallery layout
- ✅ Multiple post cards in grid format
- ✅ Post thumbnails, titles, and captions visible
- ✅ Clicking opens original Instagram post

---

### SCENE 2: Admin Console & Login (0:30 - 2:00)

**Visual**: Navigate to admin panel

**Narration**:
> "The admin console allows curators to manage featured posts. Let me show you the registration interface where posts are added from Instagram."

**Actions**:
1. Navigate to https://3d-hiroba.vercel.app/admin
2. Log in with test credentials:
   - Email: (show email field)
   - Password: (type password, don't show in video)
3. Show dashboard with current posts list
4. Click "Add New Post" or "Instagram URL" button
5. Expand the form fields

**Key Points to Show**:
- ✅ Secure login (httpOnly cookie-based)
- ✅ Admin dashboard with post list
- ✅ Option to add posts from Instagram
- ✅ Forms with validation

**Do NOT Show**:
- ❌ Actual password in any form
- ❌ API keys or tokens in console
- ❌ Sensitive admin information

---

### SCENE 3: Instagram URL Registration with oEmbed (2:00 - 3:30)

**Visual**: Step through Instagram registration flow

**Narration**:
> "To add a featured post, the administrator simply pastes an Instagram URL. Our application uses the Instagram oEmbed API to automatically fetch the post metadata and thumbnail image."

**Setup** (do this beforehand):
- Have a public Instagram post URL ready: 
  - Example: `https://www.instagram.com/p/[POST_SHORTCODE]/`
- Ensure the oEmbed API is working in dev environment (or use manual upload as fallback)

**Actions**:
1. Click "Add Post" → "From Instagram URL"
2. Paste Instagram URL in the form field:
   ```
   https://www.instagram.com/p/CxxxxxYxxxxxZ/
   ```
3. Click "Fetch Details" or "Register" button
4. Show the automatic data retrieval:
   - Title field populated automatically
   - Caption/description loaded
   - Thumbnail image fetched and displayed
5. Click "Save" or "Publish"
6. Show success message

**Key Points to Show**:
- ✅ Simple URL paste (no scraping, no user config)
- ✅ Automatic metadata retrieval via oEmbed API
- ✅ Image thumbnail displayed (from Vercel Blob storage)
- ✅ Validation and error handling
- ✅ Confirmation of successful registration

**If oEmbed fails** (fallback demo):
- Show manual image upload as alternative
- Upload image file from computer
- Show same result: post appears in gallery

**API Details to Highlight** (in voiceover):
> "Behind the scenes, we're using the Instagram Graph API's oEmbed endpoint. This secure, read-only API retrieves public post metadata without requiring user authentication or sharing passwords. The thumbnail image is stored in our secure cloud storage to prevent link expiry."

---

### SCENE 4: Gallery Display with Featured Post (3:30 - 4:30)

**Visual**: Return to homepage and show newly added post

**Narration**:
> "Once registered, the post appears immediately in the community gallery. All posts are displayed in a consistent, unified format - whether they come from Instagram or manual uploads. Users can click any post to visit the original on Instagram."

**Actions**:
1. Navigate back to https://3d-hiroba.vercel.app
2. Scroll to gallery section (may need to refresh to see new post)
3. Locate the newly added post in the grid
4. Show that it matches the design of other posts
5. Click on the post card
6. Show that it links to the original Instagram post
7. Go back to the gallery

**Key Points to Show**:
- ✅ New post appears in gallery immediately
- ✅ Consistent card design and layout
- ✅ Proper image aspect ratio (square/3:2)
- ✅ Post metadata (author, title, caption) visible
- ✅ Click-to-Instagram functionality works

**Optional**: Show mobile view by resizing browser window

---

### SCENE 5: Privacy Policy & Data Protection (4:30 - 5:30)

**Visual**: Navigate to privacy pages

**Narration**:
> "3D Hiroba takes user privacy and data protection seriously. Let me show you our privacy policy and contact page where users can request data deletion or ask questions about their information."

**Actions**:
1. Navigate to https://3d-hiroba.vercel.app/privacy
2. Show:
   - Language toggle (click "English" to show bilingual support)
   - Scroll through privacy policy sections:
     - Data Collection
     - Data Usage
     - Storage & Security
     - Third-Party Access (none)
     - User Rights
3. Navigate to https://3d-hiroba.vercel.app/contact
4. Show contact form fields:
   - Name, Email, Subject (dropdown), Message
5. Fill in a sample question about privacy:
   - Name: "Test User"
   - Email: "test@example.com"
   - Subject: "Privacy Question"
   - Message: "How long is my data stored?"
6. Click "Send"
7. Show success message

**Key Points to Show**:
- ✅ Comprehensive privacy policy
- ✅ Bilingual support (JP/EN)
- ✅ Clear explanation of data usage
- ✅ "We don't share data with third parties"
- ✅ Contact form for user inquiries
- ✅ Direct email contact available
- ✅ Data deletion request process documented

**Privacy Policy Sections to Highlight**:
- "We only collect public Instagram post metadata"
- "Images are stored securely in Vercel Blob"
- "Data is never sold or shared"
- "Users can request deletion anytime"
- "Contact: help@scrib3dpen.jp"

---

## Recording Tips

### Technical Setup
- **Browser**: Chrome/Safari (latest)
- **Resolution**: 1920x1080 (Full HD)
- **Audio**: Clear, professional microphone
- **Editor**: iMovie, Premiere Pro, or Loom (screen recording + voiceover)

### Recording Best Practices
1. **Test URLs First**: Ensure all links work and pages load
2. **Use Test Account**: Pre-create test posts/accounts
3. **Speak Clearly**: Explain each step in simple language
4. **Show Interactions**: Slowly click/scroll so actions are visible
5. **No Rush**: Use natural pauses between scenes
6. **Error Prevention**: Have backups ready if API fails
7. **Privacy**: Don't show real secrets, passwords, or personal data

### Post-Production
- Add intro/outro music (optional)
- Add captions for key steps
- Ensure audio is clear (no background noise)
- Add timestamps or section markers
- Export as MP4 (h.264 codec)

---

## Voiceover Script (Full)

### [SCENE 1]
*"3D Hiroba is a community gallery where parents and children share their 3D pen creations. Our application features a curated collection of the best posts from Instagram, displayed in a unified gallery format. Each card shows a thumbnail image, post title, author name, and a link to the original Instagram post."*

### [SCENE 2]
*"The admin console allows authorized curators to manage featured posts. Access is controlled with secure authentication using httpOnly cookies. From the dashboard, administrators can view all published posts and add new ones."*

### [SCENE 3]
*"To add a featured post, the administrator simply pastes an Instagram URL into the registration form. Our application uses the official Instagram Graph API oEmbed endpoint to automatically fetch the post metadata and thumbnail image. This is a secure, read-only API that requires no user authentication. The thumbnail image is then stored in our cloud storage to ensure it remains available permanently."*

### [SCENE 4]
*"Once registered, the post appears immediately in the community gallery. All posts - whether from Instagram or manually uploaded - are displayed in a consistent, unified format. This creates a professional, cohesive gallery experience. Users can click any post to view the original on Instagram."*

### [SCENE 5]
*"3D Hiroba prioritizes user privacy and data protection. Our privacy policy, available in both Japanese and English, clearly explains how we collect, use, and protect data. We collect only public Instagram post metadata. We never sell or share data with third parties. Users can contact us anytime to request deletion or ask questions about their data. Contact form and email address are available on our website."*

---

## Alternative Voiceovers

### Japanese Version (日本語)

#### [SCENE 1]
*「3Dひろばは、親子が3Dペン作品をシェアするコミュニティギャラリーです。Instagramから厳選された投稿を統一されたギャラリー形式で表示しています。各カードには、サムネイル画像、投稿タイトル、著者名が表示され、元のInstagram投稿へのリンクが付いています。」*

#### [SCENE 3]
*「Instagramから投稿を追加するには、URLを登録フォームに貼り付けるだけです。当アプリケーションはInstagram Graph APIのoEmbedエンドポイントを使用して、投稿のメタデータとサムネイル画像を自動取得します。これは安全な読み取り専用APIで、ユーザー認証を必要としません。サムネイル画像はクラウドストレージに保存され、永続的に利用可能です。」*

#### [SCENE 5]
*「3Dひろばはユーザーのプライバシーとデータ保護を重視しています。日本語と英語で利用可能なプライバシーポリシーでは、データの収集、使用、保護方法を明確に説明しています。公開されているInstagram投稿メタデータのみを収集します。データは第三者と共有しません。ユーザーはいつでもお問い合わせフォームまたはメールでデータ削除をリクエストできます。」*

---

## Quality Checklist

Before submitting to Meta:

- [ ] Video is 5-7 minutes long
- [ ] All steps are clearly visible (no blurry screens)
- [ ] Audio is clear and professional
- [ ] No passwords or API keys shown
- [ ] All links work and pages load correctly
- [ ] Privacy policy is clearly shown
- [ ] Contact form submission works
- [ ] Gallery displays posts correctly
- [ ] Instagram links open in new tab
- [ ] Mobile responsiveness shown (optional)
- [ ] Video format: MP4 (h.264)
- [ ] Resolution: 1920x1080 or higher

---

## Submission Details

**Where to Submit**:
- Meta App Review Dashboard
- Under App Settings → Submission

**Video Upload**:
- Format: MP4
- Max size: 500MB (typically not an issue)
- Duration: 5-7 minutes

**Accompanying Text**:
- Title: "Instagram oEmbed Integration Demo"
- Description: See META_DATA_USE_STATEMENT.txt

---

**Document Version**: 1.0  
**Created**: 2026-04-27  
**Last Updated**: 2026-04-27
