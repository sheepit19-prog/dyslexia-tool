import { Modal } from '../shared/Modal'
import { useSettingsStore, type ThemeMode, type FontChoice } from '../../stores/settingsStore'

interface SettingsProps {
  open: boolean
  onClose: () => void
}

export function Settings({ open, onClose }: SettingsProps) {
  const {
    font, letterSpacing, spellingSpeed, theme, accentColor,
    setFont, setLetterSpacing, setSpellingSpeed, setTheme, setAccentColor,
  } = useSettingsStore()

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-6">
        {/* Font */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Font</label>
          <div className="flex gap-2">
            {(['system', 'opendyslexic'] as FontChoice[]).map((f) => (
              <button
                key={f}
                onClick={() => setFont(f)}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  font === f
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface-dim text-on-surface border-border hover:bg-surface-bright'
                }`}
              >
                {f === 'system' ? 'System (Inter)' : 'OpenDyslexic'}
              </button>
            ))}
          </div>
        </div>

        {/* Letter Spacing */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Letter Spacing: {letterSpacing.toFixed(2)}em
          </label>
          <input
            type="range"
            min="0"
            max="0.3"
            step="0.01"
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>

        {/* Spelling Speed */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Spelling Speed: {spellingSpeed <= 50 ? 'Instant' : spellingSpeed <= 150 ? 'Fast' : spellingSpeed <= 400 ? 'Normal' : spellingSpeed <= 800 ? 'Slow' : 'Very Slow'}
          </label>
          <input
            type="range"
            min="0"
            max="1200"
            step="10"
            value={spellingSpeed}
            onChange={(e) => setSpellingSpeed(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-on-surface-muted mt-1">
            <span>Instant</span>
            <span>Very Slow</span>
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Theme</label>
          <div className="flex gap-2">
            {([
              { value: 'light' as ThemeMode, label: 'Light' },
              { value: 'dark' as ThemeMode, label: 'Dark' },
              { value: 'high-contrast' as ThemeMode, label: 'High Contrast' },
            ]).map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  theme === t.value
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface-dim text-on-surface border-border hover:bg-surface-bright'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-border"
            />
            <span className="text-sm text-on-surface-muted">{accentColor}</span>
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Detected Language</label>
          <p className="text-sm text-on-surface-muted">{navigator.language}</p>
        </div>
      </div>
    </Modal>
  )
}
