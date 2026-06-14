import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

// Best-effort theme application before React mounts to reduce flash. The MV3
// extension CSP forbids inline scripts, so this lives in the bundled module.
// App reconciles with the saved theme once settings load.
if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark')
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
