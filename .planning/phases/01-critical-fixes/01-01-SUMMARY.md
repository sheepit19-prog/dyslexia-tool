---
phase: 01-critical-fixes
plan: 01
subsystem: notes
tags: [indexeddb, dexie, offscreen, messaging, audio-recording]

# Dependency graph
requires: []
provides:
  - Wall-clock duration calculation for voice notes
  - Monthly-filtered note count for 50-note limit
  - getNoteAudio function for audio blob retrieval
  - Auto-generated note titles
  - Cleaned message types (dead types removed)
affects: [popup-ui, note-playback]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "recordingStartTime pattern: Date.now() delta for MediaRecorder duration"
    - "Monthly filter: Dexie where().aboveOrEqual(startOfMonth) for calendar-month counts"

key-files:
  created: []
  modified:
    - apps/extension/src/offscreen/index.ts
    - apps/extension/src/shared/types/messages.ts
    - apps/extension/src/background/storage/index.ts
    - apps/extension/src/background/index.ts

key-decisions:
  - "Used getNotesCount (monthly) for auto-title numbering so Voice Note # resets each month with the limit"
  - "Removed NOTE_SAVE entirely — only STOP_RECORDING→addNote path exists"
  - "getNoteAudio returns Blob directly from IndexedDB for playback without full note hydration"

patterns-established:
  - "Duration: Date.now() at start/stop, not blob.size heuristic"
  - "Monthly limit: filter createdAt by startOfMonth, not total count"

requirements-completed: [NOTES-03, NOTES-04, NOTES-05, NOTES-07, NOTES-06]

# Metrics
duration: 10min
completed: 2026-04-10
---

# Phase 1 Plan 01: Fix Note-Taking Backend Summary

**Fix note duration calc, monthly limit, dead message types, audio retrieval endpoint, and auto-title generation**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-10T12:04:41Z
- **Completed:** 2026-04-10T12:14:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Fixed note duration to use wall-clock time (Date.now() delta) instead of audioBlob.size heuristic
- Monthly note count filters by current calendar month (not total all-time count)
- Removed dead message types (NOTE_CAPTURE_START, NOTE_STOP_CAPTURE, NOTE_SAVE) and handleNoteSave handler
- Added GET_NOTE_AUDIO endpoint for audio blob retrieval by note ID
- Auto-generated titles in format "Voice Note #N — Mon DD, YYYY"

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix offscreen duration + storage monthly limit + getNoteAudio** - `6d3afbd` (fix)
2. **Task 2: Clean background handler + auto-titles + GET_NOTE_AUDIO wiring** - `17762f9` (fix)

## Files Created/Modified
- `apps/extension/src/offscreen/index.ts` - Added recordingStartTime variable, fixed duration to use Date.now() delta
- `apps/extension/src/shared/types/messages.ts` - Removed NOTE_CAPTURE_START, NOTE_STOP_CAPTURE, NOTE_SAVE; added GET_NOTE_AUDIO
- `apps/extension/src/background/storage/index.ts` - Monthly-filtered getNotesCount, new getNoteAudio function
- `apps/extension/src/background/index.ts` - Removed handleNoteSave, added handleGetNoteAudio, auto-titles, imported getNoteAudio

## Decisions Made
- Used `getNotesCount()` (monthly count) for auto-title numbering — aligns with the monthly reset of the 50-note limit
- Removed NOTE_SAVE entirely since only the STOP_RECORDING → addNote path was actually used
- `getNoteAudio()` returns `Blob | null` directly from IndexedDB — lightweight retrieval for playback without full note hydration

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- 4 pre-existing TypeScript errors in `companion-utils.ts` (duplicate object keys) — out of scope, documented in deferred-items.md
- 3 pre-existing test failures in companion-utils and word-replacement tests — out of scope, documented in deferred-items.md

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Note backend fully functional: correct duration, monthly limit, auto-titles, audio retrieval
- Ready for Plan 02 (popup UI for note management and playback)
- Pre-existing companion-utils issues should be addressed in Phase 3 (debt cleanup)

---
*Phase: 01-critical-fixes*
*Completed: 2026-04-10*

## Self-Check: PASSED
- All 4 modified files verified on disk
- Both task commits found in git log (6d3afbd, 17762f9)
- No references to dead types remain
- All new features (recordingStartTime, GET_NOTE_AUDIO, getNoteAudio, startOfMonth, Voice Note) confirmed present
