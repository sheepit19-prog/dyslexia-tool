export interface FontSizeControlProps {
  /** Current reading text size in px. */
  value: number
  /** Called with the new (clamped) size when the user steps it. */
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
}

export const FONT_SIZE_MIN = 14
export const FONT_SIZE_MAX = 40
export const FONT_SIZE_STEP = 2

const BTN =
  'flex items-center justify-center w-8 h-8 rounded-lg border text-gray-700 dark:text-gray-200 ' +
  'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 ' +
  'hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity'

/**
 * A−/A+ stepper that adjusts the reading-mode text size. Purely controlled —
 * the parent owns the value and its persistence.
 */
export function FontSizeControl({
  value,
  onChange,
  min = FONT_SIZE_MIN,
  max = FONT_SIZE_MAX,
  step = FONT_SIZE_STEP,
}: FontSizeControlProps) {
  const decrease = () => onChange(Math.max(min, value - step))
  const increase = () => onChange(Math.min(max, value + step))

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Reading text size"
      data-testid="font-size-control"
    >
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        className={BTN}
        aria-label="Decrease text size"
        title="Decrease text size"
      >
        <span className="text-xs font-semibold">A</span>
      </button>
      <span
        className="min-w-[3rem] text-center text-sm tabular-nums text-gray-600 dark:text-gray-300"
        data-testid="font-size-value"
        aria-live="polite"
      >
        {value}px
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        className={BTN}
        aria-label="Increase text size"
        title="Increase text size"
      >
        <span className="text-lg font-semibold">A</span>
      </button>
    </div>
  )
}
