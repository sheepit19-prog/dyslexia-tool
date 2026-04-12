import { useState } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

const TOTAL_STEPS = 3

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    await chrome.storage.local.set({ onboardingComplete: true })
    onComplete()
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleTryNow = async () => {
    await chrome.storage.local.set({ onboardingComplete: true })
    chrome.tabs.create({ url: 'https://en.wikipedia.org/wiki/Dyslexia' })
    onComplete()
  }

  const containerStyle: React.CSSProperties = {
    width: '400px',
    minHeight: '480px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  }

  const stepIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '24px 0 16px',
  }

  const dotStyle = (active: boolean, index: number): React.CSSProperties => ({
    width: index < currentStep ? '20px' : '8px',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: active ? '#3B82F6' : '#D1D5DB',
    transition: 'all 0.3s ease',
  })

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 32px',
  }

  const iconStyle: React.CSSProperties = {
    fontSize: '56px',
    marginBottom: '20px',
    lineHeight: 1,
  }

  const headingStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 12px',
    lineHeight: 1.3,
  }

  const descriptionStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#6B7280',
    lineHeight: 1.6,
    margin: 0,
  }

  const previewBoxStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#F3F4F6',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    textAlign: 'left',
    width: '100%',
    maxWidth: '300px',
  }

  const previewLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#9CA3AF',
    marginBottom: '8px',
    fontWeight: 500,
  }

  const previewTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#374151',
    lineHeight: 1.5,
    margin: 0,
  }

  const suggestionStyle: React.CSSProperties = {
    marginTop: '8px',
    fontSize: '13px',
    color: '#9CA3AF',
    lineHeight: 1.4,
  }

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '24px 32px',
    borderTop: '1px solid #F3F4F6',
  }

  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }

  const skipLinkStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '14px',
    color: '#9CA3AF',
    cursor: 'pointer',
    padding: '8px',
    textDecoration: 'underline',
    background: 'none',
    border: 'none',
    width: '100%',
  }

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <>
          <div style={iconStyle}>📖</div>
          <h2 style={headingStyle}>Let's make reading easier for you.</h2>
          <p style={descriptionStyle}>
            Dyslexia Tool helps you as you browse the web. It applies dyslexia-friendly fonts to pages you visit, offers gentle spelling suggestions while you type, and can read text aloud — all with no judgment.
          </p>
        </>
      )
    }

    if (currentStep === 2) {
      return (
        <>
          <div style={iconStyle}>💙</div>
          <h2 style={headingStyle}>A friend that notices when you need help</h2>
          <p style={descriptionStyle}>
            The companion watches for typing struggles — like repeated backspaces — and offers friendly spelling suggestions. It's subtle, supportive, and only appears when you want it.
          </p>
          <div style={previewBoxStyle}>
            <div style={previewLabelStyle}>As you type, you'll see suggestions like:</div>
            <p style={previewTextStyle}>Suggestions for <em>"becuase"</em>:</p>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <button style={{ padding: '4px 10px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'default' }}>
                because
              </button>
            </div>
            <p style={suggestionStyle}>Click to replace your word</p>
          </div>
        </>
      )
    }

    if (currentStep === 3) {
      return (
        <>
          <div style={iconStyle}>⚙️</div>
          <h2 style={headingStyle}>Customize your experience</h2>
          <p style={descriptionStyle}>
            Right-click the extension icon and choose <strong>Options</strong> anytime to adjust fonts, companion sensitivity, and more. Your settings sync automatically across all your devices.
          </p>
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px', width: '100%', maxWidth: '300px' }}>
            <div style={{ fontSize: '14px', color: '#374151', fontWeight: 500, marginBottom: '8px' }}>What you can customize:</div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#6B7280', lineHeight: 1.8, textAlign: 'left' }}>
              <li>Font family and spacing</li>
              <li>Companion sensitivity</li>
              <li>Reading ruler style</li>
              <li>Voice speed</li>
            </ul>
          </div>
        </>
      )
    }

    return null
  }

  const isLastStep = currentStep === TOTAL_STEPS

  return (
    <div style={containerStyle}>
      <div style={stepIndicatorStyle}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} style={dotStyle(i < currentStep, i)} />
        ))}
      </div>

      <div style={contentStyle}>
        {renderStep()}
      </div>

      <div style={actionsStyle}>
        <button
          onClick={isLastStep ? handleTryNow : handleNext}
          style={{
            ...primaryButtonStyle,
            backgroundColor: isLastStep ? '#10B981' : '#3B82F6',
            color: '#fff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isLastStep ? '#059669' : '#2563EB'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isLastStep ? '#10B981' : '#3B82F6'
          }}
        >
          {isLastStep ? 'Try it now' : 'Next'}
        </button>
        <button onClick={handleSkip} style={skipLinkStyle}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
