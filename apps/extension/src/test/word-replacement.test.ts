import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCurrentWordFromElement,
  replaceWordInElement,
} from '../shared/lib/companion-utils'

describe('getCurrentWordFromElement', () => {
  let input: HTMLInputElement

  beforeEach(() => {
    input = document.createElement('input')
    input.type = 'text'
    document.body.appendChild(input)
    input.focus()
  })

  it('returns null for empty input', () => {
    input.value = ''
    expect(getCurrentWordFromElement(input)).toBeNull()
  })

  it('returns the word at cursor position', () => {
    input.value = 'hello world'
    input.selectionStart = 5
    input.selectionEnd = 5
    const result = getCurrentWordFromElement(input)
    expect(result).not.toBeNull()
    expect(result!.word).toBe('hello')
    expect(result!.start).toBe(0)
    expect(result!.end).toBe(5)
  })

  it('returns the last word when cursor is at end', () => {
    input.value = 'hello world'
    input.selectionStart = 11
    input.selectionEnd = 11
    const result = getCurrentWordFromElement(input)
    expect(result).not.toBeNull()
    expect(result!.word).toBe('world')
  })

  it('returns null when cursor is before any word', () => {
    input.value = '  hello'
    input.selectionStart = 0
    input.selectionEnd = 0
    const result = getCurrentWordFromElement(input)
    expect(result).toBeNull()
  })

  it('handles textarea elements', () => {
    const textarea = document.createElement('textarea')
    textarea.value = 'testing word'
    textarea.selectionStart = 7
    document.body.appendChild(textarea)
    const result = getCurrentWordFromElement(textarea)
    expect(result).not.toBeNull()
    expect(result!.word).toBe('testing')
  })

  it('handles contentEditable elements', () => {
    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')
    div.textContent = 'editable text'
    document.body.appendChild(div)
    div.focus()
    const result = getCurrentWordFromElement(div)
    expect(result).not.toBeNull()
    expect(result!.word).toBe('text')
  })
})

describe('replaceWordInElement', () => {
  let input: HTMLInputElement

  beforeEach(() => {
    input = document.createElement('input')
    input.type = 'text'
    document.body.appendChild(input)
    input.focus()
  })

  it('replaces the current word in an input', () => {
    input.value = 'teh cat'
    input.selectionStart = 3
    input.selectionEnd = 3
    const result = replaceWordInElement(input, 'the')
    expect(result).toBe(true)
    expect(input.value).toBe('the cat')
  })

  it('sets cursor position after replaced word', () => {
    input.value = 'hello world'
    input.selectionStart = 5
    input.selectionEnd = 5
    replaceWordInElement(input, 'greetings')
    expect(input.selectionStart).toBe(9)
    expect(input.selectionEnd).toBe(9)
  })

  it('dispatches an input event on replacement', () => {
    input.value = 'taht is'
    input.selectionStart = 4
    let eventFired = false
    input.addEventListener('input', () => { eventFired = true })
    replaceWordInElement(input, 'that')
    expect(eventFired).toBe(true)
  })

  it('returns false for empty input', () => {
    input.value = ''
    input.selectionStart = 0
    expect(replaceWordInElement(input, 'something')).toBe(false)
  })

  it('returns false for non-input elements like div', () => {
    const div = document.createElement('div')
    expect(replaceWordInElement(div, 'test')).toBe(false)
  })

  it('replaces word in textarea', () => {
    const textarea = document.createElement('textarea')
    textarea.value = 'becuase of you'
    textarea.selectionStart = 7
    document.body.appendChild(textarea)
    const result = replaceWordInElement(textarea, 'because')
    expect(result).toBe(true)
    expect(textarea.value).toBe('because of you')
  })
})
