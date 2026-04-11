/**
 * PrivacySettings - Data export, nuclear delete, and storage stats
 *
 * Shows storage usage breakdown, allows exporting all data as JSON,
 * and provides a nuclear delete option requiring typed confirmation.
 */

import React, { useEffect, useRef, useState } from 'react'
import { getDB, getStorageStats, initializeStorage } from '../../background/storage/index'

interface StorageStats {
  notes: number
  sitePreferences: number
  analytics: number
}

export const PrivacySettings: React.FC = () => {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const deleteInputRef = useRef<HTMLInputElement>(null)

  const refreshStats = async () => {
    try {
      const s = await getStorageStats()
      setStats(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStats()
  }, [])

  useEffect(() => {
    if (showDelete && deleteInputRef.current) {
      deleteInputRef.current.focus()
    }
  }, [showDelete])

  // Export all data as JSON
  const handleExport = async () => {
    setExporting(true)
    try {
      const db = getDB()

      const [settings, notes, sitePreferences, analytics] = await Promise.all([
        db.settings.toArray(),
        db.notes.toArray().then((n) =>
          // Strip audioBlob from notes (too large for JSON export)
          n.map(({ audioBlob: _audioBlob, ...rest }) => ({
            ...rest,
            audioBlob: '[excluded - audio data]'
          }))
        ),
        db.sitePreferences.toArray(),
        db.analytics.toArray()
      ])

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        settings,
        notes,
        sitePreferences,
        analytics
      }

      const json = JSON.stringify(exportData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })

      // Trigger download
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      const date = new Date().toISOString().split('T')[0]
      anchor.download = `dyslexia-tool-export-${date}.json`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  // Nuclear delete
  const handleDelete = async () => {
    if (deleteInput.toUpperCase() !== 'DELETE') return

    setDeleting(true)
    try {
      const db = getDB()
      await Promise.all([
        db.settings.clear(),
        db.notes.clear(),
        db.sitePreferences.clear(),
        db.analytics.clear()
      ])
      await initializeStorage()
      window.location.reload()
    } finally {
      setDeleting(false)
    }
  }

  // Live match progress for DELETE confirmation
  const getMatchProgress = () => {
    const target = 'DELETE'
    const input = deleteInput.toUpperCase()
    if (input.length === 0) return { matched: 0, text: '', complete: false }

    let matched = 0
    for (let i = 0; i < input.length && i < target.length; i++) {
      if (input[i] === target[i]) {
        matched++
      } else {
        break
      }
    }

    const text = target.slice(0, matched) + (matched < input.length ? ' ✗' : matched < target.length ? '...' : ' ✓')
    return { matched, text, complete: matched === target.length && input.length === target.length }
  }

  const matchProgress = getMatchProgress()

  return (
    <div className="space-y-10">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Privacy &amp; Data</h2>
        <p className="text-lg text-gray-500">Manage your data, export it, or delete everything.</p>
      </div>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-700">Storage Usage</h3>
        {loading ? (
          <p className="text-lg text-gray-500">Loading storage stats...</p>
        ) : stats ? (
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Notes</span>
              <span className="font-semibold text-gray-900">{stats.notes} item{stats.notes !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Site Preferences</span>
              <span className="font-semibold text-gray-900">{stats.sitePreferences} item{stats.sitePreferences !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Analytics entries</span>
              <span className="font-semibold text-gray-900">{stats.analytics} item{stats.analytics !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-700">Export Data</h3>
        <p className="mb-4 text-base text-gray-500">
          Download all your data as a JSON file. Audio recordings are excluded from the export.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-lg bg-blue-500 px-6 py-3 text-lg font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export My Data'}
        </button>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-700">Delete All Data</h3>
        <p className="mb-4 text-base text-gray-500">
          Permanently delete all your data including notes, preferences, and analytics. This action cannot be undone.
        </p>
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-lg border-2 border-red-300 bg-white px-6 py-3 text-lg font-medium text-red-600 hover:bg-red-50"
          >
            Delete All Data
          </button>
        ) : (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 space-y-4">
            <p className="text-lg font-semibold text-red-800">
              Type DELETE to confirm permanent data deletion
            </p>
            <input
              ref={deleteInputRef}
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full max-w-sm rounded-lg border border-red-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              autoComplete="off"
            />
            {deleteInput.length > 0 && (
              <div className="text-lg font-mono">
                <span className={matchProgress.complete ? 'text-green-600 font-bold' : 'text-gray-600'}>
                  {matchProgress.text}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={handleDelete}
                disabled={!matchProgress.complete || deleting}
                className="rounded-lg bg-red-600 px-6 py-3 text-lg font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete All Data'}
              </button>
              <button
                onClick={() => { setShowDelete(false); setDeleteInput('') }}
                disabled={deleting}
                className="rounded-lg bg-white px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
