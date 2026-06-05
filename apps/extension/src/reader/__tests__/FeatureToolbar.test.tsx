import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { FeatureToolbar } from '../components/FeatureToolbar'
import type { ReaderFeatures } from '../components/FeatureToolbar'

// Mock the TTS module
vi.mock('../features/tts', () => ({
  speakSelection: vi.fn(),
  stopSpeaking: vi.fn(),
}))

const mockFeatures: ReaderFeatures = {
  font: { enabled: false, label: 'Font', activeColor: 'bg-blue-500' },
  bionic: { enabled: false, label: 'Bionic', activeColor: 'bg-amber-500' },
  tts: { enabled: false, label: 'TTS', activeColor: 'bg-green-500' },
  ruler: { enabled: false, label: 'Ruler', activeColor: 'bg-purple-500' },
}

describe('FeatureToolbar', () => {
  let onFeatureToggle: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onFeatureToggle = vi.fn()
    vi.clearAllMocks()
  })

  it('renders all four feature toggle buttons', () => {
    const { getByTestId } = render(
      <FeatureToolbar features={mockFeatures} onFeatureToggle={onFeatureToggle} />,
    )

    expect(getByTestId('feature-toolbar')).toBeDefined()
    expect(getByTestId('feature-toggle-font')).toBeDefined()
    expect(getByTestId('feature-toggle-bionic')).toBeDefined()
    expect(getByTestId('feature-toggle-tts')).toBeDefined()
    expect(getByTestId('feature-toggle-ruler')).toBeDefined()
  })

  it('shows all buttons with inactive styling initially', () => {
    const { getByTestId } = render(
      <FeatureToolbar features={mockFeatures} onFeatureToggle={onFeatureToggle} />,
    )

    const fontBtn = getByTestId('feature-toggle-font')
    const bionicBtn = getByTestId('feature-toggle-bionic')
    const rulerBtn = getByTestId('feature-toggle-ruler')

    expect(fontBtn.className).not.toContain('bg-blue-500')
    expect(bionicBtn.className).not.toContain('bg-amber-500')
    expect(rulerBtn.className).not.toContain('bg-purple-500')
  })

  it('calls onFeatureToggle with enabled=true when font is toggled', () => {
    const { getByTestId } = render(
      <FeatureToolbar features={mockFeatures} onFeatureToggle={onFeatureToggle} />,
    )

    fireEvent.click(getByTestId('feature-toggle-font'))
    expect(onFeatureToggle).toHaveBeenCalledWith('font', true)
  })

  it('calls onFeatureToggle with enabled=false when active font is toggled off', () => {
    const features = {
      ...mockFeatures,
      font: { ...mockFeatures.font, enabled: true },
    }
    const { getByTestId } = render(
      <FeatureToolbar features={features} onFeatureToggle={onFeatureToggle} />,
    )

    fireEvent.click(getByTestId('feature-toggle-font'))
    expect(onFeatureToggle).toHaveBeenCalledWith('font', false)
  })

  it('shows active visual state when a feature is enabled', () => {
    const features = {
      ...mockFeatures,
      font: { ...mockFeatures.font, enabled: true },
      bionic: { ...mockFeatures.bionic, enabled: true },
      ruler: { ...mockFeatures.ruler, enabled: true },
    }
    const { getByTestId } = render(
      <FeatureToolbar features={features} onFeatureToggle={onFeatureToggle} />,
    )

    expect(getByTestId('feature-toggle-font').className).toContain('bg-blue-500')
    expect(getByTestId('feature-toggle-bionic').className).toContain('bg-amber-500')
    expect(getByTestId('feature-toggle-ruler').className).toContain('bg-purple-500')
  })

  it('renders correct label text on buttons', () => {
    const { getByTestId } = render(
      <FeatureToolbar features={mockFeatures} onFeatureToggle={onFeatureToggle} fontFamily="OpenDyslexic" />,
    )

    expect(getByTestId('feature-toggle-font').textContent).toContain('OpenDyslexic')
    expect(getByTestId('feature-toggle-bionic').textContent).toContain('Bionic')
    expect(getByTestId('feature-toggle-ruler').textContent).toContain('Ruler')
  })

  it('shows "Speak" label on TTS button when not active', () => {
    const { getByTestId } = render(
      <FeatureToolbar features={mockFeatures} onFeatureToggle={onFeatureToggle} />,
    )

    expect(getByTestId('feature-toggle-tts').textContent).toContain('Speak')
  })

  it('calls onFeatureToggle for bionic reading toggle', () => {
    const { getByTestId } = render(
      <FeatureToolbar features={mockFeatures} onFeatureToggle={onFeatureToggle} />,
    )

    fireEvent.click(getByTestId('feature-toggle-bionic'))
    expect(onFeatureToggle).toHaveBeenCalledWith('bionic', true)
  })

  it('calls onFeatureToggle for ruler toggle', () => {
    const { getByTestId } = render(
      <FeatureToolbar features={mockFeatures} onFeatureToggle={onFeatureToggle} />,
    )

    fireEvent.click(getByTestId('feature-toggle-ruler'))
    expect(onFeatureToggle).toHaveBeenCalledWith('ruler', true)
  })

  it('calls onFeatureToggle for TTS toggle', () => {
    const { getByTestId } = render(
      <FeatureToolbar features={mockFeatures} onFeatureToggle={onFeatureToggle} />,
    )

    fireEvent.click(getByTestId('feature-toggle-tts'))
    expect(onFeatureToggle).toHaveBeenCalledWith('tts', true)
  })

  it('has correct aria-pressed states', () => {
    const features = {
      ...mockFeatures,
      font: { ...mockFeatures.font, enabled: true },
    }
    const { getByTestId } = render(
      <FeatureToolbar features={features} onFeatureToggle={onFeatureToggle} />,
    )

    expect(getByTestId('feature-toggle-font').getAttribute('aria-pressed')).toBe('true')
    expect(getByTestId('feature-toggle-bionic').getAttribute('aria-pressed')).toBe('false')
  })

  it('has proper toolbar role and label', () => {
    const { getByTestId } = render(
      <FeatureToolbar features={mockFeatures} onFeatureToggle={onFeatureToggle} />,
    )

    const toolbar = getByTestId('feature-toolbar')
    expect(toolbar.getAttribute('role')).toBe('toolbar')
    expect(toolbar.getAttribute('aria-label')).toBe('Reading features')
  })
})
