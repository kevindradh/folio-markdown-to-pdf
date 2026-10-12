import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { TooltipProvider } from './components/ui/tooltip'
import { registerOfflineApp } from './lib/pwa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider><App /></TooltipProvider>
  </StrictMode>,
)

if (document.readyState === 'complete') registerOfflineApp()
else window.addEventListener('load', registerOfflineApp, { once: true })
