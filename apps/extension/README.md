# Dyslexia Tool — Chrome Extension

Free Chrome extension for dyslexia reading and writing assistance. Customizable fonts, bionic reading, text-to-speech, reading ruler, spell checking, and voice notes — all processed locally on your device.

## Features

| Feature | Description | Shortcut |
|---|---|---|
| **Dyslexia-Friendly Fonts** | OpenDyslexic, Arial, Verdana with adjustable letter/line spacing | `Ctrl+Shift+F` |
| **Bionic Reading** | Bold first syllables to guide eye movement | `Ctrl+Shift+B` |
| **Read Aloud (TTS)** | Text-to-speech with adjustable speed (0.5x–2.0x) | `Ctrl+Shift+R` |
| **Reading Ruler** | Line highlight to reduce visual clutter | `Ctrl+Shift+L` |
| **Spell Checking** | Real-time spelling suggestions on any page | — |
| **Voice Notes** | Record, transcribe, and tag audio notes (IndexedDB) | — |
| **Site Preferences** | Per-website settings override global defaults | — |
| **Dark Mode** | Light, dark, and system-following themes | — |

## Installation

### Chrome Web Store
Available on the [Chrome Web Store](https://chrome.google.com/webstore) (coming soon).

### Manual (Developer Mode)
```bash
cd apps/extension
npm install
npm run build
```
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` folder

## Development

```bash
cd apps/extension

npm install        # Install dependencies
npm run dev        # Dev server with hot reload
npm test           # Run unit tests
npm run test:e2e   # Run E2E tests
npm run build      # Production build
```

## Project Structure

```
src/
├── background/       # Service worker (Manifest V3)
├── content/          # Content scripts injected into pages
│   ├── companion-ui/ # Companion notification components
│   └── font-injector/ # Font injection logic
├── popup/            # Extension popup UI
├── options/          # Settings page
└── shared/           # Shared types and utilities
```

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 7** with `@crxjs/vite-plugin`
- **Tailwind CSS 4**
- **Zustand** for state management
- **Dexie.js** for IndexedDB
- **Chrome Extension Manifest V3**
- **Vitest** + **Playwright** for testing

## Privacy

All processing happens locally on your device. No data is collected, transmitted, or sold. Text transformations occur in-browser. See [Privacy Policy](docs/PRIVACY_POLICY.md).

## License

MIT
