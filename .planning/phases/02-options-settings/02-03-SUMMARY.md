---
phase: 02-options-settings
plan: 03
subsystem: ui
tags: [react, chrome-extension, options-page, hotkeys, per-site, privacy, export, delete]

# Dependency graph
requires:
  - phase: 02-01
    provides: Options page shell, sidebar layout, UI primitives, Zustand store, SitePreference type
  - phase: 02-02
    provides: General, Companion, Notes settings panels, App.tsx with component routing
provides:
  - Hotkeys reference table with Chrome commands API
  - Per-site preferences management with expand/edit/remove cards
  - Privacy panel with data export, nuclear delete, and storage stats
  - Storage helper functions for bulk operations
  - Feature-complete options page (all 6 sections)
affects: [02-04-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns: [chrome-commands-api-for-shortcut-display, expandable-card-list-with-local-state, live-match-input-for-destructive-confirm, json-blob-export-download]

key-files:
  created:
    - apps/extension/src/options/components/HotkeysSettings.tsx
    - apps/extension/src/options/components/PerSiteSettings.tsx
    - apps/extension/src/options/components/PrivacySettings.tsx
  modified:
    - apps/extension/src/background/storage/index.ts
    - apps/extension/src/options/App.tsx

key-decisions:
  - "Hotkeys panel is read-only with chrome.commands.getAll() — delegates rebinding to Chrome's native shortcuts page"
  - "Per-site cards use local useState for edit state, with per-field Reset buttons and full site removal"
  - "Nuclear delete uses live character matching progress (DEL... → DELETE ✓) instead of simple submit button"
  - "Export strips audioBlob from notes and replaces with '[excluded - audio data]' placeholder"

patterns-established:
  - "Expandable card list: click header to toggle, local useState per card, refresh callback prop for mutations"
  - "Live match input: track character-by-character match against target string, show visual progress"
  - "JSON export: gather all tables, strip large blobs, create Blob + anchor download pattern"

requirements-completed: []

# Metrics
duration: 13min
completed: 2026-04-11
---

# Phase 2 Plan 3: Hotkeys, Per-Site & Privacy Panels Summary

**Hotkeys reference table, expandable per-site preference cards with edit/reset, and privacy panel with JSON export and live-matching nuclear delete**

## Performance

- **Duration:** 13 min
- **Started:** 2026-04-11T13:42:51Z
- **Completed:** 2026-04-11T13:55:50Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments
- Built three complete settings panels making the options page feature-complete (all 6 sections)
- Added 4 storage helper functions for bulk site preference and stats operations
- Hotkeys panel displays Chrome commands in styled table with kbd elements and shortcut editor instructions
- Per-site cards show non-null override badges, expand to full edit form with per-field reset buttons
- Privacy panel includes storage stats, JSON data export (strips audio blobs), and nuclear delete with live DELETE matching

## Task Commits

Each task was committed atomically:

1. **Task 1: Build Hotkeys, Per-Site, and Privacy settings panels** - `c7fbc49` (feat)

## Files Created/Modified
- `apps/extension/src/options/components/HotkeysSettings.tsx` - Read-only shortcuts table from chrome.commands.getAll() with kbd styling and chrome:// link
- `apps/extension/src/options/components/PerSiteSettings.tsx` - Card list with expand/edit form, per-field reset, full site removal confirmation
- `apps/extension/src/options/components/PrivacySettings.tsx` - Storage stats, JSON export with blob stripping, nuclear delete with live character match
- `apps/extension/src/background/storage/index.ts` - Added getAllSitePreferences, deleteSitePreference, deleteAllSitePreferences, getStorageStats
- `apps/extension/src/options/App.tsx` - Wired hotkeys, per-site, and privacy sections to real components (all 6 sections complete)

## Decisions Made
- Hotkeys panel is read-only — delegates rebinding to Chrome's native chrome://extensions/shortcuts page rather than fighting the platform
- Per-site edit form uses local useState per card (not global store) since only one card is edited at a time
- Export strips audioBlob from notes and replaces with placeholder text — blobs are too large for JSON and not restorable anyway
- Nuclear delete shows live character-by-character match progress (DEL... → DELETE ✓) for visual feedback during dangerous operation
- Each card override field has its own Reset button (sets field to null = use global) alongside the full site removal option

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Options page is feature-complete with all 6 settings sections rendering real components
- Ready for Plan 04 (visual polish, responsiveness, final touches)
- Storage helper functions available for popup integration of per-site override creation

---
*Phase: 02-options-settings*
*Completed: 2026-04-11*

## Self-Check: PASSED
- All 3 created files verified on disk
- Task commit c7fbc49 verified in git log
