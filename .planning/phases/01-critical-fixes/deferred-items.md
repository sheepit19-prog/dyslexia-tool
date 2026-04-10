# Deferred Items (Out of Scope)

## Pre-existing TypeScript Errors (4)
- **File:** `apps/extension/src/shared/lib/companion-utils.ts`
- **Lines:** 126, 127, 128, 161
- **Error:** TS1117 - Duplicate keys in object literal (`owrk`, `hte`, `waht`, `too`)
- **Status:** Not caused by 01-01 changes. Likely introduced in prior plan (dictionary expansion).

## Pre-existing Test Failures (3)
1. `companion-utils.test.ts > generateSpellingSuggestions > returns empty for correctly spelled words`
2. `companion-utils.test.ts > generateSpellingSuggestions > returns empty for unknown words`
3. `word-replacement.test.ts > getCurrentWordFromElement > handles contentEditable elements`
- **Status:** 26/29 tests pass. Failures pre-exist before 01-01 changes.
