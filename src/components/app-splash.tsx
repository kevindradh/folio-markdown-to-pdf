import { cn } from '@/lib/utils'

export function AppSplash({ latih }: { latih: boolean }) {
  const name = latih ? 'latih' : 'folio'
  return <div className={cn('app-splash', latih && 'latih-shell')} role="status">
    <div className="app-splash-brand">
      <img src={`${import.meta.env.BASE_URL}${latih ? 'latih' : 'favicon'}.svg`} alt="" width={72} height={72} />
      <span>{name}<span className="brand-dot">.</span></span>
    </div>
    <p>Membuka {name}.</p>
  </div>
}
