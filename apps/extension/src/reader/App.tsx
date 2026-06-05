import { useState } from 'react'

export function App() {
  const [state] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {state === 'idle' && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <h1 className="text-2xl font-bold mb-2">PDF Reader</h1>
          <p>Open a PDF to get started</p>
        </div>
      )}
    </div>
  )
}
