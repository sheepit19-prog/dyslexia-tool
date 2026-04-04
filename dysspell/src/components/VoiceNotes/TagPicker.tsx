import { useState } from 'react'
import { PREDEFINED_TAGS, getTagColor, useNotesStore } from '../../stores/notesStore'

interface TagPickerProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

export function TagPicker({ selectedTags, onChange }: TagPickerProps) {
  const [newTag, setNewTag] = useState('')
  const customTags = useNotesStore((s) => s.customTags)
  const addCustomTag = useNotesStore((s) => s.addCustomTag)

  const allTags = [...PREDEFINED_TAGS, ...customTags]

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  function handleAddCustom() {
    const tag = newTag.trim()
    if (tag && !allTags.includes(tag)) {
      addCustomTag(tag)
      onChange([...selectedTags, tag])
      setNewTag('')
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-on-surface mb-2">Tags</label>
      <div className="flex gap-2 flex-wrap mb-3">
        {allTags.map((tag) => {
          const active = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                active
                  ? 'text-white border-transparent'
                  : 'text-on-surface border-border bg-surface-dim hover:bg-surface-bright'
              }`}
              style={active ? { backgroundColor: getTagColor(tag) } : undefined}
            >
              {tag}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          placeholder="Add custom tag..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-surface-dim border border-border text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          onClick={handleAddCustom}
          disabled={!newTag.trim()}
          className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  )
}
