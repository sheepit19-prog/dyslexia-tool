# Quick Screenshot Guide

## What You Need to Capture (4 Screenshots)

### ✅ Screenshot 1: Extension Popup
**Size:** 400x600 (native popup size) or 1280x800

**How to capture:**
1. Open any website (google.com)
2. Click Dyslexia Tool icon in toolbar
3. Popup appears showing all toggles
4. Press `F12` → `Ctrl+Shift+P` → type "screenshot"
5. Select "Capture area screenshot"
6. Select the popup window
7. Save as: `screenshot-1-popup.png`

**What should be visible:**
- ✅ Dyslexia Font toggle
- ✅ Read Aloud button
- ✅ Reading Ruler toggle
- ✅ Companion Mode toggle
- ✅ Voice Note button
- ✅ Settings gear icon

---

### ✅ Screenshot 2: Companion Notification
**Size:** 1280x800

**How to capture:**
1. Open Gmail → Click "Compose"
2. Type a few words
3. Press Backspace 3+ times rapidly
4. Notification appears top-right: "Need help with spelling?"
5. Press `F12` → `Ctrl+Shift+P` → "Capture full size screenshot"
6. Save as: `screenshot-2-companion.png`

**What should be visible:**
- ✅ Gmail compose window
- ✅ Notification bubble in top-right corner
- ✅ "Show suggestions" and "Not now" buttons

---

### ✅ Screenshot 3: Spelling Suggestions
**Size:** 1280x800

**How to capture:**
1. In Gmail compose, type "becuase" (misspelled)
2. Trigger companion (backspace 3x)
3. Click "Show suggestions"
4. Panel appears with corrections
5. Capture the panel
6. Save as: `screenshot-3-suggestions.png`

**What should be visible:**
- ✅ Suggestions panel
- ✅ "because" as top suggestion
- ✅ Other alternatives (if any)
- ✅ Replace button

---

### ✅ Screenshot 4: Reading Features
**Size:** 1280x800

**How to capture:**
1. Open a news article (bbc.com/news or cnn.com)
2. Click Dyslexia Tool icon
3. Enable "Reading Ruler" toggle
4. Move mouse up/down to show blue highlight line
5. Press `F12` → "Capture full size screenshot"
6. Save as: `screenshot-4-reading.png`

**What should be visible:**
- ✅ Article text
- ✅ Blue highlight line across current line
- ✅ Dyslexia-friendly font applied (if enabled)

---

## Fastest Method (10 minutes)

### Using Chrome DevTools:

1. **Load extension:**
   ```
   chrome://extensions/ → Developer mode → Load unpacked → Select dist/ folder
   ```

2. **For each screenshot:**
   - Navigate to the required page
   - Trigger the feature
   - Press `F12`
   - Press `Ctrl+Shift+P`
   - Type "screenshot"
   - Press Enter

3. **Save files to:**
   ```
   apps/extension/docs/screenshots/
   ```

---

## Alternative: Automated Screenshot Tool

If you prefer an automated approach, install:

**Screenshot Extension:**
- Name: "GoFullPage - Full Page Screen Capture"
- URL: https://chrome.google.com/webstore/detail/gofullpage-full-page-scre/fdpohaocaechififmbbbbbknoalclacl
- Free and easy to use

**Or use Nimbus Screenshot:**
- Name: "Nimbus Screenshot & Screen Video Recorder"
- URL: https://chrome.google.com/webstore/detail/nimbus-screenshot-screen/bpconcjcammlapcglcnn谈及pejfk
- Has annotation tools built-in

---

## After Capturing

1. **Review all 4 screenshots** - ensure they're clear and readable
2. **Optional: Add annotations** using Canva or Figma:
   - Arrows pointing to key features
   - Brief callouts (e.g., "Smart spelling help")
3. **Upload to Chrome Web Store** during submission

---

## Troubleshooting

**Extension icon not showing?**
- Reload extension: `chrome://extensions/` → Refresh icon
- Pin to toolbar: Click puzzle icon → Pin Dyslexia Tool

**Companion not appearing?**
- Make sure Companion Mode is enabled in popup
- Try typing in a different text field (Google Docs, etc.)
- Check browser console for errors (`F12` → Console tab)

**Reading ruler not visible?**
- Enable it from the popup
- Move mouse up/down on the page
- Try on a text-heavy page (news article)

---

**Ready to start?**

Run the automated script:
```powershell
.\apps\extension\scripts\capture-screenshots.ps1
```

This will guide you through each step interactively!
