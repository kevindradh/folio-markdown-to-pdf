import { useState } from 'react'
import { Check, Grip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { AppSwitchLink } from '@/components/app-switch-link'
import type { Application } from '@/lib/app-navigation'

const applications = [
  { id: 'folio', name: 'folio.', icon: 'favicon.svg', description: 'Tulis Markdown, simpan sebagai PDF.' },
  { id: 'latih', name: 'latih.', icon: 'latih.svg', description: 'Belajar lewat soal dari AI pilihanmu.' },
] as const

export function AppSwitcher({ current }: { current: Application }) {
  const [open, setOpen] = useState(false)
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger render={<Button variant="ghost" size="sm" className="app-switcher-trigger" aria-label="Pilih aplikasi" />}>
      <Grip data-icon="inline-start" /><span>Aplikasi</span>
    </PopoverTrigger>
    <PopoverContent align="end" sideOffset={12} className="app-switcher-panel">
      <PopoverHeader><PopoverTitle>Aplikasi</PopoverTitle></PopoverHeader>
      <nav className="app-switcher-list" aria-label="Pilihan aplikasi">
        {applications.map(app => <AppSwitchLink key={app.id} application={app.id} variant="ghost"
          className="app-switcher-choice" aria-current={current === app.id ? 'page' : undefined}
          onClick={event => {
            if (current === app.id) { event.preventDefault(); setOpen(false) }
          }}>
          <img src={`${import.meta.env.BASE_URL}${app.icon}`} alt="" width={32} height={32} />
          <span className="app-switcher-details"><span className="app-switcher-heading"><span className="app-switcher-name">{app.name}</span>{app.id === 'latih' && <Badge variant="outline" className="bg-card">Preview</Badge>}</span><span className="app-switcher-description">{app.description}</span></span>
          {current === app.id && <Check className="app-switcher-active" aria-hidden="true" />}
        </AppSwitchLink>)}
      </nav>
    </PopoverContent>
  </Popover>
}
