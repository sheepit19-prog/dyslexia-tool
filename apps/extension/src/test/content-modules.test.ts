import { describe, it, expect, beforeEach, vi } from 'vitest'
import { companionState, setCompanionEnabled, resetCompanionState } from '../content/companion/state'
import { getCurrentWord, replaceCurrentWord } from '../content/companion/word-ops'

describe('companion state', () => {
  beforeEach(() => {
    companionState.companionEnabled = true
    companionState.backspaceCount = 0
    companionState.lastOfferTime = 0
    companionState.lastFullWord = null
    companionState.lastTypingTime = 0
    companionState.savedActiveElement = null
    companionState.currentTextField = null
  })

  it('initial state has expected defaults', () => {
    const fresh = {
      companionEnabled: true,
      backspaceCount: 0,
      lastOfferTime: 0,
      lastFullWord: null,
    }
    expect(companionState.companionEnabled).toBe(fresh.companionEnabled)
    expect(companionState.backspaceCount).toBe(fresh.backspaceCount)
    expect(companionState.lastOfferTime).toBe(fresh.lastOfferTime)
    expect(companionState.lastFullWord).toBe(fresh.lastFullWord)
  })

  it('setCompanionEnabled(false) disables companion', () => {
    setCompanionEnabled(false)
    expect(companionState.companionEnabled).toBe(false)
  })

  it('setCompanionEnabled(true) enables and resets lastOfferTime', () => {
    companionState.lastOfferTime = Date.now()
    companionState.backspaceCount = 5
    setCompanionEnabled(true)
    expect(companionState.companionEnabled).toBe(true)
    expect(companionState.lastOfferTime).toBe(0)
    expect(companionState.backspaceCount).toBe(0)
  })

  it('resetCompanionState resets counters and saved word', () => {
    companionState.backspaceCount = 10
    companionState.lastOfferTime = Date.now()
    companionState.lastFullWord = 'misspeled'
    resetCompanionState()
    expect(companionState.backspaceCount).toBe(0)
    expect(companionState.lastOfferTime).toBe(0)
    expect(companionState.lastFullWord).toBeNull()
  })
})

describe('word operations', () => {
  beforeEach(() => {
    companionState.savedActiveElement = null
    companionState.lastFullWord = null
  })

  it('getCurrentWord returns null when no active element and no saved element', () => {
    const div = document.createElement('div')
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(div)
    const result = getCurrentWord()
    expect(result).toBeNull()
    vi.restoreAllMocks()
  })

  it('replaceCurrentWord returns false when no valid active element', () => {
    const div = document.createElement('div')
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(div)
    const result = replaceCurrentWord('hello')
    expect(result).toBe(false)
    vi.restoreAllMocks()
  })
})

describe('notification UI DOM rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    companionState.lastOfferTime = 0
    companionState.backspaceCount = 0
    companionState.lastFullWord = null
    const existing = document.getElementById('dyslexia-tool-companion')
    if (existing) existing.remove()
  })

  it('showCompanionNotification creates panel appended to body', async () => {
    const { showCompanionNotification } = await import('../content/companion/notification-ui')
    showCompanionNotification({ message: 'Need help with spelling?' })

    const panel = document.getElementById('dyslexia-tool-companion')
    expect(panel).not.toBeNull()
    expect(panel?.parentElement).toBe(document.body)
  })

  it('panel contains the notification message text', async () => {
    const { showCompanionNotification } = await import('../content/companion/notification-ui')
    showCompanionNotification({ message: 'Need help with spelling?' })

    const panel = document.getElementById('dyslexia-tool-companion')
    expect(panel?.textContent).toContain('Need help with spelling?')
  })

  it('panel has Show suggestions and Not now buttons', async () => {
    const { showCompanionNotification } = await import('../content/companion/notification-ui')
    showCompanionNotification({ message: 'Test message' })

    const panel = document.getElementById('dyslexia-tool-companion')
    const buttons = panel?.querySelectorAll('button')
    expect(buttons?.length).toBeGreaterThanOrEqual(2)
    const texts = Array.from(buttons || []).map(b => b.textContent)
    expect(texts.some(t => t?.includes('Show suggestions') || t?.includes('Accept'))).toBe(true)
    expect(texts.some(t => t?.includes('Not now') || t?.includes('Dismiss'))).toBe(true)
  })

  it('clicking dismiss button removes the panel from DOM', async () => {
    vi.useFakeTimers()
    const { showCompanionNotification } = await import('../content/companion/notification-ui')
    showCompanionNotification({ message: 'Test message' })

    vi.advanceTimersByTime(20)

    const panel = document.getElementById('dyslexia-tool-companion')
    const dismissBtn = Array.from(panel?.querySelectorAll('button') || []).find(
      b => b.textContent?.includes('Not now')
    )
    expect(dismissBtn).toBeTruthy()
    dismissBtn?.click()
    expect(document.getElementById('dyslexia-tool-companion')).toBeNull()
    vi.useRealTimers()
  })
})
