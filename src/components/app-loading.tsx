import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppLoading({ label, latih = false }: { label: string; latih?: boolean }) {
  return <main className={cn('app-loading', latih && 'latih-shell')}>
    <div className="app-loading-status" role="status">
      <LoaderCircle className="app-loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  </main>
}
