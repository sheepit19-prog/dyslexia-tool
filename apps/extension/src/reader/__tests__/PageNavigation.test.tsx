import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { PageNavigation } from '../components/PageNavigation'

describe('PageNavigation', () => {
  let onPageChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onPageChange = vi.fn()
    vi.clearAllMocks()
  })

  it('renders prev/next buttons and page display for a multi-page doc', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={3} totalPages={10} onPageChange={onPageChange} />,
    )

    expect(getByTestId('prev-page')).toBeDefined()
    expect(getByTestId('next-page')).toBeDefined()
    expect(getByTestId('page-input')).toBeDefined()
    expect(getByTestId('page-input').getAttribute('value')).toBe('3')
    expect(getByTestId('page-navigation')!.textContent).toContain('/ 10')
  })

  // ── Prev / Next ──────────────────────────────────────────

  it('calls onPageChange with prev page when Prev is clicked', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={3} totalPages={10} onPageChange={onPageChange} />,
    )

    fireEvent.click(getByTestId('prev-page'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with next page when Next is clicked', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={3} totalPages={10} onPageChange={onPageChange} />,
    )

    fireEvent.click(getByTestId('next-page'))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('disables prev button on page 1', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={1} totalPages={10} onPageChange={onPageChange} />,
    )

    const prev = getByTestId('prev-page') as HTMLButtonElement
    expect(prev.disabled).toBe(true)

    fireEvent.click(prev)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('disables next button on last page', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={10} totalPages={10} onPageChange={onPageChange} />,
    )

    const next = getByTestId('next-page') as HTMLButtonElement
    expect(next.disabled).toBe(true)

    fireEvent.click(next)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  // ── Page input ────────────────────────────────────────────

  it('jumps to the entered page on Enter key', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={1} totalPages={20} onPageChange={onPageChange} />,
    )

    const input = getByTestId('page-input')
    fireEvent.change(input, { target: { value: '7' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onPageChange).toHaveBeenCalledWith(7)
  })

  it('clamps page value > totalPages to last page', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={1} totalPages={5} onPageChange={onPageChange} />,
    )

    const input = getByTestId('page-input')
    fireEvent.change(input, { target: { value: '99' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onPageChange).toHaveBeenCalledWith(5)
  })

  it('clamps non-numeric or empty input to page 1', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={3} totalPages={10} onPageChange={onPageChange} />,
    )

    const input = getByTestId('page-input')
    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('clamps zero or negative input to page 1', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={1} totalPages={10} onPageChange={onPageChange} />,
    )

    const input = getByTestId('page-input')
    fireEvent.change(input, { target: { value: '-5' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('commits page on blur', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={1} totalPages={20} onPageChange={onPageChange} />,
    )

    const input = getByTestId('page-input')
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.blur(input)

    expect(onPageChange).toHaveBeenCalledWith(12)
  })

  // ── Keyboard shortcuts ────────────────────────────────────

  it('navigates to previous page on ArrowLeft', () => {
    render(
      <PageNavigation currentPage={5} totalPages={10} onPageChange={onPageChange} />,
    )

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('navigates to next page on ArrowRight', () => {
    render(
      <PageNavigation currentPage={5} totalPages={10} onPageChange={onPageChange} />,
    )

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onPageChange).toHaveBeenCalledWith(6)
  })

  it('does not navigate on ArrowLeft when on page 1', () => {
    render(
      <PageNavigation currentPage={1} totalPages={10} onPageChange={onPageChange} />,
    )

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('does not navigate on ArrowRight when on last page', () => {
    render(
      <PageNavigation currentPage={10} totalPages={10} onPageChange={onPageChange} />,
    )

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('does not capture arrow keys when page input is focused', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={5} totalPages={10} onPageChange={onPageChange} />,
    )

    const input = getByTestId('page-input') as HTMLInputElement
    // Use native focus to ensure document.activeElement is set in jsdom
    input.focus()
    expect(document.activeElement).toBe(input)

    fireEvent.keyDown(window, { key: 'ArrowRight' })

    expect(onPageChange).not.toHaveBeenCalled()
  })

  // ── Single-page documents ─────────────────────────────────

  it('disables both prev and next for single-page PDFs', () => {
    const { getByTestId } = render(
      <PageNavigation currentPage={1} totalPages={1} onPageChange={onPageChange} />,
    )

    expect((getByTestId('prev-page') as HTMLButtonElement).disabled).toBe(true)
    expect((getByTestId('next-page') as HTMLButtonElement).disabled).toBe(true)
  })
})
