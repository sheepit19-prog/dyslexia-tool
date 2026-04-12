---
phase: 03-debt-polish
plan: 01
subsystem: content-script
tags: [refactor, content-script, dead-code, module-split, chrome-extension]

requires:
  - phase: 01-critical-fixes
    provides: working content script with companion detection and font injection
provides:
  - Clean module structure with no dead code
  - 8 focused content script modules
  - Slim 46-line entry point
  - Cleaned manifest and vite config
affects: [03-02, 03-03, 03-04]

tech-stack:
  added: []
  patterns: [companion-state-singleton, module-per-concern]

key-files:
  created:
    - apps/extension/src/content/font-injection.ts
    - apps/extension/src/content/tts.ts
    - apps/extension/src/content/reading-ruler.ts
    - apps/extension/src/content/companion/state.ts
    - apps/extension/src/content/companion/word-ops.ts
    - apps/extension/src/content/companion/suggestions-ui.ts
    - apps/extension/src/content/companion/notification-ui.ts
    - apps/extension/src/content/companion/detection.ts
  modified:
    - apps/extension/src/content/index.tsx
    - apps/extension/vite.config.ts
    - apps/extension/manifest.json
    - apps/extension/manifest.publish.json

key-decisions:
  - "ES module singleton pattern for companion state — all modules import the same mutable object reference"
  - "Removed debug line (window.setCompanionEnabled) from entry point"

patterns-established:
  - "Companion state singleton: shared mutable state in companion/state.ts imported by all companion modules"
  - "Module-per-concern: each content script feature in its own file with explicit exports"

requirements-completed: [DEBT-01, DEBT-03, DEBT-04]

duration: 7min
completed: 2026-04-12
---

# Phase 3 Plan 01: Dead Code Removal & Content Script Split Summary

**Monolithic 417-line content script split into 8 focused modules; 6 dead code files deleted**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-12T09:26:47Z
- **Completed:** 2026-04-12T09:34:39Z
- **Tasks:** 2
- **Files modified:** 13 (9 created/rewritten, 4 modified)

## Accomplishments
- Deleted 6 dead code files: CompanionNotification.tsx, offscreen recording, mic-permission pages, broken E2E tests
- Split 417-line monolithic content script into 8 focused modules + 46-line entry point
- Extension builds cleanly and all 29 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete dead code and clean build configuration** - `16ab2b8` (fix)
2. **Task 2: Split content/index.tsx into focused modules** - `96bcc40` (refactor)

## Files Created/Modified
- `apps/extension/src/content/index.tsx` - Slim 46-line entry point (message handler + init)
- `apps/extension/src/content/font-injection.ts` - Font injection and removal functions
- `apps/extension/src/content/tts.ts` - Text-to-speech read/stop functions
- `apps/extension/src/content/reading-ruler.ts` - Reading ruler overlay with mouse tracking
- `apps/extension/src/content/companion/state.ts` - Shared mutable companion state singleton
- `apps/extension/src/content/companion/word-ops.ts` - Word extraction and replacement helpers
- `apps/extension/src/content/companion/suggestions-ui.ts` - Spelling suggestion popup DOM creation
- `apps/extension/src/content/companion/notification-ui.ts` - Companion notification popup DOM creation
- `apps/extension/src/content/companion/detection.ts` - Typing detection and struggle analysis
- `apps/extension/vite.config.ts` - Removed offscreen/mic-permission entry points
- `apps/extension/manifest.json` - Removed offscreen permission and web_accessible_resources
- `apps/extension/manifest.publish.json` - Same manifest cleanup as above

## Decisions Made
- ES module singleton pattern for companion state — all modules import the same mutable object reference from `companion/state.ts`
- Removed `(window as any).setCompanionEnabled` debug line from entry point — not needed for production

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `resetCompanionState` was imported but unused in notification-ui.ts — removed unused import. Pre-existing popup/App.tsx type error unrelated to this refactor.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Content script cleanly modularized, ready for Plan 02 (content module tests) and Plan 03 (CSP compliance)
- All module boundaries match the plan specification exactly

---
*Phase: 03-debt-polish*
*Completed: 2026-04-12*
