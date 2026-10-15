import { useEffect, useState, useSyncExternalStore } from 'react'
import { RefreshCw, WifiOff, CloudCheck, LoaderCircle, CloudAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
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
  const networkLabel = online ? 'Online' : 'Offline'
  const updateStatus = updating ? 'Memperbarui…' : !saved ? 'Versi baru tersedia. Menunggu draft tersimpan.' : busy ? 'Versi baru tersedia. Menunggu proses selesai.' : 'Versi baru tersedia.'
  return <aside className="pwa-status" aria-label="Status aplikasi" data-offline-ready={state.ready}>
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="sm" className="pwa-status-trigger" aria-label={`Status aplikasi: ${networkLabel}`} />}>
        <span role="status" className="pwa-status-label"><StatusIcon aria-hidden="true" />{networkLabel}</span>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={10} className="pwa-status-details">
        <PopoverHeader><PopoverTitle>Status aplikasi</PopoverTitle></PopoverHeader>
        <p>{status}</p>
        {enabled && state.update && <p role="status">{updateStatus}</p>}
      </PopoverContent>
    </Popover>
    {enabled && state.update && <Button size="sm" variant="outline" className="pwa-update" aria-label="Perbarui aplikasi" disabled={!saved || busy || updating} onClick={() => void refresh()}><RefreshCw data-icon="inline-start" />{updating ? 'Memperbarui…' : 'Perbarui'}</Button>}
  </aside>
}
