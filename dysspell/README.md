# DysSpell

A speech-powered spelling assistant for dyslexic users. Say a word — DysSpell spells it back letter by letter with clear pronunciation and visual highlighting. Includes voice note recording and transcription.

## How It Works

1. **Tap the microphone** and say any word
2. DysSpell captures your speech and shows the word
3. Tap **Spell** to hear each letter spoken clearly with animated highlighting
4. Review, copy to clipboard, or try another word

Voice notes are saved locally in your browser — nothing leaves your device.

## Features

- **Speech-to-Spell** — voice recognition captures your word, then spells it letter by letter
- **Adjustable Speed** — control how fast letters are spoken (instant to very slow)
- **Letter Highlighting** — animated visual tracking shows which letter is being spoken
- **Voice Notes** — record, transcribe, and tag audio notes
- **Accessibility-First** — OpenDyslexic font, dark mode, high contrast theme
- **Local Storage** — all data stays in IndexedDB on your device

## Development

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7**
- **Tailwind CSS 4**
- **Framer Motion** for animations
- **Zustand** for state management
- **Web Speech API** (SpeechRecognition + SpeechSynthesis)
- **date-fns** for date formatting

## Privacy

All speech processing uses the browser's built-in Web Speech API. Voice notes and preferences are stored locally in IndexedDB. No data is ever transmitted to external servers.

## License

MIT
