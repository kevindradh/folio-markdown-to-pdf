import { BrowserRouter, Routes, Route, Link } from 'react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from './components/ui/tooltip'
import { registerOfflineApp } from './lib/pwa'
import AppEntry from './app-entry'
import { consumeAppTransition } from './lib/app-navigation'

const isLatih = window.location.pathname === `${import.meta.env.BASE_URL}latih` || window.location.pathname.startsWith(`${import.meta.env.BASE_URL}latih/`)
const showSplash = consumeAppTransition(isLatih ? 'latih' : 'folio')
if (isLatih) {
  document.title = 'latih. – Preview'
  document.querySelector('link[rel="icon"]')?.setAttribute('href', `${import.meta.env.BASE_URL}latih.svg`)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#087f70')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider><BrowserRouter basename={import.meta.env.BASE_URL}><Routes>
      <Route path="/" element={<AppEntry isLatih={false} showSplash={showSplash} />} />
      <Route path="/latih/*" element={<AppEntry isLatih showSplash={showSplash} />} />
      <Route path="*" element={<main className="p-8"><h1>Halaman tidak ditemukan</h1><Link to="/">Buka Folio</Link></main>} />
    </Routes></BrowserRouter></TooltipProvider>
  </StrictMode>,
)

if (document.readyState === 'complete') registerOfflineApp()
else window.addEventListener('load', registerOfflineApp, { once: true })
