/**
 * FeatureToolbar — toggle buttons for all four reading features.
 *
 * Each button has an active/inactive visual state, mirroring the popup's
 * toggle pattern.  The toolbar reads initial states from Dexie settings
 * on mount and notifies the parent via `onFeatureToggle` when a toggle
 * changes.
 */

import { useCallback, useEffect, useState } from 'react'
import { getSettings } from '../../background/storage'
import type { Settings } from '../../shared/types/storage'
import { speakSelection, stopSpeaking } from '../features/tts'

export interface FeatureState {
  enabled: boolean
  label: string
  activeColor: string // Tailwind accent class for the active state
}

export interface ReaderFeatures {
  font: FeatureState
  bionic: FeatureState
  tts: FeatureState
  ruler: FeatureState
}

export interface FeatureToolbarProps {
  /** Current feature state — driven by parent. */
  features: ReaderFeatures
  /** Called when any feature toggle changes. */
  onFeatureToggle: (feature: keyof ReaderFeatures, enabled: boolean) => void
  /** Optional: current font family from settings (read initially). */
  fontFamily?: Settings['fontFamily']
  /** Optional: TTS speed from settings. */
  ttsSpeed?: number
}

const FEATURE_KEYS: Array<{ key: keyof ReaderFeatures; icon: string; tooltip: string }> = [
  { key: 'font', icon: 'Aa', tooltip: 'Toggle dyslexia font' },
  { key: 'bionic', icon: 'B', tooltip: 'Toggle bionic reading' },
  { key: 'tts', icon: '♪', tooltip: 'Read selected text aloud' },
  { key: 'ruler', icon: '≡', tooltip: 'Toggle reading ruler' },
]

const ACTIVE_COLORS: Record<keyof ReaderFeatures, string> = {
  font: 'bg-blue-500 text-white border-blue-500',
  bionic: 'bg-amber-500 text-white border-amber-500',
  tts: 'bg-green-500 text-white border-green-500',
  ruler: 'bg-purple-500 text-white border-purple-500',
}

const INACTIVE_COLORS = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'

/**
 * Toolbar component that renders toggle buttons for the four reading features:
 * font switching, bionic reading, text-to-speech, and reading ruler.
 *
 * Initializes feature states from Dexie settings on mount.
 * TTS button triggers `speakSelection()` / `stopSpeaking()` directly.
 */
export function FeatureToolbar({
  features,
  onFeatureToggle,
  fontFamily,
  ttsSpeed = 1.0,
}: FeatureToolbarProps) {
  const [ttsActive, setTtsActive] = useState(false)

  // Clean up TTS state when utterance ends
  useEffect(() => {
    const synth = window.speechSynthesis

    // Poll for ended state since onend can be unreliable in some browsers
    const interval = setInterval(() => {
      if (!synth.speaking && ttsActive) {
        setTtsActive(false)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [ttsActive])

  const handleToggle = useCallback(
    (feature: keyof ReaderFeatures) => {
      if (feature === 'tts') {
        // TTS is a momentary action, not a persistent toggle
        if (ttsActive) {
          stopSpeaking()
          setTtsActive(false)
        } else {
          const utterance = speakSelection(ttsSpeed)
          if (utterance) {
            setTtsActive(true)
            utterance.onend = () => setTtsActive(false)
            utterance.onerror = () => setTtsActive(false)
          }
        }
        onFeatureToggle('tts', !ttsActive)
        return
      }

      onFeatureToggle(feature, !features[feature].enabled)
    },
    [features, onFeatureToggle, ttsActive, ttsSpeed],
  )

  return (
    <div
      className="flex items-center gap-2"
      role="toolbar"
      aria-label="Reading features"
      data-testid="feature-toolbar"
    >
      {FEATURE_KEYS.map(({ key, icon, tooltip }) => {
        const isActive = key === 'tts' ? ttsActive : features[key].enabled
        const colorClass = isActive ? ACTIVE_COLORS[key] : INACTIVE_COLORS

        return (
          <button
            key={key}
            onClick={() => handleToggle(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:opacity-85 ${colorClass}`}
            title={tooltip}
            aria-label={tooltip}
            aria-pressed={isActive}
            data-testid={`feature-toggle-${key}`}
          >
            <span className="text-base leading-none">{icon}</span>
            <span className="hidden sm:inline">
              {key === 'font'
                ? fontFamily ?? 'Font'
                : key === 'bionic'
                  ? 'Bionic'
                  : key === 'tts'
                    ? isActive
                      ? 'Stop'
                      : 'Speak'
                    : 'Ruler'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Helper hook to load initial feature states from Dexie settings.
 *
 * Reads the global Settings record from IndexedDB on mount and returns
 * the relevant feature flags and preferences.  Loading state reflects
 * whether the async read has completed.
 */
export function useInitialFeatureStates() {
  const [features, setFeatures] = useState<{
    fontEnabled: boolean
    bionicEnabled: boolean
    fontFamily: Settings['fontFamily']
    ttsSpeed: number
    theme: Settings['theme']
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await getSettings()
        if (settings) {
          setFeatures({
            fontEnabled: settings.fontEnabled,
            bionicEnabled: settings.bionicReadingEnabled,
            fontFamily: settings.fontFamily,
            ttsSpeed: settings.ttsSpeed,
            theme: settings.theme,
          })
        } else {
          // No settings yet — use defaults
          setFeatures({
            fontEnabled: false,
            bionicEnabled: false,
            fontFamily: 'Helvetica',
            ttsSpeed: 1.0,
            theme: 'light',
          })
        }
      } catch {
        setFeatures({
          fontEnabled: false,
          bionicEnabled: false,
          fontFamily: 'Helvetica',
          ttsSpeed: 1.0,
          theme: 'light',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { features, loading }
}
