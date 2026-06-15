/**
 * PerSiteSettings - Per-site preference override management
 *
 * Shows all site-specific overrides as expandable cards.
 * Each card shows domain, non-null overrides, and allows
 * editing visual settings or removing the entire site entry.
 */

import React, { useCallback, useEffect, useState } from 'react'
import type { SitePreference } from '../../shared/types/storage'
import {
  getAllSitePreferences,
  saveSitePreference,
  deleteSitePreference
} from '../../background/storage/index'
import { Toggle } from './ui/Toggle'
import { Slider } from './ui/Slider'
import { Select } from './ui/Select'
import { FONT_FAMILY_OPTIONS } from '../../shared/fonts'

interface OverrideDisplay {
  label: string
  value: string
  key: keyof SitePreference
}

function getOverrides(preference: SitePreference): OverrideDisplay[] {
  const overrides: OverrideDisplay[] = []

  if (preference.fontEnabled !== null) {
    overrides.push({ label: 'Font Enabled', value: preference.fontEnabled ? 'Yes' : 'No', key: 'fontEnabled' })
  }
  if (preference.fontFamily !== null) {
    overrides.push({ label: 'Font', value: preference.fontFamily, key: 'fontFamily' })
  }
  if (preference.lineSpacing !== null) {
    overrides.push({ label: 'Line Spacing', value: preference.lineSpacing.toFixed(1), key: 'lineSpacing' })
  }
  if (preference.letterSpacing !== null) {
    overrides.push({ label: 'Letter Spacing', value: `${preference.letterSpacing.toFixed(2)}em`, key: 'letterSpacing' })
  }
  if (preference.theme !== null) {
    overrides.push({ label: 'Theme', value: preference.theme.charAt(0).toUpperCase() + preference.theme.slice(1), key: 'theme' })
  }

  return overrides
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
]

interface SiteCardProps {
  preference: SitePreference
  onUpdate: () => void
}

const SiteCard: React.FC<SiteCardProps> = ({ preference, onUpdate }) => {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editFontEnabled, setEditFontEnabled] = useState(preference.fontEnabled)
  const [editFontFamily, setEditFontFamily] = useState(preference.fontFamily)
  const [editLineSpacing, setEditLineSpacing] = useState(preference.lineSpacing)
  const [editLetterSpacing, setEditLetterSpacing] = useState(preference.letterSpacing)
  const [editTheme, setEditTheme] = useState(preference.theme)
  const [saving, setSaving] = useState(false)

  const overrides = getOverrides(preference)

  const handleResetField = async (key: keyof SitePreference) => {
    setSaving(true)
    try {
      const update: Partial<SitePreference> & { id: string } = { id: preference.id, [key]: null }
      await saveSitePreference(update)
      onUpdate()
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSitePreference({
        id: preference.id,
        fontEnabled: editFontEnabled,
        fontFamily: editFontFamily,
        lineSpacing: editLineSpacing,
        letterSpacing: editLetterSpacing,
        theme: editTheme
      })
      onUpdate()
      setExpanded(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await deleteSitePreference(preference.id)
    onUpdate()
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className="flex cursor-pointer items-center justify-between px-6 py-4"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded) }}
        aria-expanded={expanded}
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{preference.id}</h3>
          {overrides.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {overrides.map((o) => (
                <span key={o.key} className="inline-block rounded-full bg-blue-50 px-3 py-1 text-base text-blue-700">
                  {o.label}: {o.value}
                </span>
              ))}
            </div>
          )}
          {overrides.length === 0 && (
            <p className="mt-1 text-base text-gray-400">No overrides set</p>
          )}
        </div>
        <svg
          className={`h-6 w-6 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5 space-y-5">
          <div className="flex items-center justify-between">
            <label className="text-lg text-gray-700">Font Enabled</label>
            <div className="flex items-center gap-3">
              {preference.fontEnabled !== null && (
                <button
                  onClick={() => handleResetField('fontEnabled')}
                  className="text-base text-gray-400 hover:text-red-500"
                  disabled={saving}
                >
                  Reset
                </button>
              )}
              <Toggle
                label=""
                checked={editFontEnabled ?? false}
                onChange={(v: boolean) => setEditFontEnabled(v)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-lg text-gray-700">Font Family</label>
            <div className="flex items-center gap-3">
              {preference.fontFamily !== null && (
                <button
                  onClick={() => handleResetField('fontFamily')}
                  className="text-base text-gray-400 hover:text-red-500"
                  disabled={saving}
                >
                  Reset
                </button>
              )}
              <Select
                label=""
                value={editFontFamily ?? 'OpenDyslexic'}
                options={FONT_FAMILY_OPTIONS}
                onChange={(v: string) => setEditFontFamily(v as SitePreference['fontFamily'])}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-lg text-gray-700">Line Spacing</label>
            <div className="flex items-center gap-3">
              {preference.lineSpacing !== null && (
                <button
                  onClick={() => handleResetField('lineSpacing')}
                  className="text-base text-gray-400 hover:text-red-500"
                  disabled={saving}
                >
                  Reset
                </button>
              )}
              <Slider
                label=""
                value={editLineSpacing ?? 1.6}
                min={1.0}
                max={2.0}
                step={0.1}
                onChange={(v: number) => setEditLineSpacing(v)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-lg text-gray-700">Letter Spacing</label>
            <div className="flex items-center gap-3">
              {preference.letterSpacing !== null && (
                <button
                  onClick={() => handleResetField('letterSpacing')}
                  className="text-base text-gray-400 hover:text-red-500"
                  disabled={saving}
                >
                  Reset
                </button>
              )}
              <Slider
                label=""
                value={editLetterSpacing ?? 0.05}
                min={0}
                max={0.1}
                step={0.01}
                onChange={(v: number) => setEditLetterSpacing(v)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-lg text-gray-700">Theme</label>
            <div className="flex items-center gap-3">
              {preference.theme !== null && (
                <button
                  onClick={() => handleResetField('theme')}
                  className="text-base text-gray-400 hover:text-red-500"
                  disabled={saving}
                >
                  Reset
                </button>
              )}
              <Select
                label=""
                value={editTheme ?? 'system'}
                options={THEME_OPTIONS}
                onChange={(v: string) => setEditTheme(v as SitePreference['theme'])}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-500 px-5 py-2.5 text-lg font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-lg text-red-500 hover:text-red-700"
              >
                Remove all overrides for this site
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-base text-gray-500">Remove?</span>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-500 px-4 py-2 text-base text-white hover:bg-red-600"
                >
                  Yes, remove
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-base text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const PerSiteSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<SitePreference[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const all = await getAllSitePreferences()
      setPreferences(all)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Per-Site Preferences</h2>
          <p className="text-lg text-gray-500">Manage site-specific visual setting overrides.</p>
        </div>
        <div className="text-lg text-gray-500">Loading site preferences...</div>
      </div>
    )
  }

  if (preferences.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Per-Site Preferences</h2>
          <p className="text-lg text-gray-500">Manage site-specific visual setting overrides.</p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <p className="text-lg text-gray-500">No site-specific preferences.</p>
          <p className="mt-2 text-base text-gray-400">
            You can add per-site overrides from the extension popup.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Per-Site Preferences</h2>
        <p className="text-lg text-gray-500">Manage site-specific visual setting overrides.</p>
      </div>
      <div className="space-y-4">
        {preferences.map((pref) => (
          <SiteCard key={pref.id} preference={pref} onUpdate={refresh} />
        ))}
      </div>
    </div>
  )
}
