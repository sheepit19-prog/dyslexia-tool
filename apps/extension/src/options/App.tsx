/**
 * Options page root layout with sidebar + content area
 */

import React, { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { GeneralSettings } from './components/GeneralSettings'
import { CompanionSettings } from './components/CompanionSettings'
import { NotesSettings } from './components/NotesSettings'
import { HotkeysSettings } from './components/HotkeysSettings'
import { PerSiteSettings } from './components/PerSiteSettings'
import { PrivacySettings } from './components/PrivacySettings'
import { useSettingsStore, useSaveStatus } from './hooks/useSettings'

const SaveIndicator: React.FC = () => {
  const saveStatus = useSaveStatus()

  if (saveStatus === 'idle') return null

  return (
    <div
      className={`fixed right-8 top-8 rounded-xl px-5 py-2.5 text-lg font-medium shadow-sm transition-all duration-300 ${
        saveStatus === 'saving'
          ? 'bg-blue-50 text-blue-600'
          : saveStatus === 'saved'
          ? 'bg-green-50 text-green-600'
          : 'bg-red-50 text-red-600'
      }`}
      role="status"
      aria-live="polite"
    >
      {saveStatus === 'saving' && 'Saving...'}
      {saveStatus === 'saved' && 'Saved ✓'}
      {saveStatus === 'error' && 'Save failed'}
    </div>
  )
}

const SECTIONS = [
  { id: 'general', label: 'General' },
  { id: 'companion', label: 'Companion' },
  { id: 'notes', label: 'Notes' },
  { id: 'hotkeys', label: 'Hotkeys' },
  { id: 'per-site', label: 'Per-Site' },
  { id: 'privacy', label: 'Privacy' }
] as const

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general')
  const init = useSettingsStore((s) => s.init)
  const loading = useSettingsStore((s) => s.loading)

  useEffect(() => {
    init()
  }, [init])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-10 py-10">
          <SaveIndicator />
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              id={`section-${section.id}`}
              role="tabpanel"
              className={activeSection === section.id ? 'block' : 'hidden'}
            >
              {section.id === 'general' && <GeneralSettings />}
              {section.id === 'companion' && <CompanionSettings />}
              {section.id === 'notes' && <NotesSettings />}
              {section.id === 'hotkeys' && <HotkeysSettings />}
              {section.id === 'per-site' && <PerSiteSettings />}
              {section.id === 'privacy' && <PrivacySettings />}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
