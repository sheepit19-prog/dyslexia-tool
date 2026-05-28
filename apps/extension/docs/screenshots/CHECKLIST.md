# 📸 Screenshot Checklist - Quick Reference

## Your Mission: Capture 4 Screenshots for Chrome Web Store

**Save location:** `apps/extension/docs/screenshots/`

---

## ✅ Screenshot 1: Extension Popup
**File:** `screenshot-1-popup.png`

### Steps:
```
1. Open Chrome → chrome://extensions/
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select: C:\AI_Projects\dyslexia_tool_lean_mvp\apps\extension\dist
5. Open google.com in new tab
6. Click Dyslexia Tool icon in toolbar (puzzle piece → pin it)
7. Popup appears showing all features
```

### Capture:
```
Press F12 → Ctrl+Shift+P → type "screenshot" → Enter
Select "Capture area screenshot" → Drag to select popup
Save as: screenshot-1-popup.png
```

**Expected size:** ~400x600px (popup native size)

---

## ✅ Screenshot 2: Companion Notification
**File:** `screenshot-2-companion.png`

### Steps:
```
1. Open gmail.com (or any email compose)
2. Click "Compose" to start new email
3. Type: "Hello I am writing"
4. Press Backspace 3+ times rapidly
5. Wait 1-2 seconds for notification
```

### What you should see:
```
┌────────────────────────────────┐
│  Gmail Compose Window          │
│                                │
│  To:                           │
│  Subject:                      │
│                                │
│  Hello I am writi▌              │
│                    ┌──────────┐│
│                    │ Need help││
│                    │ with     ││
│                    │ spelling?││
│                    │          ││
│                    │ [Show]   ││
│                    │ [Not now]││
│                    └──────────┘│
└────────────────────────────────┘
        ↑ Notification appears here
```

### Capture:
```
Press F12 → Ctrl+Shift+P → type "screenshot" → Enter
Select "Capture full size screenshot"
Save as: screenshot-2-companion.png
```

**Expected size:** 1280x800px

---

## ✅ Screenshot 3: Spelling Suggestions
**File:** `screenshot-3-suggestions.png`

### Steps:
```
1. Keep Gmail compose open
2. Type: "becuase" (intentionally misspelled)
3. Press Backspace 3+ times
4. Click "Show suggestions" on notification
```

### What you should see:
```
┌────────────────────────────────┐
│  Gmail Compose Window          │
│                                │
│  becuase▌                      │
│  ┌─────────────────────────┐  │
│  │ Suggestions for "becuase"│  │
│  │                         │  │
│  │ ✓ because               │  │
│  │   becase                │  │
│  │   bekauz                │  │
│  │                         │  │
│  │ [Replace] [Dismiss]     │  │
│  └─────────────────────────┘  │
└────────────────────────────────┘
```

### Capture:
```
Press F12 → Ctrl+Shift+P → type "screenshot" → Enter
Select "Capture full size screenshot"
Save as: screenshot-3-suggestions.png
```

**Expected size:** 1280x800px

---

## ✅ Screenshot 4: Reading Features
**File:** `screenshot-4-reading.png`

### Steps:
```
1. Open bbc.com/news or cnn.com (news article)
2. Click Dyslexia Tool icon
3. Toggle "Reading Ruler" ON
4. Move mouse up and down on the page
5. Blue highlight line should follow cursor
```

### What you should see:
```
┌────────────────────────────────┐
│  BBC News Article              │
│                                │
│  Headline text here            │
│                                │
│  ════════════════════════════  ← Blue ruler line
│  Paragraph text with the       │
│  blue highlight following      │
│  your mouse cursor             │
│                                │
│  More text below...            │
└────────────────────────────────┘
```

### Capture:
```
Press F12 → Ctrl+Shift+P → type "screenshot" → Enter
Select "Capture full size screenshot"
Save as: screenshot-4-reading.png
```

**Expected size:** 1280x800px

---

## 📋 Final Checklist

Before uploading to Chrome Web Store:

- [ ] All 4 screenshots captured
- [ ] Saved in: `apps/extension/docs/screenshots/`
- [ ] File names are correct (screenshot-1, screenshot-2, etc.)
- [ ] Text is readable (not blurry)
- [ ] No personal info visible (emails, names, etc.)
- [ ] All screenshots are at least 1280x800px (except popup which is smaller)

---

## 🎨 Optional: Add Annotations

Use **Canva** (free) or **Figma** (free) to add:

1. **Arrows** pointing to key features
2. **Callouts** with brief text:
   - "One-click accessibility"
   - "Gentle suggestions, never intrusive"
   - "Smart spelling corrections"
   - "Stay focused while reading"

---

## 🚀 After Screenshots

**Next steps:**
1. ✅ PNG Icons - **DONE**
2. ✅ Privacy Policy - **DONE** (GitHub Pages enabled)
3. ✅ Screenshots - **YOU'RE DOING THIS NOW**
4. ⏳ Create Chrome Developer Account ($5)
5. ⏳ Submit to Chrome Web Store

---

## 💡 Pro Tips

**If extension icon not showing:**
- Reload: `chrome://extensions/` → Click refresh icon on Dyslexia Tool
- Pin it: Click puzzle icon → Pin to toolbar

**If companion not appearing:**
- Enable Companion Mode in popup first
- Try Google Docs if Gmail doesn't work
- Check console: `F12` → Console tab → Look for errors

**If reading ruler not visible:**
- Make sure toggle is ON (blue when enabled)
- Try on text-heavy page (news article, Wikipedia)
- Move mouse slowly up/down

---

**Good luck! You've got this! 🎉**
