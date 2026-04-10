---
phase: 01-critical-fixes
plan: 03
subsystem: notes-ui
tags: [chrome-extension, popup, indexeddb, audio-playback, voice-notes, html-audio-element]

# Dependency graph
requires:
  - phase: 01-critical-fixes/01
    provides: "Note-taking backend with auto-titles, monthly limit, GET_NOTE_AUDIO, DELETE_NOTE handlers"
provides:
  - "Scrollable note list UI with title, date, duration per note"
  - "Audio playback via direct IndexedDB access"
  - "Delete functionality with instant list refresh"
  - "Live recording timer display in popup"
  - "Monthly note count display (X/50 this month)"
affects: [popup, notes, audio]

# Tech tracking
tech-stack:
  added: []
  patterns: [direct-indexeddb-from-popup, popup-side-recording, recording-timer-display]

key-files:
  created:
    - apps/extension/src/mic-permission/index.html
    - apps/extension/src/mic-permission/index.ts
  modified:
    - apps/extension/src/popup/App.tsx
    - apps/extension/src/background/index.ts
    - apps/extension/src/shared/lib/companion-utils.ts
    - apps/extension/vite.config.ts

key-decisions:
  - "Direct IndexedDB access from popup instead of Chrome message passing for audio blobs — Chrome silently drops Blobs/ArrayBuffers in messages"
  - "Recording happens in popup (not offscreen) for reliable microphone permission handling"
  - "Live recording timer shows elapsed seconds during active recording"
  - "No delete confirmation dialog — single-click UX for casual voice memos"

patterns-established:
  - "Direct IndexedDB access from extension popup for binary data (Blobs survive IndexedDB round-trip)"
  - "Popup-side recording with MediaRecorder for reliable mic permission flow"

requirements-completed: [NOTES-01, NOTES-02]

# Metrics
duration: ~2h 30min
completed: 2026-04-10
---

# Phase 1 Plan 3: Note Listing & Playback UI Summary

**Scrollable voice note list with direct IndexedDB audio playback, popup-side recording, live timer, and delete — bypassing Chrome's message serialization limitations**

## Performance

- **Duration:** ~2h 30min
- **Started:** 2026-04-10T13:29:00Z
- **Completed:** 2026-04-10T18:09:13Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 6

## Accomplishments
- Scrollable note list displays title, date, duration for each voice note
- Audio playback works via direct IndexedDB blob retrieval (not Chrome messaging)
- Delete removes notes instantly with list refresh
- Recording happens directly in popup with live recording timer
- Monthly note count display (X/50 this month)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add note listing state and data fetching to popup** - `a58b360` (feat)
2. **Task 2: Build scrollable note list UI with playback controls** - `19c6cff` (feat)
3. **Task 3: Verify complete note-taking flow in browser** - Checkpoint approved by user

**Fix commits during implementation:**
- `afde09b` (fix) — Fix offscreen document URL and error handling
- `14203be` (fix) — Request mic permission from popup before offscreen recording
- `1854350` (fix) — Use dedicated tab for mic permission prompt
- `aa9a674` (fix) — Background owns recording state, popup queries it
- `b1578a0` (fix) — Record in visible tab instead of offscreen document
- `e95739e` (fix) — Record in popup, fix audio playback serialization
- `5bd46be` (fix) — Use base64 for audio transfer through Chrome messaging
- `c13a00b` (fix) — Use direct IndexedDB access for notes — eliminates audio serialization

## Files Created/Modified
- `apps/extension/src/popup/App.tsx` - Complete note listing UI with playback, delete, recording timer, direct IndexedDB access
- `apps/extension/src/background/index.ts` - Recording state management, mic permission flow
- `apps/extension/src/mic-permission/index.html` - Dedicated mic permission prompt page
- `apps/extension/src/mic-permission/index.ts` - Mic permission request handler
- `apps/extension/src/shared/lib/companion-utils.ts` - Fixed pre-existing duplicate object keys
- `apps/extension/vite.config.ts` - Added mic-permission page entry

## Decisions Made
- **Direct IndexedDB access instead of Chrome messaging for audio** — Chrome silently drops Blob/ArrayBuffer in `chrome.runtime.sendMessage`, making audio playback impossible through messages. Popup reads/writes notes directly from shared IndexedDB.
- **Recording in popup instead of offscreen document** — Multiple approaches were tried (offscreen, dedicated tab, service worker). Recording in popup with MediaRecorder gives most reliable mic permission handling.
- **Live recording timer** — Shows elapsed seconds during active recording for user feedback.
- **No delete confirmation** — Voice notes are casual memos; single-click delete keeps UX fast.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Chrome messaging silently drops audio Blobs**
- **Found during:** Task 2 (Building note list UI with playback controls)
- **Issue:** `chrome.runtime.sendMessage` silently drops Blob and ArrayBuffer objects. GET_NOTE_AUDIO response arrived without audioBlob.
- **Fix:** Tried base64 encoding, then ArrayBuffer conversion, finally switched to direct IndexedDB access from popup — Blobs survive IndexedDB round-trip.
- **Files modified:** apps/extension/src/popup/App.tsx, apps/extension/src/background/index.ts
- **Verification:** User verified audio playback works in browser
- **Committed in:** c13a00b

**2. [Rule 3 - Blocking] Offscreen document couldn't access microphone**
- **Found during:** Task 2 (Recording flow testing)
- **Issue:** Offscreen document approach failed for mic permissions — multiple issues with URL handling, permission flow, and audio serialization.
- **Fix:** Moved recording to popup with MediaRecorder API, giving direct access to getUserMedia.
- **Files modified:** apps/extension/src/popup/App.tsx, apps/extension/src/background/index.ts
- **Verification:** User verified recording works in popup
- **Committed in:** e95739e, b1578a0, c13a00b

**3. [Rule 1 - Bug] Pre-existing duplicate object keys in companion-utils.ts**
- **Found during:** Task 2 (Build was failing due to TypeScript TS1117 errors)
- **Issue:** Dictionary had duplicate keys (`owrk`, `hte`, `waht`, `too`) blocking build
- **Fix:** Deduplicated the object literal keys
- **Files modified:** apps/extension/src/shared/lib/companion-utils.ts
- **Verification:** Build passes
- **Committed in:** 19c6cff

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All auto-fixes necessary for functionality. Chrome's messaging limitations with binary data required significant architecture change (direct IndexedDB). Recording approach iterated through multiple solutions before finding working one.

## Issues Encountered
- Chrome extension messaging silently drops Blob/ArrayBuffer data — required architectural pivot from message-based audio retrieval to direct IndexedDB access
- Offscreen document approach for recording had multiple permission and audio pipeline issues — resolved by recording in popup directly

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Note-taking feature fully functional: record → list → play → delete
- Phase 1 (Critical Fixes) is now complete — all 3 plans done
- Ready for Phase 2: Options Page & Settings, or Phase 3: Technical Debt & Polish
- Existing tests still pass (26/29 — 3 pre-existing failures unrelated to this work)

---
*Phase: 01-critical-fixes*
*Completed: 2026-04-10*

## Self-Check: PASSED
- All 4 key files verified on disk (App.tsx, mic-permission/index.html, mic-permission/index.ts, background/index.ts)
- 3 core task commits verified in git log (a58b360, 19c6cff, c13a00b)
- 10 total 01-03 commits found in git log
