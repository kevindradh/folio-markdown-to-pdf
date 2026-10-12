import { useEffect, useState, useSyncExternalStore } from 'react'
import { RefreshCw, WifiOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { pwa } from '@/lib/pwa'
import { toast } from '@/lib/toast'

export function PwaStatus({ prepareReload, cancelReload, saved, busy }: {
  prepareReload: () => Promise<boolean>; cancelReload: () => void; saved: boolean; busy: boolean
}) {
  const state = useSyncExternalStore(pwa.subscribe, pwa.snapshot)
  const [online, setOnline] = useState(navigator.onLine)
  const [updating, setUpdating] = useState(false)
  useEffect(() => {
    const change = () => setOnline(navigator.onLine)
    window.addEventListener('online', change); window.addEventListener('offline', change)
    return () => { window.removeEventListener('online', change); window.removeEventListener('offline', change) }
  }, [])
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return null
  async function refresh() {
    setUpdating(true)
    let prepared = false
    try {
      prepared = await prepareReload()
      if (!prepared) return
      if (!await pwa.refresh()) window.location.reload()
    } catch {
      toast.add({ title: 'Pembaruan belum diterapkan.', description: 'Coba lagi setelah draft tersimpan.', type: 'error' })
    } finally { if (prepared) cancelReload(); setUpdating(false) }
  }
  return <aside className="pwa-status" aria-label="Status aplikasi">
    <span role="status"><Badge variant="outline">
      {!online ? <WifiOff data-icon="inline-start" /> : state.ready ? <Check data-icon="inline-start" /> : null}
      {!online ? state.ready ? 'Offline · siap menulis' : 'Offline belum siap' : state.ready ? 'Siap digunakan offline' : state.error ? 'Offline belum tersedia; muat ulang saat online' : 'Menyiapkan penggunaan offline…'}
    </Badge></span>
    {state.update && <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Versi baru tersedia.{!saved && ' Menunggu draft tersimpan.'}</span>
      <Button size="sm" variant="outline" disabled={!saved || busy || updating} onClick={() => void refresh()}>
        <RefreshCw data-icon="inline-start" /> {updating ? 'Memperbarui…' : 'Perbarui aplikasi'}
      </Button>
    </div>}
  </aside>
}
