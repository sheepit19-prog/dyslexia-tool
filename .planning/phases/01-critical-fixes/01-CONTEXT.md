# Phase 1: Critical Fixes — Note-Taking & Companion - Context

**Gathered:** April 10, 2026
**Status:** Ready for planning
**Source:** Full codebase triage (20 issues identified)

<domain>
## Phase Boundary

Fix the two most broken core features (REMEMBER notes + companion suggestions) so they are fully functional for users. This means:
- Notes: users can record, list, playback, and delete voice notes
- Companion: spelling suggestions actually cover common dyslexic errors with fuzzy matching, works in rich text editors (Gmail, Docs), and OpenDyslexic font actually loads
- Bug fixes: duration calculation, monthly limit, cursor tracking, analytics wiring

This phase does NOT include: options page redesign, content script refactoring, E2E test improvements, or new features like transcription.
</domain>

<decisions>
## Implementation Decisions

### Note-Taking (REMEMBER) Feature
- Build note listing UI in popup (scrollable list showing title, date, duration, play/delete buttons)
- Add audio playback using Web Audio API / HTMLAudioElement via object URLs from IndexedDB Blobs
- Fix duration: track recording start/stop with Date.now() in offscreen/index.ts
- Fix monthly limit: filter notes by createdAt within current calendar month in getNotesCount()
- Consolidate NOTE_SAVE into STOP_RECORDING path — remove handleNoteSave duplicate
- Auto-generate titles: "Voice Note #N — Apr 10, 2026" format using note count + date
- Remove dead message types NOTE_CAPTURE_START, NOTE_STOP_CAPTURE from messages.ts

### Companion Suggestions
- Fix OpenDyslexic font: load .woff2 via @font-face in injectFontStyles(), respect fontFamily param
- Expand dictionary to 200+ entries covering common dyslexic error patterns
- Add Levenshtein distance (edit distance ≤ 2) for fuzzy matching on unrecognized words
- Implement contentEditable word replacement using Selection/Range API
- Implement contentEditable cursor tracking using window.getSelection().getRangeAt(0)
- Wire COMPANION_DETECTED_STRUGGLE: content script sends to background after showing notification

### UI Constraints
- Popup is 400px wide — note list must fit within this constraint
- All popup styles are inline (no Tailwind in popup) — maintain this pattern for consistency
- Content script UI uses raw HTML injection with inline styles — maintain this pattern
- No new external dependencies for core features (no npm packages for Levenshtein — implement manually)

### Claude's Discretion
- Exact layout of note list within popup (card-based vs list-based)
- How to handle audio playback UI (inline vs modal within popup)
- Levenshtein implementation details (optimal cutoff threshold)
- Exact font file format for OpenDyslexic (woff2 preferred)

</decisions>

<specifics>
## Specific Requirements from Triage

### P0 Critical Issues
1. No note playback or listing UI (notes recorded but inaccessible)
2. OpenDyslexic font never loaded (hardcoded to Verdana — content/index.tsx line 18)
3. Spelling dictionary only 40 words (companion-utils.ts)
4. contentEditable word replacement fails (returns false — companion-utils.ts line 94)
5. Options page is placeholder (NOT in this phase — Phase 2)

### P1 Bug Issues
6. Duration calculation wrong: `blob.size / 1000` instead of Date.now() delta (offscreen/index.ts:33)
7. Monthly note limit is actually total: `db.notes.count() >= 50` (storage/index.ts)
8. Cursor tracking wrong for contentEditable: always uses last word (companion-utils.ts:57)
9. Content script never reports struggles to background (COMPANION_DETECTED_STRUGGLE never sent)

### Key File Modifications
- `src/offscreen/index.ts` — duration fix
- `src/background/storage/index.ts` — monthly limit fix + return audioBlob in GET_NOTES
- `src/background/index.ts` — remove duplicate, add analytics wiring
- `src/popup/App.tsx` — note listing + playback UI
- `src/content/index.tsx` — font loading fix, analytics wiring
- `src/shared/lib/companion-utils.ts` — dictionary expansion, fuzzy matching, contentEditable support
- `src/shared/types/messages.ts` — clean up dead types, add PLAY_NOTE message
- `src/shared/types/storage.ts` — no schema changes needed (Note type is fine)

### Existing Test Coverage
- 23 tests pass: companion-utils.test.ts (11 tests), word-replacement.test.ts (12 tests)
- Tests cover generateSpellingSuggestions and replaceWordInElement for INPUT/TEXTAREA
- No tests for note operations, contentEditable, or fuzzy matching
</specifics>

<deferred>
## Deferred Ideas

- Note transcription (speech-to-text) — Phase 3+
- Note titles/tags editing — Phase 3+
- Options page redesign — Phase 2
- Content script refactoring (splitting monolith) — Phase 3
- E2E test improvements — Phase 3
- Remove dead CompanionNotification.tsx — Phase 3
- Adopt type-safe sendMessage helper project-wide — Phase 3
- ML-based detection — Phase 3+
- Reading fatigue detection — Phase 3+
- Onboarding tutorial — Phase 3
</deferred>

---
*Phase: 01-critical-fixes*
*Context gathered: 2026-04-10 via full codebase triage*
