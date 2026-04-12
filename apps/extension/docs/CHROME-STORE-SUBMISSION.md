# Chrome Web Store Submission Package

**Phase:** 03-debt-polish
**Version:** 1.0.0
**Generated:** 2026-04-12

---

## Manifest (Confirmed ✓)

- **Version:** 1.0.0
- **Description:** "Invisible companion for dyslexic users—proactive help without judgment"
- **manifest_version:** 3 (MV3)
- **Permissions:** activeTab, storage, host_permissions: <all_urls>

---

## Store Listing Copy

### Short Description (132 chars)

> Helps dyslexic readers with dyslexia-friendly fonts, spelling suggestions, text-to-speech, and reading rulers.

### Long Description (4,000 chars max)

**Dyslexia Tool** is your invisible reading companion — it notices when you might need help and offers support without judgment.

**What it does:**
- Applies dyslexia-friendly fonts (OpenDyslexic) to web pages so text is easier to read
- Offers gentle spelling suggestions when it detects possible misspellings — never judges or corrects automatically
- Reads text aloud with a single click using text-to-speech
- Adds a reading ruler overlay to help focus on one line at a time
- Works quietly in the background on every website you visit

**How it works:**
The companion runs invisibly as you browse. When you select text, it checks for spelling issues and offers alternatives. When you need reading help, just click the toolbar icon. Everything happens on your device — your data stays private.

**Features:**
- 📖 **Dyslexia-Friendly Fonts** — Applies OpenDyslexic font to page text with one click. Toggle on/off per site.
- ✏️ **Spelling Suggestions** — Gentle, non-judgmental spelling help. Falls back to fuzzy matching when a word is close to known terms.
- 🔊 **Text-to-Speech** — Select any text and hear it read aloud. Adjustable reading speed.
- 📏 **Reading Ruler** — Overlay a horizontal line to focus on one line at a time.
- ⚙️ **Fully Configurable** — Customize font size, spacing, colors, and sensitivity to match your needs.
- 📱 **Per-Site Settings** — Set different preferences for different websites.
- 🛡️ **Privacy-First** — All processing happens locally. No data sent anywhere. Ever.

**Why Dyslexia Tool?**
Built specifically for people with dyslexia. Not a generic accessibility tool — designed from the ground up with understanding and support at its core. The extension is unobtrusive, respectful of your privacy, and focused on making reading easier.

**Getting started:**
1. Click the toolbar icon to see the welcome tutorial
2. Visit any webpage and click "Try it now" to test the companion
3. Open the Options page to customize font, colors, sensitivity, and more

---

## Privacy Policy

**Status:** URL required — you must host a privacy policy page

**Minimum content the policy should include:**
- Extension does NOT collect, store, or transmit any personal data
- All data (settings, notes) stored locally in browser (Chrome Storage API / IndexedDB)
- Voice notes stored locally — audio never leaves your device
- No analytics or tracking
- No third-party services or APIs
- Extension has permission to access page content for font/style injection and reading assistance only

**Where to host:** GitHub Pages, Netlify, Vercel, or any static hosting. A single `privacy.html` page is sufficient.

---

## Screenshots (Required — 1280x800 PNG)

**What to capture:**
1. **Popup — Onboarding Step 1** — Fresh install, welcome screen
2. **Popup — Main view** — With notes panel or recording state
3. **Options Page — General Settings** — Font, spacing, theme controls
4. **Options Page — Companion Settings** — Sensitivity slider
5. **Sample webpage with companion active** — Wikipedia page with fonts applied

**How to capture:** Chrome DevTools → ⋮ menu → More tools → Capture screenshot (full size)

---

## Promotional Tiles (Required)

| Tile | Size | Description |
|------|------|-------------|
| Small | 440×280 | Feature highlight — show the font transformation or companion in action |
| Large | 920×430 | Full hero — app name, tagline, key features visual |

**Design guidance:**
- Use OpenDyslexic-style imagery or the app's color palette (#3B82F6 blue, #10B981 green accent)
- Keep text minimal — the icon/extension screenshot should be the hero
- Warm, supportive feel — not clinical or corporate

---

## Category Selection

- **Primary Category:** Accessibility
- **Secondary Category:** Accessibility Tools

---

## Submission Checklist

| Item | Status | Action Required |
|------|--------|----------------|
| Extension packaged (.zip) | ✅ Done | `apps/extension/dyslexia-tool-v1.0.zip` |
| Version bumped | ✅ Done | 1.0.0 |
| Icons uploaded | ✅ Done | 16, 48, 128 PNG |
| Screenshots (5 min) | ❌ Pending | Capture and upload |
| Promotional tiles | ❌ Pending | Design and upload |
| Privacy policy | ❌ Pending | Host page, provide URL |
| Short description | ✅ Done | See above |
| Long description | ✅ Done | See above |
| Category set | ❌ Pending | Select in dashboard |
| Developer account | ❌ Pending | chrome.google.com/webstore/devconsole |
| $5 one-time fee | ❌ Pending | Google account payment |

---

## Developer Dashboard

**URL:** https://chrome.google.com/webstore/devconsole

**Steps:**
1. Sign in with Google account
2. Pay $5 one-time developer fee (if first time)
3. Click "Add new item"
4. Upload `dyslexia-tool-v1.0.zip` from `apps/extension/`
5. Fill in store listing with the copy above
6. Upload screenshots and promotional tiles
7. Add privacy policy URL
8. Set category to Accessibility > Accessibility Tools
9. Submit for review

**Review time:** Typically 1-7 days. Chrome may ask for clarifications — respond promptly.
