// One registration shared by React mounts. Document data stays in IndexedDB.
type PwaState = { ready: boolean; update: boolean; error: boolean }
let state: PwaState = { ready: false, update: false, error: false }
const listeners = new Set<() => void>()
let registration: ServiceWorkerRegistration | undefined
let reloadRequested = false
function publish(next: Partial<PwaState>) {
  state = { ...state, ...next }
  listeners.forEach(listener => listener())
}
export const pwa = {
  snapshot: () => state,
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
  async refresh() {
    const waiting = registration?.waiting
    if (!waiting) return false
    reloadRequested = true
    return new Promise<boolean>((resolve, reject) => {
      const done = () => { clearTimeout(timer); resolve(true) }
      const timer = window.setTimeout(() => {
        reloadRequested = false
        navigator.serviceWorker.removeEventListener('controllerchange', done)
        reject(new Error('Pembaruan belum aktif.'))
      }, 15_000)
      navigator.serviceWorker.addEventListener('controllerchange', done, { once: true })
      waiting.postMessage({ type: 'SKIP_WAITING' })
    })
  },
}
export function registerOfflineApp() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    publish({ ready: true, update: false })
    // Other tabs keep their edits and are never automatically reloaded.
    if (reloadRequested) window.location.reload()
  })
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' }).then(value => {
    registration = value
    if (value.active) publish({ ready: true })
    if (value.waiting) publish({ update: true })
    value.addEventListener('updatefound', () => {
      const installing = value.installing
      installing?.addEventListener('statechange', () => {
        if (installing.state === 'installed') {
          if (value.waiting) publish({ update: true })
          else publish({ ready: true })
        }
        if (installing.state === 'redundant' && !value.active) publish({ error: true })
      })
    })
    let lastCheck = Date.now()
    const check = () => {
      if (!navigator.onLine || document.visibilityState !== 'visible' || Date.now() - lastCheck < 3_600_000) return
      lastCheck = Date.now()
      void value.update().catch(() => {})
    }
    document.addEventListener('visibilitychange', check)
    window.addEventListener('online', check)
  }).catch(() => publish({ error: true }))
}
