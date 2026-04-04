# Dyslexia Tool - Chrome Extension

**Version:** 0.1.0 (MVP Development)

An invisible companion for dyslexic users—proactive help without judgment.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server (with HMR)
npm run dev

# Load extension in Chrome:
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the 'dist' folder
```

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── background/          # Service worker (Manifest V3)
│   └── index.ts        # Message routing, storage operations
├── content/            # Content scripts injected into pages
│   ├── index.tsx       # Entry point
│   ├── styles.css      # Content script styles
│   ├── companion-ui/   # Companion notification components
│   └── font-injector/  # Font injection logic (TODO)
├── popup/              # Extension popup UI
│   ├── App.tsx         # Main popup component
│   ├── main.tsx        # Entry point
│   └── index.css       # Popup styles
├── options/            # Options/settings page
│   └── (TODO)
└── shared/             # Shared types and utilities
    └── types/          # TypeScript definitions
```

## 🎯 MVP Features (In Development)

### Phase 1 - Foundation (Current)
- [x] Project initialization
- [x] CRXJS + Vite setup
- [x] Manifest V3 configuration
- [ ] Service worker message routing
- [ ] Content script injection
- [ ] Popup UI foundation

### Phase 2 - READ Features
- [ ] OpenDyslexic font injection
- [ ] Line spacing controls
- [ ] Letter spacing controls
- [ ] Text-to-speech integration
- [ ] Reading ruler/highlight

### Phase 3 - REMEMBER Features
- [ ] Voice note capture
- [ ] Note playback
- [ ] Note management
- [ ] IndexedDB storage

### Phase 4 - Companion Intelligence
- [ ] Typing pattern detection
- [ ] Reading fatigue detection
- [ ] Contextual help offers
- [ ] User preference learning

## 🛠️ Tech Stack

- **Build:** Vite 7.x + CRXJS
- **Framework:** React 19.x + TypeScript 5.x
- **State:** Zustand 5.x
- **Storage:** IndexedDB via Dexie.js
- **Styling:** Tailwind CSS 4.x
- **Testing:** Vitest + Playwright

## 📋 Development Checklist

### Story 1.1: Initialize Extension Project

- [x] Directory structure created
- [x] package.json configured
- [x] Vite + CRXJS configured
- [x] TypeScript strict mode enabled
- [x] Manifest V3 created
- [x] Service worker entry point
- [x] Content script entry point
- [x] Popup UI foundation
- [x] Shared types defined
- [ ] `npm run dev` starts without errors
- [ ] Extension loads in Chrome

## 🔧 Commands

```bash
# Development
npm run dev          # Start Vite dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests with Playwright
```

## 🐛 Known Issues

- Icons not yet created (using placeholders)
- Options page not yet implemented
- Font files need to be added

## 📝 Next Steps

1. Add icon files to `icons/` directory
2. Add OpenDyslexic font files to `fonts/` directory
3. Test extension loads in Chrome
4. Continue with Story 1.2 (Manifest V3 refinement)

## 📄 License

MIT

---

**Status:** 🚧 In Development (MVP Phase)
