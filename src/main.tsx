import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { registerOfflineApp } from './lib/pwa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (document.readyState === 'complete') registerOfflineApp()
else window.addEventListener('load', registerOfflineApp, { once: true })
