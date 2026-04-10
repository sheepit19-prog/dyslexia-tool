# Dyslexia Tool MVP Fix-Up Project

## Overview
Fix and polish the existing Dyslexia Tool (Dysspell) Chrome Extension MVP. The extension is ~89% complete but has critical bugs, incomplete features, and technical debt that must be resolved before Chrome Web Store launch.

## Type
Brownfield - Chrome Extension (React 19 + TypeScript + Vite + CRXJS Manifest V3)

## Problem Statement
The MVP has 20 identified issues across 4 priority levels. Core features like note-taking (REMEMBER), companion suggestions, and the options page are non-functional or severely limited. Technical debt (dead code, duplicate paths, unused type system) makes the codebase fragile.

## Goals
1. Make all core features fully functional (READ, WRITE, REMEMBER)
2. Fix all critical bugs preventing launch
3. Clean up technical debt
4. Prepare for Chrome Web Store submission

## Constraints
- Must maintain Manifest V3 compliance
- Local-first architecture (no backend required)
- Privacy-first (no external API calls for core features)
- Existing tech stack: React 19, TypeScript, Vite, Dexie.js, Web Speech API

## Key Files
- `apps/extension/src/popup/App.tsx` - Main popup UI
- `apps/extension/src/content/index.tsx` - Content script (387 lines, monolithic)
- `apps/extension/src/background/index.ts` - Service worker
- `apps/extension/src/background/storage/index.ts` - Dexie/IndexedDB
- `apps/extension/src/offscreen/index.ts` - Audio recording
- `apps/extension/src/shared/lib/companion-utils.ts` - Spelling dictionary
- `apps/extension/src/shared/types/messages.ts` - Type definitions
- `apps/extension/src/shared/types/storage.ts` - Storage schemas
- `apps/extension/src/options/main.tsx` - Options page (placeholder)

## Success Criteria
- All P0 issues resolved (core features work)
- All P1 issues resolved (bugs fixed)
- Technical debt cleaned (P2)
- Build passes, all tests pass
- Extension loads and all features work in Chrome
