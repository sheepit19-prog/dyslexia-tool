# Chrome Web Store Publication Checklist

## Pre-Publication Requirements

### Week Before Submission

- [ ] **Create Developer Account** ($5 one-time fee)
  - Visit: https://chrome.google.com/webstore/devconsole
  - Sign in with Google account
  - Pay $5 registration fee
  - Complete developer profile

- [ ] **Generate PNG Icons**
  ```bash
  # Run the icon conversion script
  .\apps\extension\scripts\convert-icons.ps1
  
  # Or manually convert SVGs to PNG at sizes: 16, 48, 128, 256, 512
  ```
  - [ ] Verify icons exist in `icons/png/` folder
  - [ ] Update manifest.json to reference PNG icons

- [ ] **Host Privacy Policy**
  - [ ] Choose hosting method (GitHub Pages recommended)
  - [ ] Upload PRIVACY_POLICY.md (or convert to HTML)
  - [ ] Get public URL
  - [ ] Test URL in incognito window
  - [ ] Add URL to manifest.json if needed

- [ ] **Take Screenshots** (see SCREENSHOT_GUIDE.md)
  - [ ] Screenshot 1: Extension popup (400x600 or scaled)
  - [ ] Screenshot 2: Companion notification (1280x800)
  - [ ] Screenshot 3: Spelling suggestions (1280x800)
  - [ ] Screenshot 4: Reading features (1280x800)
  - [ ] Save to `docs/screenshots/` folder

---

## 1-2 Days Before Submission

- [ ] **Final Build & Testing**
  ```bash
  cd apps/extension
  npm run build
  npx vitest run
  ```
  - [ ] Build succeeds without errors
  - [ ] All tests pass
  - [ ] Test built extension locally:
    - Go to `chrome://extensions`
    - Enable "Developer mode"
    - Click "Load unpacked"
    - Select `dist/` folder
    - Test all features work

- [ ] **Update Version Number** (if needed)
  - [ ] Update `manifest.json` version to `1.0.0`
  - [ ] Update version in popup footer

- [ ] **Prepare Store Assets**
  - [ ] Icons: 16px, 48px, 128px PNG files
  - [ ] Screenshots: 3-4 images (1280x800 recommended)
  - [ ] Privacy policy URL ready
  - [ ] Store listing copy (see STORE_LISTING.md)

---

## Submission Day

### Step 1: Access Chrome Web Store Developer Dashboard

- [ ] Go to: https://chrome.google.com/webstore/devconsole
- [ ] Sign in with your developer account
- [ ] Click **"New Item"**

### Step 2: Upload Extension Package

- [ ] **Package your extension:**
  ```bash
  cd apps/extension/dist
  # Create a ZIP file with all contents
  # Include: manifest.json, all JS/CSS files, icons, HTML files
  ```

- [ ] **Upload ZIP file:**
  - [ ] Click "Choose file" or drag and drop
  - [ ] Wait for upload to complete
  - [ ] Verify no errors in package validation

### Step 3: Fill in Store Listing

#### Basic Information
- [ ] **App Name:** `Dyslexia Tool`
- [ ] **Short Description:** (132 characters max)
  ```
  Invisible reading & writing companion for dyslexic users. Get spelling help, text-to-speech, and more—without judgment.
  ```
- [ ] **Category:** Productivity
- [ ] **Secondary Category:** Accessibility

#### Detailed Description
- [ ] Copy description from `STORE_LISTING.md`
- [ ] Replace placeholder email with your contact
- [ ] Replace privacy policy URL placeholder
- [ ] Preview formatting looks correct

#### Images
- [ ] **Upload screenshots** (1-5 images):
  - [ ] Screenshot 1: Extension popup
  - [ ] Screenshot 2: Companion in action
  - [ ] Screenshot 3: Spelling suggestions
  - [ ] Screenshot 4: Reading features (optional)
  - [ ] Arrange in desired order

- [ ] **Upload promotional images** (optional):
  - [ ] Small promo tile (444x280)
  - [ ] Large promo tile (920x680)
  - [ ] Marquee image (1400x560)

#### Icons
- [ ] **Upload extension icon** (128x128 PNG)
  - This appears on the Chrome Web Store

### Step 4: Complete Data Safety Form

- [ ] Open **"Data safety"** tab
- [ ] Answer all questions using `DATA_SAFETY_FORM.md` as reference:

**Key Answers:**
- [ ] Data collected: **No**
- [ ] Data shared: **No**
- [ ] Data sold: **No**
- [ ] Microphone access: **Yes** (for voice notes, local only)
- [ ] Data encrypted: **N/A** (no transmission)
- [ ] Data deletable: **Yes** (automatic on uninstall)

- [ ] Review all answers for accuracy
- [ ] Confirm matches privacy policy

### Step 5: Privacy Policy

- [ ] Open **"Privacy"** tab
- [ ] Paste your **Privacy Policy URL**
- [ ] Verify URL is publicly accessible
- [ ] Confirm contact email is correct

### Step 6: Additional Settings

- [ ] **Visibility:** Public (or Private for testing)
- [ ] **Regions:** All countries (or select specific)
- [ ] **Age restriction:** None (all ages)

### Step 7: Review & Submit

- [ ] **Review checklist:**
  - [ ] Extension name is correct
  - [ ] Description is accurate and complete
  - [ ] All screenshots uploaded and ordered
  - [ ] Privacy policy URL works
  - [ ] Data safety form is complete
  - [ ] Contact information is correct
  - [ ] No typos or formatting issues

- [ ] **Preview store listing:**
  - [ ] Click "Preview" to see how it will appear
  - [ ] Check on desktop and mobile views
  - [ ] Verify all images display correctly

- [ ] **Submit for review:**
  - [ ] Click **"Submit for review"**
  - [ ] Note the submission confirmation number
  - [ ] Save/email yourself the submission details

---

## Post-Submission

### Review Process Timeline

| Stage | Duration | Status |
|-------|----------|--------|
| Initial Review | 1-3 business days | ⏳ Pending |
| Additional Review (if needed) | 3-7 business days | ⏳ Possible |
| Approval & Publication | 1-2 days after approval | ⏳ Pending |

### Monitor Status

- [ ] Check email daily for Google notifications
- [ ] Monitor developer dashboard for status updates
- [ ] Respond promptly to any review feedback

### Common Review Feedback & Fixes

**If rejected for:**

1. **Privacy Policy Issues:**
   - Fix: Ensure URL is accessible and matches data form

2. **Permission Justification:**
   - Fix: Add clearer explanations in store listing

3. **Misleading Description:**
   - Fix: Clarify what extension does/doesn't do

4. **Icon/Screenshot Quality:**
   - Fix: Upload higher resolution images

5. **Data Safety Form Inaccuracies:**
   - Fix: Ensure form matches actual behavior

### After Approval

- [ ] **Verify live listing:**
  - [ ] Search for extension in Chrome Web Store
  - [ ] Check all information displays correctly
  - [ ] Test "Add to Chrome" button works

- [ ] **Share your extension:**
  - [ ] Get your store URL: `https://chrome.google.com/webstore/detail/[extension-id]`
  - [ ] Share on social media
  - [ ] Post in relevant communities
  - [ ] Add to your portfolio/resume

- [ ] **Monitor metrics:**
  - [ ] Check dashboard for install counts
  - [ ] Read user reviews
  - [ ] Respond to feedback promptly

---

## Troubleshooting

### Build Issues Before Submission

```bash
# Clean rebuild
cd apps/extension
rm -rf dist
npm run build

# Run tests
npx vitest run

# Check for TypeScript errors
npx tsc --noEmit
```

### Icon Issues

```bash
# Regenerate icons
.\apps\extension\scripts\convert-icons.ps1

# Verify icon files exist
ls apps/extension/icons/png/
```

### ZIP Package Issues

- Ensure `dist/` folder contains:
  - `manifest.json`
  - All `.js` and `.css` files
  - `icons/` folder with PNG files
  - `popup/`, `options/`, `src/` folders as needed

---

## Post-Publication Tasks

### Week 1
- [ ] Monitor for any user reviews
- [ ] Check install numbers
- [ ] Respond to any feedback

### Month 1
- [ ] Review analytics (if implemented)
- [ ] Plan first update based on feedback
- [ ] Consider promotional activities

### Ongoing
- [ ] Update extension regularly
- [ ] Respond to user reviews
- [ ] Monitor for Chrome API deprecations
- [ ] Keep privacy policy updated

---

## Contact Information Template

For your store listing and privacy policy:

```
Developer: [Your Name/Organization]
Email: [your-email@example.com]
Website: [your-website.com]
Privacy Policy: [privacy-policy-url]
Support: [support-email or GitHub issues]
```

---

## Emergency Contacts

If your extension is rejected or suspended:

1. **Review the rejection email** from Google
2. **Address all issues** mentioned
3. **Reply to the email** with your fixes
4. **Resubmit** the corrected extension

For urgent issues:
- Chrome Web Store Developer Support: https://developer.chrome.com/docs/webstore/contact/

---

**Good luck with your submission! 🎉**
