/**
 * Shared storage types
 */

export interface Settings {
  id: 'global'
  fontEnabled: boolean
  fontFamily: 'Helvetica' | 'OpenDyslexic' | 'Lexend' | 'Atkinson Hyperlegible' | 'Arial' | 'Verdana' | 'system'
  lineSpacing: number // 1.0 - 2.0
  letterSpacing: number // 0 - 0.1em
  bionicReadingEnabled: boolean
  spellingEnabled: boolean
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  ttsSpeed: number // 0.5 - 2.0
  analyticsEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string // UUID
  title: string | null
  audioBlob: Blob
  duration: number // seconds
  transcript: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface SitePreference {
  id: string // domain name
  fontEnabled: boolean | null // null = use global
  fontFamily: Settings['fontFamily'] | null
  lineSpacing: number | null
  letterSpacing: number | null
  theme: 'light' | 'dark' | 'system' | null
  createdAt: Date
  updatedAt: Date
}

export interface Analytics {
  id: string // date string YYYY-MM-DD
  featuresUsed: Record<string, number>
  sessionDuration: number // seconds
  sitesVisited: number
  interventionsAccepted: number
  interventionsDismissed: number
}
