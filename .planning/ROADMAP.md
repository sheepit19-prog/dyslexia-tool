# Roadmap: Dyslexia Tool MVP Fix-Up

## Milestone v1.1: Production-Ready MVP

---

### Phase 1: Critical Fixes — Note-Taking & Companion

**Goal:** Make the two most broken features (notes + suggestions) actually work for users.

**Dependencies:** None

**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Fix note-taking backend (duration, monthly limit, auto-titles, dead types, GET_NOTE_AUDIO)
- [x] 01-02-PLAN.md — Fix companion (font loading, 200+ dictionary, Levenshtein, contentEditable, analytics)
- [ ] 01-03-PLAN.md — Build note listing/playback UI in popup (depends on 01)

---

### Phase 2: Options Page & Settings

**Goal:** Build the real settings UI so users can configure all extension behavior.

**Dependencies:** Phase 1 (storage changes may affect settings schema)

**Plans:** 4 plans

Plans:
- [ ] 02-01-PLAN.md — Foundation: types, store, sidebar layout, UI primitives
- [ ] 02-02-PLAN.md — General + Companion + Notes settings panels
- [ ] 02-03-PLAN.md — Hotkeys + Per-Site + Privacy settings panels
- [ ] 02-04-PLAN.md — Human verification checkpoint

---

### Phase 3: Technical Debt & Polish

**Goal:** Clean codebase with no dead code, type-safe messaging, modular content script, unit test coverage, companion sensitivity wired, CSP graceful degradation, onboarding welcome screen, and Chrome Web Store readiness.

**Dependencies:** Phase 1 & 2 (don't clean code that's about to change)

**Plans:** 4 plans

Plans:
- [x] 03-01-PLAN.md — Dead code removal + content script module split (Wave 1)
- [x] 03-02-PLAN.md — Type-safe messaging completion + unit tests (Wave 1)
- [x] 03-03-PLAN.md — Companion sensitivity wiring + CSP graceful degradation (Wave 2)
- [x] 03-04-PLAN.md — Onboarding welcome screen + performance profiling + store readiness (Wave 2)

---

## Progress Tracking

| Phase | Status | Plans | Summaries |
|-------|--------|-------|-----------|
| 1     | complete | 3     | 3         |
| 2     | complete | 4     | 4         |
| 3     | complete | 4     | 4         |
