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
  { id: 'companion', label: 'Companion', icon: '🤝' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'hotkeys', label: 'Hotkeys', icon: '⌨️' },
  { id: 'per-site', label: 'Per-Site', icon: '🌐' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' }
] as const

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelect }) => {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="px-5 py-6">
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
      </div>
      <nav className="flex-1 space-y-0.5 px-2" aria-label="Settings categories">
        {CATEGORIES.map((cat) => {
          const isActive = activeSection === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive
                  ? 'border-l-[3px] border-blue-500 bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-base" aria-hidden="true">
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
