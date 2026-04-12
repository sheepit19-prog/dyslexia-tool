# Chrome Web Store Readiness Checklist — Phase 3

**Created:** 2026-04-12
**Phase:** 03-debt-polish

---

## Manifest Checklist

| Item | Status | Details |
|------|--------|---------|
| Version | ✅ PASS | `1.0.0` (bumped from 0.1.0) |
| Description | ✅ PASS | `"Invisible companion for dyslexic users—proactive help without judgment"` (under 132 chars) |
| manifest_version | ✅ PASS | 3 (MV3 required for Chrome Web Store) |

---

## Icons Checklist

| Icon | Path | Status |
|------|------|--------|
| 16x16 | `icons/png/icon16-16.png` | ✅ Present (430 bytes) |
| 48x48 | `icons/png/icon48-48.png` | ✅ Present (1,176 bytes) |
| 128x128 | `icons/png/icon128-128.png` | ✅ Present (3,577 bytes) |

---

## Permissions Checklist

| Permission | Status | Reason |
|------------|--------|--------|
| `activeTab` | ✅ Kept | Needed for tab access to apply fonts/messages |
| `storage` | ✅ Kept | Needed for settings and onboarding flag |
| `offscreen` | ✅ Removed | Removed in Phase 3 Plan 01 (not needed) |
| `host_permissions: <all_urls>` | ✅ Kept | Required for content script on all pages |

---

## Build Checklist

| Item | Status | Details |
|------|--------|---------|
| TypeScript compilation | ✅ PASS | `npx tsc --noEmit` — zero errors |
| Vite build | ✅ PASS | Clean build, no errors or warnings |
| Unit tests | ✅ PASS | 60/60 tests passing |

---

## Content Security Policy

- No `eval()` in extension pages
- No inline scripts detected
- Content scripts run with strict isolation (MV3)
- Font loading via web accessible resources (no CSP issues)

---

## Performance Baselines

Performance timing added to the following entry points. Baselines will be measured when the extension runs in a real browser:

| Entry Point | Timing Added | Log Location |
|-------------|-------------|-------------|
| Content script init | `performance.now()` at start, final log after detection | DevTools Console |
| Font injection | `performance.now()` at start, log after style appended | DevTools Console |
| Popup startup | `performance.now()` at useEffect start, log after loadNotes | DevTools Console |

Expected baseline targets (pending browser measurement):
- Content script fully initialized: < 50ms
- Font injection applied: < 10ms
- Popup loaded: < 100ms

---

## Store Submission Requirements (Pending)

The following items require human action and cannot be automated:

1. **Screenshots** — 1280x800 PNG screenshots of the popup, options page, and onboarding flow
2. **Promotional tiles** — 440x280 (small) and 920x430 (large) promotional images
3. **Privacy policy URL** — A hosted privacy policy page must be created and its URL provided
4. **Store listing copy** — Short description (max 132 chars), long description (max 4,000 chars)
5. **Categories** — Mark as "Accessibility > Accessibility Tools"

---

## Recommended Next Steps

1. Measure performance baselines in Chrome DevTools (Console tab)
2. Test the complete onboarding flow: fresh install → 3-step tour → "Try it now" → companion triggers
3. Create 1280x800 screenshots of all main views
4. Write and host privacy policy at a public URL
5. Prepare promotional tile images (440x280, 920x430)
6. Submit via [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
