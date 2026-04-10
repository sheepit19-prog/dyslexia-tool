# State: Dyslexia Tool MVP Fix-Up

## Current Status
- **Phase:** 1
- **Plan:** None started
- **Milestone:** v1.1

## Decisions
- [2026-04-10] Focus on fixing all 20 triaged issues before Chrome Web Store launch
- [2026-04-10] Phase 1 priority: note-taking and companion (core broken features)
- [2026-04-10] Phase 2: options page (no real settings UI exists)
- [2026-04-10] Phase 3: debt cleanup + polish

## Blockers
- None currently

## Notes
- Build passes cleanly (tsc + vite build)
- 23 unit tests pass (companion-utils + word-replacement)
- No E2E tests actually validate companion behavior
- Content script is monolithic (387 lines) — split in Phase 3
