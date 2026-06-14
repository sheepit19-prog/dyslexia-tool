import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import {
  FontSizeControl,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_STEP,
} from '../components/FontSizeControl'

describe('FontSizeControl', () => {
  it('shows the current size', () => {
    const { getByTestId } = render(
      <FontSizeControl value={22} onChange={() => {}} />,
    )
    expect(getByTestId('font-size-value').textContent).toBe('22px')
  })

  it('increases by one step', () => {
    const onChange = vi.fn()
    const { getByLabelText } = render(
      <FontSizeControl value={22} onChange={onChange} />,
    )
    fireEvent.click(getByLabelText('Increase text size'))
    expect(onChange).toHaveBeenCalledWith(22 + FONT_SIZE_STEP)
  })

  it('decreases by one step', () => {
    const onChange = vi.fn()
    const { getByLabelText } = render(
      <FontSizeControl value={22} onChange={onChange} />,
    )
    fireEvent.click(getByLabelText('Decrease text size'))
    expect(onChange).toHaveBeenCalledWith(22 - FONT_SIZE_STEP)
  })

  it('clamps at the maximum and disables the increase button', () => {
    const onChange = vi.fn()
    const { getByLabelText } = render(
      <FontSizeControl value={FONT_SIZE_MAX} onChange={onChange} />,
    )
    const inc = getByLabelText('Increase text size') as HTMLButtonElement
    expect(inc.disabled).toBe(true)
    fireEvent.click(inc)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clamps at the minimum and disables the decrease button', () => {
    const onChange = vi.fn()
    const { getByLabelText } = render(
      <FontSizeControl value={FONT_SIZE_MIN} onChange={onChange} />,
    )
    const dec = getByLabelText('Decrease text size') as HTMLButtonElement
    expect(dec.disabled).toBe(true)
    fireEvent.click(dec)
    expect(onChange).not.toHaveBeenCalled()
  })
})
