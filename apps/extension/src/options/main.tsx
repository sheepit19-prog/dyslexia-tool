import React from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dyslexia Tool - Settings</h1>
      <p className="text-gray-600">Settings page coming soon...</p>
      <p className="text-sm text-gray-500 mt-4">This page is under construction for MVP.</p>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
