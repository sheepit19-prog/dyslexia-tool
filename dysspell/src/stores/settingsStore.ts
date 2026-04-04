import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'high-contrast'
export type FontChoice = 'system' | 'opendyslexic'

interface SettingsState {
  font: FontChoice
  letterSpacing: number // 0 to 0.3 em
  spellingSpeed: number // ms between letters, 100-1500
  theme: ThemeMode
  accentColor: string // hex
  setFont: (font: FontChoice) => void
  setLetterSpacing: (spacing: number) => void
  setSpellingSpeed: (speed: number) => void
  setTheme: (theme: ThemeMode) => void
  setAccentColor: (color: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      font: 'system',
      letterSpacing: 0.05,
      spellingSpeed: 200,  // Default: Quick (clearer letter sounds)
      theme: 'light',
      accentColor: '#7c5cbf',
      setFont: (font) => set({ font }),
      setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
      setSpellingSpeed: (spellingSpeed) => set({ spellingSpeed }),
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
    }),
    { name: 'dysspell-settings' }
  )
)
