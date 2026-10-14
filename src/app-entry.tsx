import { lazy, Suspense, useEffect, useState } from 'react'
import { AppLoading } from '@/components/app-loading'
import { AppSplash } from '@/components/app-splash'

const FolioApp = lazy(() => import('./App'))
const LatihApp = lazy(() => import('./apps/latih/App'))

export default function AppEntry({ isLatih, showSplash = false }: { isLatih: boolean; showSplash?: boolean }) {
  const [splashVisible, setSplashVisible] = useState(showSplash)
  useEffect(() => {
    if (!showSplash) return
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 900
    const timer = window.setTimeout(() => setSplashVisible(false), duration)
    return () => window.clearTimeout(timer)
  }, [showSplash])

  return <>
    <div className="app-entry-content" inert={splashVisible} aria-hidden={splashVisible || undefined}>
      <Suspense fallback={<AppLoading label="Memuat aplikasi…" latih={isLatih} />}>
        {isLatih ? <LatihApp /> : <FolioApp />}
      </Suspense>
    </div>
    {splashVisible && <AppSplash latih={isLatih} />}
  </>
}
