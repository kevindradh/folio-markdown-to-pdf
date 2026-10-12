import { useEffect, useState, useSyncExternalStore } from 'react'
import { RefreshCw, WifiOff, CloudCheck, LoaderCircle, CloudAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  const status = !online ? state.ready ? 'Offline · siap menulis' : 'Offline belum siap' : state.ready ? 'Siap digunakan offline' : state.error ? 'Offline belum tersedia; muat ulang saat online' : 'Menyiapkan penggunaan offline…'
  const StatusIcon = !online ? WifiOff : state.ready ? CloudCheck : state.error ? CloudAlert : LoaderCircle
  return <aside className="pwa-status" aria-label="Status aplikasi">
    <span role="status" className="sr-only">{status}</span>
    <Tooltip>
      <TooltipTrigger closeOnClick={false} render={<Button variant="ghost" size="icon-sm" aria-label={status} />}>
        <StatusIcon />
      </TooltipTrigger>
      <TooltipContent side="bottom">{status}</TooltipContent>
    </Tooltip>
    {state.update && <Tooltip>
      <TooltipTrigger render={<span tabIndex={!saved || busy || updating ? 0 : undefined} />}>
        <Button size="icon-sm" variant="outline" aria-label="Perbarui aplikasi" disabled={!saved || busy || updating} onClick={() => void refresh()}><RefreshCw /></Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{updating ? 'Memperbarui…' : !saved ? 'Versi baru tersedia. Menunggu draft tersimpan.' : 'Versi baru tersedia. Perbarui aplikasi.'}</TooltipContent>
    </Tooltip>}
  </aside>
}
