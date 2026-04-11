/**
 * Options page root layout with sidebar + content area
 */

import React, { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { useSettingsStore, useSaveStatus } from './hooks/useSettings'

const SaveIndicator: React.FC = () => {
  const saveStatus = useSaveStatus()

  if (saveStatus === 'idle') return null

  return (
    <div
      className={`fixed right-6 top-6 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm transition-all duration-300 ${
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
        <div className="mx-auto max-w-2xl px-8 py-8">
          <SaveIndicator />
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              id={`section-${section.id}`}
              role="tabpanel"
              className={activeSection === section.id ? 'block' : 'hidden'}
            >
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                {section.label}
              </h2>
              <p className="text-sm text-gray-500">
                {section.label} settings will appear here.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
