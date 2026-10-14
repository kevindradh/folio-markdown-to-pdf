import { useEffect, useState, useSyncExternalStore } from 'react'
import { RefreshCw, WifiOff, CloudCheck, LoaderCircle, CloudAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const enabled = import.meta.env.PROD && 'serviceWorker' in navigator
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
  const status = !import.meta.env.PROD ? 'Mode pengembangan · cache offline tidak aktif'
    : !enabled ? 'Browser ini tidak mendukung penggunaan offline'
    : !online ? state.ready ? 'Offline · siap menulis' : 'Offline belum siap' : state.ready ? 'Siap digunakan offline' : state.error ? 'Offline belum tersedia; muat ulang saat online' : 'Menyiapkan penggunaan offline…'
  const StatusIcon = !enabled ? CloudAlert : !online ? WifiOff : state.ready ? CloudCheck : state.error ? CloudAlert : LoaderCircle
  return <aside className="pwa-status" aria-label="Status aplikasi">
    <span role="status" className="pwa-status-label"><StatusIcon aria-hidden="true" />{status}</span>
    {enabled && state.update && <div className="pwa-update">
      <span role="status">{updating ? 'Memperbarui…' : !saved ? 'Versi baru tersedia. Menunggu draft tersimpan.' : busy ? 'Versi baru tersedia. Menunggu proses selesai.' : 'Versi baru tersedia.'}</span>
      <Button size="sm" variant="outline" aria-label="Perbarui aplikasi" disabled={!saved || busy || updating} onClick={() => void refresh()}><RefreshCw data-icon="inline-start" />Perbarui aplikasi</Button>
    </div>}
  </aside>
}
