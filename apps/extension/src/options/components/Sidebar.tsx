/**
 * Sidebar navigation for options page categories
 */

import React from 'react'

interface SidebarProps {
  activeSection: string
  onSelect: (section: string) => void
}

const CATEGORIES = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'hotkeys', label: 'Hotkeys', icon: '⌨️' },
  { id: 'per-site', label: 'Per-Site', icon: '🌐' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' }
] as const

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelect }) => {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Settings categories">
        {CATEGORIES.map((cat) => {
          const isActive = activeSection === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex w-full items-center gap-4 rounded-lg px-4 py-3.5 text-left text-lg font-medium transition-colors ${
                isActive
                  ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xl" aria-hidden="true">
                {cat.icon}
              </span>
              {cat.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
