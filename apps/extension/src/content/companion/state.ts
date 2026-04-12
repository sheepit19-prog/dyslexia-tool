export const companionState = {
  lastTypingTime: 0,
  backspaceCount: 0,
  companionEnabled: true,
  lastOfferTime: 0,
  lastFullWord: null as string | null,
  savedActiveElement: null as HTMLElement | null,
  currentTextField: null as HTMLElement | null,
  keydownHandler: null as ((e: KeyboardEvent) => void) | null,
  pauseCheckInterval: null as number | null,
}

export function setCompanionEnabled(enabled: boolean) {
  companionState.companionEnabled = enabled
  if (enabled) {
    companionState.lastOfferTime = 0
    companionState.backspaceCount = 0
  }
}

export function resetCompanionState() {
  companionState.backspaceCount = 0
  companionState.lastOfferTime = 0
  companionState.lastFullWord = null
}
