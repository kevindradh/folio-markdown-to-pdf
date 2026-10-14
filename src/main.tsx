import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from './components/ui/tooltip'
import { registerOfflineApp } from './lib/pwa'
import AppEntry from './app-entry'
import { consumeAppTransition } from './lib/app-navigation'

const isLatih = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}latih`.replace(/\/+$/, '')
const showSplash = consumeAppTransition(isLatih ? 'latih' : 'folio')
if (isLatih) {
  document.title = 'latih. – Preview'
  document.querySelector('link[rel="icon"]')?.setAttribute('href', `${import.meta.env.BASE_URL}latih.svg`)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#087f70')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider><AppEntry isLatih={isLatih} showSplash={showSplash} /></TooltipProvider>
  </StrictMode>,
)

if (document.readyState === 'complete') registerOfflineApp()
else window.addEventListener('load', registerOfflineApp, { once: true })
