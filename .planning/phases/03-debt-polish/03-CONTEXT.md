# Phase 3: Technical Debt & Polish - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Clean up codebase (remove dead code, refactor content script, adopt type-safe messaging), fix/add tests, and polish for Chrome Web Store submission including onboarding welcome screen, CSP handling, companion sensitivity tuning, and performance verification.

</domain>

<decisions>
## Implementation Decisions

### Onboarding welcome screen
- 3-step feature tour: Step 1 — what the extension does, Step 2 — companion demo, Step 3 — settings overview
- Warm & encouraging tone — supportive language fitting the dyslexia support mission (e.g., "Let's make reading easier for you.")
- Triggered automatically on first install only
- Accessible later from settings page for revisiting
- Final CTA: "Try it now" button opens a curated sample page where users can immediately test the companion on real text

### Claude's Discretion
- Dead code removal approach and scope
- Content script module split strategy
- Type-safe sendMessage helper adoption order
- Test framework and coverage targets
- CSP handling technical approach for blocked sites
- Companion detection sensitivity tuning parameters
- Sample page content for onboarding CTA
- Onboarding UI design (illustrations, animations, layout)
- Performance profiling methodology
- Chrome Web Store listing copy and assets

</decisions>

<specifics>
## Specific Ideas

- Onboarding should feel supportive, not clinical — the product helps people with dyslexia, tone matters
- "Try it now" sample page should have real, meaningful text — not lorem ipsum

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-debt-polish*
*Context gathered: 2026-04-11*
