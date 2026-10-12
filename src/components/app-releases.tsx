import { History } from 'lucide-react'
import { version } from '../../package.json'
import releases from '@/data/releases.json'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'

const dateFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })

export function AppReleases() {
  return <Dialog>
    <DialogTrigger render={<Button variant="ghost" size="sm" aria-label={`Versi v${version} — Riwayat pembaruan`} />}>
      <History data-icon="inline-start" /> v{version} <span>Catatan pembaruan</span>
    </DialogTrigger>
    <DialogContent className="max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Riwayat pembaruan</DialogTitle>
        <DialogDescription>Versi yang sedang digunakan: v{version}. Catatan ini juga tersedia offline.</DialogDescription>
      </DialogHeader>
      <section aria-label="Daftar pembaruan" tabIndex={0} className="min-h-0 overflow-y-auto pr-2">
        <p className="mb-5 text-xs text-muted-foreground">v0.0.1–v0.0.19 disusun kembali dari commit awal pengembangan; nomor versi belum digunakan saat itu.</p>
        {releases.map((release, index) => <article key={release.version} className="release-entry">
          {index > 0 && <Separator className="my-5" />}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">v{release.version}</h3>
            {release.version === version && <Badge variant="secondary">Versi ini</Badge>}
            <time dateTime={release.date} className="text-xs text-muted-foreground">{dateFormat.format(new Date(`${release.date}T00:00:00+07:00`))}</time>
          </div>
          <p className="mb-2 text-sm font-medium">{release.title}</p>
          <ul className="list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
            {release.changes.map(change => <li key={change}>{change}</li>)}
          </ul>
        </article>)}
      </section>
      <DialogFooter><DialogClose render={<Button variant="outline" />}>Tutup</DialogClose></DialogFooter>
    </DialogContent>
  </Dialog>
}
