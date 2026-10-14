import { Badge } from '@/components/ui/badge'
import { AppSwitchLink } from '@/components/app-switch-link'
import { AppSwitcher } from '@/components/app-switcher'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export default function LatihApp() {
  return <div className="latih-shell">
    <header className="topbar">
      <a className="brand" href={`${import.meta.env.BASE_URL}latih/`} aria-label="Beranda latih">
        <img className="brand-mark" src={`${import.meta.env.BASE_URL}latih.svg`} alt="" width={32} height={32} />
        latih<span className="brand-dot">.</span>
      </a>
      <nav aria-label="Navigasi aplikasi" className="flex items-center gap-3">
        <Badge variant="secondary">Preview</Badge>
        <AppSwitcher current="latih" />
      </nav>
    </header>
    <main className="latih-main">
      <h1>latih.</h1>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Halaman preview latih.</EmptyTitle>
          <EmptyDescription>Aplikasi ini sedang disiapkan. Fitur latihan akan hadir di sini.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AppSwitchLink variant="outline" application="folio">Kembali ke Folio</AppSwitchLink>
        </EmptyContent>
      </Empty>
    </main>
  </div>
}
