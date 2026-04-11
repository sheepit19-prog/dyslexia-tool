/**
 * HotkeysSettings - Displays current keyboard shortcuts
 *
 * Shows a table of registered Chrome extension commands with their
 * keyboard shortcuts. Read-only reference with link to Chrome's
 * native shortcut editor.
 */

import React, { useEffect, useState } from 'react'

interface ChromeCommand {
  name?: string
  description?: string
  shortcut?: string
}

export const HotkeysSettings: React.FC = () => {
  const [commands, setCommands] = useState<ChromeCommand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.commands) {
      chrome.commands.getAll((cmds: ChromeCommand[]) => {
        setCommands(cmds || [])
        setLoading(false)
      })
    } else {
      // Dev/fallback: show manifest commands
      setCommands([
        { name: 'toggle-font', description: 'Toggle dyslexia font', shortcut: 'Ctrl+Shift+F' },
        { name: 'read-aloud', description: 'Read selected text aloud', shortcut: 'Ctrl+Shift+R' },
        { name: 'toggle-companion', description: 'Toggle companion mode', shortcut: 'Ctrl+Shift+C' },
        { name: 'toggle-reading-ruler', description: 'Toggle reading ruler', shortcut: 'Ctrl+Shift+L' }
      ])
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div className="text-sm text-gray-500">Loading shortcuts...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
        <p className="text-sm text-gray-500">View and manage your keyboard shortcuts for quick access to features.</p>
      </div>

      {/* Shortcuts table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-700">Action</th>
              <th className="px-4 py-3 font-medium text-gray-700">Keyboard Shortcut</th>
            </tr>
          </thead>
          <tbody>
            {commands.map((cmd) => (
              <tr key={cmd.name || Math.random()} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-800">
                  {cmd.description || cmd.name || 'Unknown'}
                </td>
                <td className="px-4 py-3">
                  {cmd.shortcut ? (
                    <kbd className="inline-block rounded border border-gray-300 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700 shadow-sm">
                      {cmd.shortcut}
                    </kbd>
                  ) : (
                    <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                      Not set
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {commands.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-gray-400">
                  No keyboard shortcuts registered
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Chrome shortcuts page instruction */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Change shortcuts:</span> Open{' '}
          <code className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-mono">
            chrome://extensions/shortcuts
          </code>{' '}
          in your browser to customize keyboard shortcuts for this extension.
        </p>
      </div>
    </div>
  )
}
