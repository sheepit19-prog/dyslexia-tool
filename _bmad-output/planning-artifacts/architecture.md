---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
implementationStatus: 'MVP COMPLETE - All features functional'
lastUpdated: '2026-03-27'
buildStatus: 'Production Ready'
nextSession: 'Phase 2 - Voice Notes OR Chrome Web Store Launch'
inputDocuments:
  - prd.md
workflowType: 'architecture'
project_name: 'dyslexia_tool_lean_mvp'
user_name: 'Berk'
date: '2026-03-17'
lastStep: 8
status: 'complete'
completedAt: '2026-03-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The product requires 100 functional capabilities organized into 13 major areas:
- Reading Assistance (FR1-10): Font rendering, spacing controls, TTS
- Writing Assistance (FR11-18): Companion mode, contextual help
- Memory & Notes (FR19-28): Voice capture, local storage, PRO sync
- Companion Intelligence (FR29-36): Real-time behavior detection and intervention
- User Preferences (FR37-44): Customization and settings management
- Subscription & Accounts (FR45-52): Freemium model with Stripe integration
- Privacy & Security (FR53-60): Data controls, local processing
- Extension Management (FR61-68): Browser integration and lifecycle
- User Onboarding (FR69-75): Tutorial and help systems
- Cross-Platform Sync (FR76-80): PRO-tier device synchronization
- Administrative (FR81-88): Support and user management tools
- Reporting & Analytics (FR89-95): Usage tracking and metrics
- Integration & Compatibility (FR96-100): Browser and website support

**Non-Functional Requirements:**
- Performance: <500ms extension start, <100ms font injection, <2s TTS response
- Security: AES-256 encryption, TLS 1.3, no webpage content transmission
- Scalability: 25,000 users by Month 12, horizontal scaling to 100K+
- Accessibility: WCAG 2.1 AA, Section 508, full keyboard navigation
- Reliability: 99.5% uptime, zero data loss tolerance
- Browser Compatibility: Chrome 90+, Edge 90+ (primary); Firefox, Safari (secondary)

**Scale & Complexity:**
- Primary domain: Browser Extension / Full-Stack Web Application
- Complexity level: Medium-High
- Estimated architectural components: 10-12 major components
- Real-time processing requirements: High (companion intelligence)
- Data sensitivity: High (accessibility tools often used in sensitive contexts)

### Technical Constraints & Dependencies

**Browser Extension Constraints:**
- Manifest V3 compliance (no remote code, service workers only)
- Content Security Policy restrictions on many websites
- Cross-origin resource limitations
- Permission model constraints (minimal by default)
- Chrome Web Store review process (1-7 days)

**Privacy & Compliance Constraints:**
- Webpage content must never leave client device (companion mode)
- Voice processing should be local by default (cloud opt-in only)
- GDPR data minimization principles
- COPPA compliance if serving users under 13
- FERPA for educational institution integrations

**Integration Dependencies:**
- Chrome Extension APIs (tabs, storage, scripting)
- Web Speech API (browser native TTS)
- IndexedDB for local storage
- Stripe for payment processing (PRO tier)
- Cloud storage provider for sync (PRO tier)

### Cross-Cutting Concerns Identified

1. **Privacy-by-Design**
   - Affects: All data flows, AI processing, analytics
   - Implication: Client-side processing preferred, anonymization required

2. **Real-Time Event Processing**
   - Affects: Companion mode, typing detection, reading analysis
   - Implication: Efficient event handling, debouncing, performance optimization

3. **Accessibility Standards**
   - Affects: UI components, keyboard navigation, screen readers
   - Implication: WCAG 2.1 AA compliance throughout, ARIA labels, focus management

4. **Cross-Platform State Management**
   - Affects: Settings, notes, preferences
   - Implication: Conflict resolution, sync strategies, offline-first design

5. **Content Security Policy Compatibility**
   - Affects: Font injection, content scripts
   - Implication: Graceful fallbacks, overlay modes, CSP detection

---

## Starter Template Evaluation

### Primary Technology Domain

**Browser Extension (Manifest V3) + React/TypeScript Web Application**

Based on project requirements analysis, the primary technology stack consists of:
- **Browser Extension**: Chrome Extension with Manifest V3 compliance
- **Frontend Framework**: React 19.x with TypeScript 5.x
- **Build System**: Vite 7.x (consistent with existing DysSpell codebase)
- **State Management**: Zustand 5.x
- **Styling**: Tailwind CSS 4.x

### Starter Options Considered

**Option 1: CRXJS Vite Plugin** ⭐ **RECOMMENDED**
- **Pros**: Uses Vite (matches existing stack), HMR for content scripts, TypeScript support, Manifest V3 ready
- **Cons**: Smaller community than WXT, newer framework
- **Best For**: Projects already using Vite, need fast iteration

**Option 2: WXT Framework**
- **Pros**: Full-featured, excellent documentation, multiple browser support, file-based routing
- **Cons**: Uses its own build system (not Vite), additional abstraction layer
- **Best For**: Large extensions, multi-browser support priority

**Option 3: Plasmo Framework**
- **Pros**: Great developer experience, built-in environment management, active community
- **Cons**: Adds significant abstraction, learning curve, opinionated structure
- **Best For**: Teams wanting maximum DX, rapid prototyping

**Option 4: Custom Webpack/Rollup**
- **Pros**: Full control, no dependencies, optimized for specific needs
- **Cons**: Significant setup time, maintenance burden, no HMR
- **Best For**: Highly specialized requirements, existing build expertise

### Selected Starter: CRXJS Vite Plugin

**Rationale for Selection:**

1. **Technology Alignment**: Your existing DysSpell web app uses Vite 7.3.1. Using CRXJS maintains consistency across your codebase, allowing shared build configurations, component libraries, and development workflows.

2. **Hot Module Replacement**: CRXJS provides HMR for content scripts—a rare and valuable feature that significantly speeds up extension development, especially important for iterative companion mode development.

3. **TypeScript Support**: Native TypeScript support out of the box, critical for maintaining type safety across the complex event handling and message passing architecture.

4. **Manifest V3 Ready**: Built specifically for Manifest V3, ensuring compliance with Chrome's latest extension requirements from day one.

5. **React Integration**: Seamless React support for both popup UI and content script overlays, allowing you to reuse components from your existing DysSpell codebase.

**Initialization Command:**

```bash
# Create new extension project with CRXJS
npm create vite@latest dyslexia-extension -- --template react-ts
cd dyslexia-extension
npm install -D @crxjs/vite-plugin
```

Then configure `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
})
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript 5.x with strict mode enabled
- ES2022 target for modern JavaScript features
- JSX transform for React components
- Type definitions for Chrome Extension APIs

**Styling Solution:**
- Tailwind CSS 4.x configured (consistent with DysSpell)
- PostCSS for CSS processing
- CSS modules support for scoped styles
- Dynamic class generation for runtime theme changes

**Build Tooling:**
- Vite 7.x for fast builds and HMR
- Rollup for production bundling
- Automatic code splitting for content scripts
- Source maps for debugging
- Minification and tree-shaking for production

**Testing Framework:**
- Vitest for unit testing (consistent with Vite ecosystem)
- React Testing Library for component tests
- Playwright for E2E testing (browser automation)
- @testing-library/jest-dom for DOM assertions

**Code Organization:**

```
src/
├── background/           # Service worker (Manifest V3)
│   ├── index.ts         # Entry point
│   ├── companion/       # Companion intelligence logic
│   ├── storage/         # Storage management
│   └── messaging/       # Message passing handlers
├── content/             # Content scripts
│   ├── index.tsx        # Content script entry
│   ├── font-injector/   # Font modification logic
│   ├── reading-mode/    # Reading assistance features
│   ├── companion-ui/    # Companion notifications UI
│   └── utils/           # Content script utilities
├── popup/               # Extension popup UI
│   ├── App.tsx          # Main popup component
│   ├── components/      # Popup-specific components
│   └── hooks/           # Popup custom hooks
├── options/             # Options page
│   ├── App.tsx          # Options page component
│   └── settings/        # Settings management
├── shared/              # Shared across all contexts
│   ├── components/      # Shared React components
│   ├── hooks/           # Shared custom hooks
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Shared utilities
│   └── constants/       # Constants and config
└── manifest.json        # Extension manifest
```

**Development Experience:**

- **Hot Module Replacement**: Instant updates during development for popup, options, and content scripts
- **TypeScript Intellisense**: Full type support for Chrome APIs and internal modules
- **React DevTools**: Browser extension debugging support
- **Source Maps**: Debug original TypeScript source in Chrome DevTools
- **Automatic Reload**: Extension reloads automatically on file changes
- **Environment Variables**: Support for .env files (API keys, feature flags)

**Note:** Project initialization using this command should be the first implementation story. The existing DysSpell web app should be refactored to share the `src/shared/` directory with the extension, creating a monorepo structure for code reuse.

**Migration Strategy from DysSpell:**
1. Extract reusable components and hooks from DysSpell into `src/shared/`
2. Update DysSpell to import from shared directory
3. Create new extension project using CRXJS
4. Share the `src/shared/` directory between both projects
5. Maintain separate build processes but unified component library

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

1. ✅ **Data Storage Strategy** - IndexedDB only for MVP
2. ✅ **Authentication Approach** - No auth in MVP, defer to Phase 2
3. ✅ **Companion Intelligence Implementation** - Client-side heuristics only
4. ✅ **Distribution Strategy** - Chrome Web Store only for MVP

**Important Decisions (Shape Architecture):**

5. ✅ **Message Passing Architecture** - Chrome Extension message API with type-safe wrappers
6. ✅ **State Synchronization** - Local-first with eventual consistency
7. ✅ **Privacy Architecture** - Zero server data transmission for core features
8. ✅ **Component Sharing Strategy** - Monorepo with shared `src/` directory

**Deferred Decisions (Post-MVP):**

- Cloud sync architecture (Phase 2 - PRO tier)
- Authentication system selection (Phase 2 - PRO tier)
- Multi-browser support (Phase 2 - Firefox/Edge)
- Advanced ML models for companion mode (Phase 3)
- B2B/institutional features (Phase 3)

### Data Architecture

#### Decision 1.1: Local Storage Strategy

**Decision:** IndexedDB only for MVP, no chrome.storage.sync or cloud backend

**Rationale:**
- MVP scope requires storing: user settings, up to 50 voice notes, site preferences, companion learning data
- IndexedDB provides sufficient capacity (hundreds of MB) and works entirely offline
- Aligns with privacy-by-design principle (FR60: no webpage content transmission)
- Avoids external dependencies and backend infrastructure for MVP
- chrome.storage.sync adds complexity for marginal benefit (settings only)
- Cloud sync is explicitly Phase 2 for PRO tier only (FR76-80)

**Implementation:**
- Primary storage: IndexedDB via Dexie.js wrapper for easier Promise-based API
- Schema: Versioned database with stores for settings, notes, preferences, analytics
- Backup/Export: JSON export functionality for user data portability
- Migration: Database versioning strategy for schema updates

**Affects:**
- All data persistence across extension contexts
- Voice note storage and retrieval
- Settings synchronization between popup/content/options
- Offline functionality guarantees

**Trade-offs:**
- ✅ Simple, no backend infrastructure needed
- ✅ Full offline functionality
- ✅ Zero external dependencies for MVP
- ✅ Perfect privacy (data never leaves device)
- ❌ No cross-device sync (intentional for MVP)
- ❌ Data lost if extension uninstalled without export
- ❌ Limited storage compared to cloud (acceptable for 50 notes)

#### Decision 1.2: Database Schema Design

**Decision:** Normalized schema with separate stores for different data types

**Schema Overview:**
```typescript
// IndexedDB Schema
interface DyslexiaDB {
  settings: {
    id: 'global';
    fontEnabled: boolean;
    fontFamily: string;
    lineSpacing: number;
    letterSpacing: number;
    companionMode: 'proactive' | 'reactive' | 'off';
    companionSensitivity: number;
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    ttsSpeed: number;
    analyticsEnabled: boolean;
    updatedAt: Date;
  };
  
  sitePreferences: {
    id: string; // domain name
    fontEnabled: boolean | null; // null = use global
    lineSpacing: number | null;
    letterSpacing: number | null;
    companionEnabled: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
  
  notes: {
    id: string; // UUID
    title: string | null;
    audioBlob: Blob;
    duration: number; // seconds
    transcript: string | null; // if speech-to-text applied
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  companionLearning: {
    id: 'patterns';
    typingPatterns: {
      averageWPM: number;
      backspaceFrequency: number;
      pauseThreshold: number;
    };
    interventionAcceptance: {
      accepted: number;
      dismissed: number;
      lastUpdated: Date;
    };
  };
  
  analytics: {
    id: string; // date string YYYY-MM-DD
    featuresUsed: Record<string, number>;
    sessionDuration: number;
    sitesVisited: number;
  };
}
```

**Affects:**
- Data access patterns throughout application
- Migration strategies for future schema changes
- Query performance for notes and settings retrieval

### Authentication & Security

#### Decision 2.1: PRO Tier Authentication

**Decision:** No authentication system in MVP, defer to Phase 2 when PRO features requiring accounts are implemented

**Rationale:**
- MVP has zero features requiring user accounts (no sync, no PRO tier)
- Authentication adds significant complexity (user management, password reset, security)
- Stripe payment processing for PRO can be done with email-only (no password) in Phase 2
- OAuth or custom auth can be added later without breaking changes
- Allows focus on core functionality for MVP launch

**Phase 2 Authentication Options (Deferred):**
- Option A: Email + Magic Link (no passwords)
- Option B: OAuth (Google, GitHub)
- Option C: Email + Password with secure hashing

**Affects:**
- No login UI needed in MVP
- No session management required
- No backend auth service needed for MVP
- Simplified architecture reduces attack surface

**Trade-offs:**
- ✅ Zero auth complexity for MVP
- ✅ Faster time to market
- ✅ No user management overhead
- ❌ No cross-device sync (planned for Phase 2)
- ❌ No user accounts for support purposes (use extension ID for now)

#### Decision 2.2: Data Encryption

**Decision:** Encryption at rest for sensitive data, HTTPS for all external communications

**Implementation:**
- Voice notes: Encrypted using Web Crypto API with user-derived key
- Settings: Not encrypted (not sensitive), but stored locally only
- External APIs: HTTPS only (Stripe, analytics, future sync)
- No plaintext storage of any user-generated content

**Affects:**
- Note storage and retrieval performance
- Backup/export functionality complexity
- Compliance with privacy regulations (GDPR, etc.)

### API & Communication Patterns

#### Decision 3.1: Message Passing Architecture

**Decision:** Chrome Extension message API with TypeScript type-safe wrappers

**Rationale:**
- Chrome Extension architecture requires communication between contexts (content script, service worker, popup)
- Standard Chrome runtime messaging is the only option for Manifest V3
- TypeScript wrappers ensure compile-time safety for message types
- Avoids external messaging libraries (keeps bundle size small)

**Implementation Pattern:**
```typescript
// types/messages.ts
export interface MessageMap {
  'APPLY_FONT_SETTINGS': {
    payload: { fontFamily: string; lineHeight: number };
    response: { success: boolean };
  };
  'CAPTURE_VOICE_NOTE': {
    payload: { duration: number };
    response: { noteId: string };
  };
  'COMPANION_DETECTED_STRUGGLE': {
    payload: { type: 'typing' | 'reading'; confidence: number };
    response: void;
  };
  // ... other messages
}

// utils/messaging.ts
export function sendMessage<T extends keyof MessageMap>(
  type: T,
  payload: MessageMap[T]['payload']
): Promise<MessageMap[T]['response']> {
  return chrome.runtime.sendMessage({ type, payload });
}
```

**Affects:**
- All cross-context communication in extension
- Type safety across message boundaries
- Testing strategies for message handlers

**Trade-offs:**
- ✅ Native Chrome API, no dependencies
- ✅ Type-safe with TypeScript
- ✅ Well-documented and stable
- ❌ No request/response pattern matching (manual correlation)
- ❌ Limited payload size (use IndexedDB for large data)

#### Decision 3.2: Companion Intelligence Implementation

**Decision:** Client-side heuristics only, no server API calls or ML models for MVP

**Rationale:**
- Privacy requirement (FR60): No webpage content transmission to servers
- Simple heuristics sufficient for MVP (backspace detection, pause timing)
- Avoids backend infrastructure and ML complexity
- Fast, offline-capable detection
- Can be enhanced with local ML models in Phase 3

**Detection Algorithms:**
```typescript
// Typing Struggle Detection
interface TypingAnalysis {
  backspaceCount: number;
  pauseDuration: number;
  characterDeletionRate: number;
}

function detectTypingStruggle(analysis: TypingAnalysis): boolean {
  const BACKSPACE_THRESHOLD = 3; // 3+ backspaces in short window
  const PAUSE_THRESHOLD = 3000; // 3+ seconds pause
  
  return (
    analysis.backspaceCount >= BACKSPACE_THRESHOLD ||
    analysis.pauseDuration >= PAUSE_THRESHOLD
  );
}

// Reading Fatigue Detection
interface ReadingAnalysis {
  timeOnPage: number;
  scrollDepth: number;
  textDensity: number;
}

function detectReadingFatigue(analysis: ReadingAnalysis): boolean {
  const TIME_THRESHOLD = 120000; // 2+ minutes on text-heavy page
  const DENSITY_THRESHOLD = 0.7; // 70%+ text content
  
  return (
    analysis.timeOnPage >= TIME_THRESHOLD &&
    analysis.textDensity >= DENSITY_THRESHOLD
  );
}
```

**Affects:**
- Content script event handling complexity
- User privacy guarantees
- Offline functionality
- Future enhancement path

**Trade-offs:**
- ✅ Zero privacy concerns
- ✅ Works offline completely
- ✅ No backend costs
- ✅ Fast detection (<10ms)
- ❌ Less sophisticated than ML models
- ❌ Limited pattern recognition
- ❌ May produce false positives (mitigated with conservative thresholds)

### Frontend Architecture

#### Decision 4.1: State Management Strategy

**Decision:** Zustand for global state, React Context for extension-specific state, local state for components

**Rationale:**
- DysSpell already uses Zustand 5.x - maintain consistency
- Zustand works well with Chrome Extension storage (can persist to IndexedDB)
- Extension has multiple contexts (popup, content, options) - need shared state
- React Context good for extension-specific state (active tab, current site)

**State Organization:**
```typescript
// stores/settingsStore.ts (shared with DysSpell)
interface SettingsState {
  fontEnabled: boolean;
  fontFamily: string;
  lineSpacing: number;
  // ... other settings
  
  actions: {
    updateSettings: (settings: Partial<SettingsState>) => void;
    loadSettings: () => Promise<void>;
    saveSettings: () => Promise<void>;
  };
}

// stores/extensionStore.ts (extension-only)
interface ExtensionState {
  activeTab: chrome.tabs.Tab | null;
  currentSite: string | null;
  companionActive: boolean;
  
  actions: {
    setActiveTab: (tab: chrome.tabs.Tab) => void;
    toggleCompanion: () => void;
  };
}
```

**Affects:**
- Component re-rendering patterns
- State persistence and hydration
- Cross-context state synchronization

#### Decision 4.2: Component Architecture

**Decision:** Atomic design methodology with compound component patterns for complex UI

**Structure:**
- **Atoms**: Basic UI elements (Button, Input, Toggle)
- **Molecules**: Simple combinations (FontToggle, SpacingControl)
- **Organisms**: Complex features (CompanionNotification, NoteRecorder)
- **Templates**: Page layouts (PopupLayout, OptionsLayout)
- **Pages**: Full views (PopupApp, OptionsApp)

**Compound Components for Extension:**
```typescript
// Companion notification with multiple states
<CompanionNotification>
  <CompanionNotification.Trigger />
  <CompanionNotification.Offer />
  <CompanionNotification.Actions>
    <CompanionNotification.Accept />
    <CompanionNotification.Dismiss />
    <CompanionNotification.Snooze />
  </CompanionNotification.Actions>
</CompanionNotification>
```

**Affects:**
- Component reusability across extension contexts
- Testing strategy
- Storybook organization

### Infrastructure & Deployment

#### Decision 5.1: Extension Distribution

**Decision:** Chrome Web Store only for MVP, Firefox/Edge deferred to Phase 2

**Rationale:**
- Chrome has 65%+ browser market share - maximum impact for MVP
- Single platform simplifies development and testing
- Chrome Web Store review process is well-understood
- Firefox/Edge require additional manifest adjustments and testing
- Resources better spent on core functionality than multi-browser support

**Chrome Web Store Strategy:**
- **Developer Account**: $5 one-time fee
- **Review Process**: 1-7 days for initial submission, hours for updates
- **Publishing**: Manual approval required for each release
- **Staged Rollout**: Available for gradual user migration
- **Analytics**: Built-in dashboard for installs, uninstalls, ratings

**Affects:**
- Initial user reach (Chrome users only)
- Development scope (Chrome APIs only)
- Testing requirements (Chrome only)
- Marketing focus (Chrome user base)

**Trade-offs:**
- ✅ Simpler development
- ✅ Faster iteration
- ✅ Largest user base
- ❌ Missing Firefox/Edge users (15-20% of market)
- ❌ Single point of failure (Chrome Store policies)

#### Decision 5.2: CI/CD Pipeline

**Decision:** GitHub Actions for CI/CD with automated testing and manual Chrome Web Store deployment

**Pipeline Stages:**
1. **Lint & Type Check**: ESLint, Prettier, TypeScript strict mode
2. **Unit Tests**: Vitest with 80%+ coverage requirement
3. **E2E Tests**: Playwright for critical user flows
4. **Build**: Vite production build with source maps
5. **Artifact**: Zip file ready for Chrome Web Store
6. **Manual**: Developer submits to Chrome Web Store (cannot be automated)

**GitHub Actions Workflow:**
```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: extension-zip
          path: dist/extension.zip
```

**Affects:**
- Code quality enforcement
- Release process efficiency
- Testing discipline

### Decision Impact Analysis

**Implementation Sequence:**

1. **Week 1-2**: Set up CRXJS project structure, implement IndexedDB schema
2. **Week 3-4**: Build font injection and spacing controls (READ features)
3. **Week 5-6**: Implement companion detection and UI (WRITE features)
4. **Week 7-8**: Build voice capture and storage (REMEMBER features)
5. **Week 9-10**: Polish UI, accessibility, testing
6. **Week 11-12**: Chrome Web Store submission preparation

**Cross-Component Dependencies:**

- **Settings Store** → Affects: Font injection, popup UI, options page
- **Companion Detection** → Depends on: Content script, messaging, user preferences
- **Voice Notes** → Depends on: IndexedDB, microphone permissions, popup UI
- **Font Injection** → Depends on: Content script, settings store, CSP handling
- **Analytics** → Depends on: All features, privacy settings, storage

**Architecture Principles Applied:**

1. **Privacy by Design**: No server transmission, local processing, encrypted storage
2. **Offline First**: All core features work without internet
3. **Progressive Enhancement**: Basic features work everywhere, advanced features enhance experience
4. **Minimal Permissions**: Only request permissions when needed
5. **Type Safety**: TypeScript throughout, typed messaging, strict mode
6. **Testability**: Unit tests for logic, E2E for critical paths, component tests for UI

**Risk Mitigation:**

- **Chrome API Changes**: Manifest V3 compliance, avoid deprecated APIs
- **CSP Restrictions**: Graceful fallbacks, overlay mode alternative
- **Privacy Concerns**: Zero external data transmission, transparent analytics
- **Performance**: Conservative event handling, debounced operations, lazy loading

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 8 areas where AI agents could make different choices:
1. Message type naming across extension contexts
2. Storage key naming conventions
3. Component file naming
4. Test organization
5. Error handling boundaries
6. State mutation patterns
7. Permission check timing
8. API response structures (for future backend)

### Naming Patterns

**Chrome Extension Message Types:**
- **Format**: `SCREAMING_SNAKE_CASE` with domain prefix
- **Examples**: 
  - ✅ `FONT_APPLY_SETTINGS`
  - ✅ `COMPANION_DETECTED_STRUGGLE`
  - ✅ `NOTE_CAPTURE_START`
- **Rationale**: All caps makes message types visually distinct from functions/variables

**Storage Keys:**
- **Format**: `camelCase` with descriptive names
- **Examples**:
  - ✅ `fontSettings`
  - ✅ `companionLearningData`
  - ✅ `sitePreferences_${domain}` (dynamic keys)
- **Rationale**: camelCase for JavaScript consistency

**Component Naming:**
- **Format**: PascalCase with descriptive names
- **Examples**:
  - ✅ `FontToggleButton`
  - ✅ `CompanionNotification`
  - ✅ `VoiceNoteRecorder`

**File Naming:**
- **Format**: PascalCase for components, camelCase for utilities
- **Examples**:
  - ✅ `FontInjector.tsx` (component)
  - ✅ `companionDetection.ts` (utility)
  - ✅ `useSettings.ts` (hook)

### Structure Patterns

**Test Organization:**
- **Location**: Co-located with source files (`*.test.ts` or `*.spec.ts`)
- **Examples**:
  - `src/content/font-injector/fontInjector.ts`
  - `src/content/font-injector/fontInjector.test.ts`

**Component File Structure:**
- Single component per file (except compound components)
- Named exports for components (not default exports)
- Hook and component in separate files if complex

**Project Structure:** As defined in Starter Template Evaluation section

### Format Patterns

**TypeScript Interfaces:**
- **Format**: PascalCase with descriptive names
- **Suffix**: Use `Props` for component props, `State` for state types
- **Example**:
  ```typescript
  interface FontSettingsProps { ... }
  interface CompanionState { ... }
  type MessageType = 'FONT_APPLY' | 'COMPANION_DETECT';
  ```

**Error Response Format:**
- **Structure**: `{ success: boolean, error?: string, code?: string }`
- **Example**:
  ```typescript
  { success: false, error: 'Permission denied', code: 'PERMISSION_DENIED' }
  ```

**Type Safety:**
- No `any` types without explicit comment explaining why
- Use TypeScript strict mode throughout
- Define all message types in MessageMap

### Communication Patterns

**Chrome Message Passing:**
- Always typed using MessageMap
- Always async with async/await
- Always wrap in try/catch
- **Example**:
  ```typescript
  try {
    const response = await sendMessage('FONT_APPLY_SETTINGS', { fontFamily: 'OpenDyslexic' });
  } catch (error) {
    console.error('Failed to apply font:', error);
  }
  ```

**Event Naming:**
- Past tense for completed actions: `FONT_SETTINGS_CHANGED`
- Imperative for commands: `APPLY_FONT_SETTINGS`

**State Updates (Zustand):**
- Immutable updates only
- Use `set` with function form
- **Example**:
  ```typescript
  set((state) => ({
    settings: { ...state.settings, fontEnabled: true }
  }));
  ```

### Process Patterns

**Error Handling:**
- Try/catch at async boundaries
- Always log errors with context: `console.error('Operation failed:', error)`
- Show user feedback for user-facing errors
- Graceful degradation: return defaults instead of crashing

**Loading States:**
- Naming: `isLoading`, `isSaving`, `isCapturing`
- Local for component-specific, global for app-wide
- Always provide visual feedback

**Permission Checks:**
- Check before action: `await navigator.permissions.query()`
- Provide graceful fallback if denied
- Educate user why permission is needed

### Enforcement Guidelines

**All AI Agents MUST:**

1. Use TypeScript strict mode - No `any` types without explicit justification
2. Follow naming conventions - Use patterns defined above consistently
3. Write tests for logic - Every utility function needs a test
4. Handle errors explicitly - No silent failures
5. Respect privacy boundaries - Never transmit webpage content or voice data to servers in MVP
6. Document complex logic - Use JSDoc for non-obvious functions
7. Use the shared directory - Reuse components from `src/shared/`

**Pattern Violations:**
- Will be caught in code review
- Should be fixed before merge
- Document exceptions in comments

### Pattern Examples

**Good Example - Message Handling:**
```typescript
// types/messages.ts
export interface MessageMap {
  'FONT_APPLY_SETTINGS': {
    payload: FontSettings;
    response: { success: boolean };
  };
}

// background/messaging/fontHandler.ts
export async function handleFontMessage(
  message: MessageMap['FONT_APPLY_SETTINGS']
): Promise<MessageMap['FONT_APPLY_SETTINGS']['response']> {
  try {
    await applyFontSettings(message.payload);
    return { success: true };
  } catch (error) {
    console.error('Font application failed:', error);
    return { success: false };
  }
}
```

**Anti-Pattern - Avoid:**
```typescript
// Bad: No typing, no error handling
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'font') {
    applyFont(msg.data);
    sendResponse({ ok: true });
  }
});
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
dyslexia_tool_lean_mvp/
├── README.md
├── package.json (root workspace)
├── pnpm-workspace.yaml (or npm workspace)
├── tsconfig.base.json (shared TypeScript config)
├── .github/
│   └── workflows/
│       ├── ci-extension.yml
│       └── ci-webapp.yml
├── .gitignore
├── docs/
│   ├── architecture.md
│   ├── development-guide.md
│   └── privacy-policy.md
│
├── apps/
│   ├── extension/                    # Chrome Extension (CRXJS)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── manifest.json
│   │   ├── index.html (for popup)
│   │   └── src/
│   │       ├── background/
│   │       │   ├── index.ts          # Service worker entry
│   │       │   ├── companion/
│   │       │   │   ├── detection.ts  # Typing/reading detection
│   │       │   │   └── intervention.ts
│   │       │   ├── storage/
│   │       │   │   ├── indexedDB.ts  # Dexie setup
│   │       │   │   └── repositories/
│   │       │   │       ├── settingsRepo.ts
│   │       │   │       ├── notesRepo.ts
│   │       │   │       └── analyticsRepo.ts
│   │       │   └── messaging/
│   │       │       ├── handlers.ts
│   │       │       ├── fontHandler.ts
│   │       │       ├── companionHandler.ts
│   │       │       └── noteHandler.ts
│   │       │
│   │       ├── content/
│   │       │   ├── index.tsx         # Content script entry
│   │       │   ├── font-injector/
│   │       │   │   ├── fontInjector.ts
│   │       │   │   └── fontInjector.test.ts
│   │       │   ├── reading-mode/
│   │       │   │   ├── readingRuler.tsx
│   │       │   │   └── spacingControls.tsx
│   │       │   ├── companion-ui/
│   │       │   │   ├── CompanionNotification.tsx
│   │       │   │   ├── TypingStruggleDetector.ts
│   │       │   │   └── ReadingFatigueDetector.ts
│   │       │   └── utils/
│   │       │       ├── domUtils.ts
│   │       │       └── cspDetection.ts
│   │       │
│   │       ├── popup/
│   │       │   ├── App.tsx
│   │       │   ├── main.tsx
│   │       │   ├── components/
│   │       │   │   ├── FontToggle.tsx
│   │       │   │   ├── SpacingControl.tsx
│   │       │   │   ├── CompanionToggle.tsx
│   │       │   │   └── NoteRecorder.tsx
│   │       │   └── hooks/
│   │       │       └── useExtensionState.ts
│   │       │
│   │       ├── options/
│   │       │   ├── App.tsx
│   │       │   ├── main.tsx
│   │       │   └── settings/
│   │       │       ├── GeneralSettings.tsx
│   │       │       ├── CompanionSettings.tsx
│   │       │       └── PrivacySettings.tsx
│   │       │
│   │       └── shared/              # Extension-specific shared
│   │           ├── types/
│   │           │   ├── messages.ts
│   │           │   ├── storage.ts
│   │           │   └── companion.ts
│   │           ├── utils/
│   │           │   ├── messaging.ts
│   │           │   └── permissions.ts
│   │           └── constants.ts
│   │
│   └── webapp/                       # Existing DysSpell (refactored)
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           ├── components/          # Refactored to use shared/
│           ├── hooks/
│           └── stores/
│
├── packages/
│   └── shared/                       # Shared component library
│       ├── package.json
│       ├── tsconfig.json
│       ├── index.ts                  # Public exports
│       └── src/
│           ├── components/
│           │   ├── Button/
│           │   │   ├── Button.tsx
│           │   │   ├── Button.test.tsx
│           │   │   └── Button.styles.ts
│           │   ├── Toggle/
│           │   ├── Slider/
│           │   ├── Modal/
│           │   └── Toast/
│           ├── hooks/
│           │   ├── useSpeechRecognition.ts
│           │   ├── useSpeechSynthesis.ts
│           │   └── useSettings.ts
│           ├── stores/
│           │   └── settingsStore.ts  # Zustand store
│           ├── types/
│           │   ├── common.ts
│           │   └── settings.ts
│           ├── utils/
│           │   ├── storage.ts
│           │   └── analytics.ts
│           └── constants/
│               └── settings.ts
│
└── tests/
    ├── e2e/
    │   ├── extension/
    │   │   ├── font-injection.spec.ts
    │   │   ├── companion-mode.spec.ts
    │   │   └── voice-notes.spec.ts
    │   └── webapp/
    │       └── spell-mode.spec.ts
    └── fixtures/
        └── test-data.ts
```

### Requirements to Structure Mapping

**READ Features (FR1-10):**
- `apps/extension/src/content/font-injector/` - Font rendering
- `apps/extension/src/content/reading-mode/` - Spacing controls, TTS
- `apps/extension/src/popup/components/FontToggle.tsx` - Toggle UI

**WRITE Features (FR11-18):**
- `apps/extension/src/background/companion/detection.ts` - Typing detection
- `apps/extension/src/content/companion-ui/CompanionNotification.tsx` - Help offers
- `apps/extension/src/content/companion-ui/TypingStruggleDetector.ts` - Struggle analysis

**REMEMBER Features (FR19-28):**
- `apps/extension/src/background/storage/repositories/notesRepo.ts` - Note storage
- `apps/extension/src/popup/components/NoteRecorder.tsx` - Voice capture UI
- `packages/shared/src/hooks/useSpeechRecognition.ts` - Speech recognition

**Companion Intelligence (FR29-36):**
- `apps/extension/src/background/companion/` - All detection logic
- `apps/extension/src/background/messaging/companionHandler.ts` - Message handling

**Settings & Preferences (FR37-44):**
- `packages/shared/src/stores/settingsStore.ts` - Shared settings state
- `apps/extension/src/options/settings/` - Settings UI

**Privacy & Security (FR53-60):**
- `apps/extension/src/background/storage/` - Local storage only
- `apps/extension/src/shared/utils/permissions.ts` - Permission management

### Architectural Boundaries

**Extension Context Boundaries:**

1. **Service Worker (Background)** - Isolated execution, ephemeral lifecycle
   - Handles: Companion detection, storage operations, message routing
   - Cannot access: DOM, window object
   - Communicates via: `chrome.runtime.sendMessage`

2. **Content Scripts** - Injected into web pages
   - Handles: Font injection, typing detection, reading assistance UI
   - Can access: Page DOM, isolated from page JavaScript
   - Communicates via: `chrome.runtime.sendMessage` to service worker

3. **Popup** - Extension popup UI
   - Handles: Quick settings, note capture, status display
   - Can access: chrome APIs, React components
   - Communicates via: `chrome.runtime.sendMessage` to service worker

4. **Options Page** - Full settings page
   - Handles: Detailed configuration
   - Same capabilities as popup

**Communication Patterns:**
```
Content Script → Service Worker → Popup/Options
       ↑                ↓
       └────────────────┘
```

**Data Flow:**
```
User Action (typing/reading)
    ↓
Content Script Detection
    ↓
Message to Service Worker
    ↓
Storage Update (IndexedDB)
    ↓
UI Update (Popup/Notification)
```

### Integration Points

**Internal Communication:**
- Chrome Extension message API (typed with MessageMap)
- Zustand for cross-component state
- IndexedDB for persistence

**External Integrations (Future - Phase 2+):**
- Stripe API for PRO payments
- Cloud storage provider for sync
- Web Speech API for TTS/STT (already available in browsers)

### Development Workflow Integration

**Development Server:**
- Extension: `npm run dev` (CRXJS with HMR)
- Web App: `npm run dev` (Vite with HMR)
- Shared: `npm run build` (watch mode)

**Build Process:**
1. Build shared package
2. Build extension or webapp (depends on shared)
3. Package extension for Chrome Web Store

**Testing:**
- Unit tests: `npm run test` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)
- Coverage: 80%+ required

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts:
- CRXJS + Vite 7.x + TypeScript 5.x + React 19.x + Zustand 5.x + Tailwind CSS 4.x = Fully compatible stack
- IndexedDB for local storage aligns with privacy-by-design requirements
- Client-side heuristics for companion mode supports offline-first architecture
- Chrome Web Store distribution matches Manifest V3 compliance requirement
- **No contradictory decisions found**

**Pattern Consistency:**
- Naming conventions (SCREAMING_SNAKE_CASE for messages, camelCase for storage, PascalCase for components) consistently applied
- TypeScript strict mode enforced throughout all contexts
- Message typing with MessageMap prevents runtime errors
- Immutable state updates with Zustand pattern documented
- **All patterns support architectural decisions**

**Structure Alignment:**
- Monorepo structure (apps/extension, apps/webapp, packages/shared) enables code reuse
- Clear separation between extension contexts (background, content, popup, options)
- Test organization co-located with source files
- CI/CD workflows defined for both extension and webapp
- **Structure fully supports architecture**

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
All 100 FRs are architecturally supported:

| FR Category | Architectural Support | Status |
|-------------|----------------------|--------|
| READ (FR1-10) | content/font-injector/, content/reading-mode/, popup/components/FontToggle.tsx | ✅ Covered |
| WRITE (FR11-18) | background/companion/, content/companion-ui/, messaging/companionHandler.ts | ✅ Covered |
| REMEMBER (FR19-28) | background/storage/repositories/notesRepo.ts, popup/components/NoteRecorder.tsx, shared/hooks/useSpeechRecognition.ts | ✅ Covered |
| Companion Intelligence (FR29-36) | background/companion/detection.ts, content/companion-ui/TypingStruggleDetector.ts | ✅ Covered |
| Settings (FR37-44) | shared/stores/settingsStore.ts, options/settings/ | ✅ Covered |
| Subscription (FR45-52) | Deferred to Phase 2 (no auth in MVP) | ✅ Documented |
| Privacy & Security (FR53-60) | Local-only storage, no server transmission, encrypted at rest | ✅ Covered |
| Extension Management (FR61-68) | manifest.json, background/index.ts, shared/utils/permissions.ts | ✅ Covered |
| Onboarding (FR69-75) | popup/components/, docs/development-guide.md | ✅ Covered |
| Cross-Platform Sync (FR76-80) | Deferred to Phase 2 (PRO tier) | ✅ Documented |
| Administrative (FR81-88) | Deferred to Phase 2 | ✅ Documented |
| Analytics (FR89-95) | background/storage/repositories/analyticsRepo.ts, shared/utils/analytics.ts | ✅ Covered |
| Integration (FR96-100) | content/utils/cspDetection.ts, manifest.json permissions | ✅ Covered |

**Non-Functional Requirements Coverage:**

| NFR Category | Architectural Support | Status |
|--------------|----------------------|--------|
| Performance (<500ms start, <100ms injection) | CRXJS HMR, lazy loading, debounced event handling | ✅ Covered |
| Security (AES-256, TLS 1.3) | Web Crypto API for encryption, HTTPS for external calls | ✅ Covered |
| Scalability (25K users by Month 12) | Local-first architecture, no server bottlenecks | ✅ Covered |
| Accessibility (WCAG 2.1 AA) | ARIA labels, keyboard navigation, focus management patterns | ✅ Covered |
| Reliability (99.5% uptime) | Offline-first, graceful degradation, error boundaries | ✅ Covered |
| Browser Compatibility (Chrome 90+, Edge 90+) | Manifest V3, Chrome APIs only | ✅ Covered |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ All 8 critical decisions documented with rationale and trade-offs
- ✅ All technology versions specified and verified
- ✅ All deferred decisions explicitly marked (auth, sync, multi-browser)
- ✅ Implementation patterns include concrete examples and anti-patterns

**Structure Completeness:**
- ✅ Complete directory tree with all files and directories defined
- ✅ All extension contexts properly separated
- ✅ Shared package structure enables code reuse
- ✅ Test organization defined (co-located .test.ts files)

**Pattern Completeness:**
- ✅ Message naming: SCREAMING_SNAKE_CASE with domain prefix
- ✅ Storage keys: camelCase with examples
- ✅ Component patterns: PascalCase, named exports
- ✅ Error handling: try/catch at boundaries, graceful degradation
- ✅ State updates: Immutable with Zustand
- ✅ TypeScript strict mode mandatory

### Gap Analysis Results

**Critical Gaps:** None identified

**Important Gaps:** None identified

**Nice-to-Have Gaps (Deferred):**
- Storybook configuration for shared component documentation (Phase 2)
- Automated Chrome Web Store deployment (manual process for MVP)
- Performance monitoring dashboard (Phase 2)
- Error reporting service integration (Phase 2)

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium-High)
- [x] Technical constraints identified (Manifest V3, CSP, privacy)
- [x] Cross-cutting concerns mapped (privacy, accessibility, performance)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (CRXJS, Vite, React, TS, Zustand, Tailwind)
- [x] Integration patterns defined (message passing, Zustand stores)
- [x] Performance considerations addressed (<500ms targets)

**✅ Implementation Patterns**
- [x] Naming conventions established (messages, storage, components, files)
- [x] Structure patterns defined (co-located tests, single component per file)
- [x] Communication patterns specified (typed messaging, async/await)
- [x] Process patterns documented (error handling, loading states, permissions)

**✅ Project Structure**
- [x] Complete directory structure defined (monorepo with apps/, packages/)
- [x] Component boundaries established (extension contexts)
- [x] Integration points mapped (message API, IndexedDB, shared package)
- [x] Requirements to structure mapping complete (FR1-100 → directories)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Rationale:**
- All 100 functional requirements have architectural support
- All non-functional requirements addressed
- No critical or important gaps identified
- Implementation patterns prevent AI agent conflicts
- Complete project structure enables immediate development
- Privacy-by-design enforced throughout architecture

**Key Strengths:**
1. **Privacy-by-Design**: Zero server transmission for MVP, local processing only
2. **Type Safety**: TypeScript strict mode, typed message passing, no `any` types
3. **Code Reuse**: Monorepo with shared package for extension + webapp
4. **Clear Boundaries**: Extension contexts properly isolated (service worker, content, popup)
5. **Offline-First**: All core features work without internet
6. **Pattern Consistency**: Comprehensive naming, structure, and communication patterns

**Areas for Future Enhancement:**
1. **Phase 2 - Authentication**: Add auth system for PRO tier (deferred intentionally)
2. **Phase 2 - Cloud Sync**: Add backend for cross-device synchronization
3. **Phase 2 - Multi-Browser**: Extend to Firefox/Edge with manifest adjustments
4. **Phase 3 - ML Models**: Enhance companion detection with TensorFlow.js
5. **Phase 3 - Mobile Apps**: Native iOS/Android apps with system-wide integration

### Implementation Handoff

**AI Agent Guidelines:**

All AI agents implementing this architecture MUST:

1. **Follow Architectural Decisions Exactly**
   - Use CRXJS for extension build (no Webpack/Rollup manual config)
   - Use IndexedDB only for MVP (no cloud storage)
   - Implement client-side detection only (no server API calls)
   - Deploy to Chrome Web Store only (no Firefox/Edge for MVP)

2. **Use Implementation Patterns Consistently**
   - Message types: `SCREAMING_SNAKE_CASE` with domain prefix
   - Storage keys: `camelCase`
   - Components: PascalCase, named exports, single component per file
   - Tests: Co-located `.test.ts` files
   - Error handling: try/catch at boundaries, graceful degradation

3. **Respect Project Structure**
   - Place files in correct directories per structure definition
   - Use shared package for reusable components/hooks
   - Maintain extension context boundaries (no cross-context imports)

4. **Refer to This Document**
   - All architectural questions answered in this document
   - Patterns section prevents implementation conflicts
   - Examples show correct implementation approach

**First Implementation Priority:**

```bash
# 1. Initialize extension project with CRXJS
cd apps
npm create vite@latest extension -- --template react-ts
cd extension
npm install -D @crxjs/vite-plugin

# 2. Set up shared package
cd ../../packages
npm create vite@latest shared -- --template react-ts
cd shared
npm install zustand tailwindcss

# 3. Configure workspace (root)
cd ../../
# Set up pnpm-workspace.yaml or npm workspaces
# Configure tsconfig.base.json for shared TypeScript config

# 4. First story: Initialize project structure
# Implement: Manifest V3 configuration, basic service worker, first content script
```

**Implementation Stories Priority Order:**

1. **Story 1**: Project initialization with CRXJS
2. **Story 2**: Manifest V3 configuration with minimal permissions
3. **Story 3**: Shared settings store (Zustand)
4. **Story 4**: Font injection content script (FR1-4)
5. **Story 5**: Popup UI for font controls (FR5-10)
6. **Story 6**: IndexedDB setup with Dexie.js
7. **Story 7**: Voice note capture (FR19-25)
8. **Story 8**: Companion detection (FR29-36)
9. **Story 9**: Companion notification UI
10. **Story 10**: Polish, accessibility, testing

---

## Architecture Complete! 🎉

**Document:** `C:/AI_Projects/dyslexia_tool_lean_mvp/_bmad-output/planning-artifacts/architecture.md`

**Status:** READY FOR IMPLEMENTATION

**Next Steps:**
1. Begin implementation with Story 1 (project initialization)
2. Create epics and stories for sprint planning
3. Set up development environment
4. Start building READ features (font injection)

The architecture provides everything AI agents need to implement this consistently!
