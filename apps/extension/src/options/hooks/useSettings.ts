/**
 * Settings store hook using Zustand with auto-save to IndexedDB
 */

import { create } from 'zustand'
import { getSettings, saveSettings } from '../../background/storage'
import type { Settings } from '../../shared/types/storage'

const DEFAULT_SETTINGS: Settings = {
  id: 'global',
  fontEnabled: false,
  fontFamily: 'OpenDyslexic',
  lineSpacing: 1.6,
  letterSpacing: 0.05,
  bionicReadingEnabled: false,
  spellingEnabled: false,
  theme: 'light',
  accentColor: '#3B82F6',
  ttsSpeed: 1.0,
  analyticsEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SettingsState {
  settings: Settings
  loading: boolean
  saveStatus: SaveStatus
  init: () => Promise<void>
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: true,
  saveStatus: 'idle',

  init: async () => {
    try {
      const settings = await getSettings()
      set({ settings: settings || DEFAULT_SETTINGS, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  update: async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const { settings } = get()
    const updated = { ...settings, [key]: value }
    set({ settings: updated, saveStatus: 'saving' })

    try {
      await saveSettings({ [key]: value } as Partial<Settings>)
      set({ saveStatus: 'saved' })
      setTimeout(() => {
        const current = get()
        if (current.saveStatus === 'saved') {
          set({ saveStatus: 'idle' })
        }
      }, 2000)
    } catch {
      set({ saveStatus: 'error' })
    }
  }
}))

/**
 * Convenience hook for components that just need settings + update
 */
export function useSettings() {
  const settings = useSettingsStore((s) => s.settings)
  const loading = useSettingsStore((s) => s.loading)
  const update = useSettingsStore((s) => s.update)
  return { settings, loading, update }
}

/**
 * Selector for save status indicator
 */
export function useSaveStatus(): SaveStatus {
  return useSettingsStore((s) => s.saveStatus)
}
