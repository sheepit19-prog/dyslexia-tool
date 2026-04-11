# Phase 2: Options Page & Settings - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full settings UI so users can configure all extension behavior. Replaces placeholder with a real options page covering: general settings, companion settings, privacy settings, notes settings, per-site preferences, and keyboard shortcuts. This is a Chrome extension options page.

</domain>

<decisions>
## Implementation Decisions

### Page layout & navigation
- Sidebar navigation pattern — category links on left, content area on right
- Spacious density — generous spacing, clear labels and descriptions (accessibility-friendly for dyslexic users)
- Category order (most-used first): General → Companion → Notes → Hotkeys → Per-Site → Privacy
- Auto-save — changes apply immediately, no save button needed

### Per-site preferences
- Card list display — each site as a card showing domain + its overrides, click to expand/edit
- Add overrides from popup — "Customize for this site" button in popup creates the override, then edit in options page
- Visual settings only can be overridden per-site: font, spacing, theme (not companion behavior or hotkeys)
- Removal: both individual override reset per setting + full site removal (delete all overrides for that site)

### Data management flows
- Single "Export my data" button that downloads a JSON file — no granular export selection
- Delete requires typing "DELETE" to confirm — strong protection against accidental data loss
- Nuclear delete only — one "Delete all data" button, no per-category delete options
- Storage usage shown with breakdown by category (notes: X MB, settings: X MB, etc.)

### Hotkey handling
- View-only reference — no in-app rebinding, just display current shortcuts
- Table layout: Action name | Keyboard shortcut — one row per shortcut
- Link to Chrome's native shortcut editor with brief instructions ("To change shortcuts, open Chrome's extension shortcuts page")
- Unconfigured shortcuts show a muted "Not set" badge

### Claude's Discretion
- Exact sidebar styling and responsive behavior
- Auto-save feedback (toast, subtle indicator, etc.)
- Empty state for per-site preferences (no overrides yet)
- Storage breakdown visual format (progress bars, plain text, etc.)
- Card interaction details (hover states, expand/collapse animation)

</decisions>

<specifics>
## Specific Ideas

- Spacious layout is intentional for accessibility — dyslexic users benefit from generous spacing
- Per-site override trigger lives in popup but editing lives in options page — two-location workflow
- Hotkeys section delegates to Chrome's native system — don't fight the platform

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-options-settings*
*Context gathered: 2026-04-11*
