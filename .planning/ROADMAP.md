# Roadmap: Dyslexia Tool MVP Fix-Up

## Milestone v1.1: Production-Ready MVP

---

### Phase 1: Critical Fixes — Note-Taking & Companion

**Goal:** Make the two most broken features (notes + suggestions) actually work for users.

**Dependencies:** None

**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Fix note-taking backend (duration, monthly limit, auto-titles, dead types, GET_NOTE_AUDIO)
- [ ] 01-02-PLAN.md — Fix companion (font loading, 200+ dictionary, Levenshtein, contentEditable, analytics)
- [ ] 01-03-PLAN.md — Build note listing/playback UI in popup (depends on 01)

---

### Phase 2: Options Page & Settings

**Goal:** Build the real settings UI so users can configure all extension behavior.

**Dependencies:** Phase 1 (storage changes may affect settings schema)

#### Plan 2.1: Build Options/Settings Page
- Replace placeholder with full settings UI
- General settings: default font, spacing values, theme, hotkeys
- Companion settings: sensitivity slider, snooze duration, struggle types toggle
- Privacy settings: data retention, export/delete all data
- Notes settings: storage usage, export all notes, delete all notes
- Per-site preferences management (view/edit/remove)
- Keyboard shortcuts reference and customization

---

### Phase 3: Technical Debt & Polish

**Goal:** Clean up codebase, fix tests, prepare for store submission.

**Dependencies:** Phase 1 & 2 (don't clean code that's about to change)

#### Plan 3.1: Technical Debt Cleanup
- Remove dead CompanionNotification.tsx component
- Adopt type-safe sendMessage helper (messages.ts:106-114) across all senders
- Refactor content script (split monolithic 387-line file into modules)
- Fix E2E tests to actually validate companion notification appearance
- Add unit tests for note playback, storage operations, settings

#### Plan 3.2: Final Polish & Launch Prep
- CSP handling for banking/government sites
- Companion detection sensitivity tuning
- Onboarding welcome screen (3-step tutorial in popup)
- Build verification and Chrome Web Store readiness check
- Performance profiling (font injection <100ms, startup <500ms)

---

## Progress Tracking

| Phase | Status | Plans | Summaries |
|-------|--------|-------|-----------|
| 1     | planned | 3     | 0         |
| 2     | planned | 1     | 0         |
| 3     | planned | 2     | 0         |
