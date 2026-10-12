import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { rememberTour } from '@/lib/app-tour'

const steps = [
  { target: '.format-toolbar', title: 'Mulai dari tulisanmu', description: 'Tulis di editor Markdown di bawah ini. Gunakan tombol judul, tebal, daftar, atau gambar untuk membantu memformat tulisan. Sudah punya dokumen? Pilih Buka file .md.' },
  { target: '.preview-pane .pane-toolbar', title: 'Lihat hasilnya langsung', description: 'Pratinjau mengikuti tulisanmu dan membaginya menjadi halaman. Tombol tampilan di samping nama dokumen bisa menampilkan editor, pratinjau, atau keduanya.' },
  { target: '.settings-bar', title: 'Atur tampilan dokumen', description: 'Pilih ukuran kertas, tipografi, margin, dan tema kode. Pengaturan ini dipakai pada pratinjau dan hasil PDF.' },
  { target: '.library-bar', title: 'Simpan dan kelola dokumen', description: 'Tulisan disimpan otomatis di browser ini. Buka Project untuk mengelola dokumen dan Riwayat untuk memulihkan versi sebelumnya. Unduh .md untuk menyimpan salinan; file gambar perlu disimpan terpisah.' },
  { target: '#export-pdf', title: 'Jadikan PDF', description: 'Setelah pratinjau siap, pilih Ekspor PDF lalu Save as PDF di dialog cetak. Samakan ukuran kertas, gunakan skala 100%, margin None, dan matikan header/footer browser.' },
]

type Position = { left: number; top: number; clipPath: string }

export function AppTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [position, setPosition] = useState<Position | null>(null)
  const popup = useRef<HTMLDivElement>(null)
  const next = useRef<HTMLButtonElement>(null)
  const current = steps[step]

  useLayoutEffect(() => {
    if (!open) return
    const target = document.querySelector<HTMLElement>(current.target)
    target?.scrollIntoView({ block: 'center', behavior: 'instant' })
    const measure = () => {
      const width = window.visualViewport?.width ?? innerWidth
      const height = window.visualViewport?.height ?? innerHeight
      const cardWidth = popup.current?.offsetWidth ?? Math.min(360, width - 32)
      const cardHeight = popup.current?.offsetHeight ?? 250
      const bounds = target?.getBoundingClientRect()
      if (!bounds || !bounds.width || !bounds.height) {
        setPosition({ left: Math.max(16, (width - cardWidth) / 2), top: Math.max(16, (height - cardHeight) / 2), clipPath: 'none' })
        return
      }
      const left = Math.max(8, bounds.left - 6)
      const right = Math.min(width - 8, bounds.right + 6)
      const top = Math.max(8, bounds.top - 6)
      const bottom = Math.min(height - 8, bounds.bottom + 6)
      // Prefer a side on wide screens and above/below on phones. Clamp small viewports.
      let x = Math.min(Math.max(16, left), width - cardWidth - 16)
      let y = bottom + 12
      if (right + cardWidth + 28 <= width) { x = right + 12; y = top }
      else if (y + cardHeight > height - 16) y = top - cardHeight - 12
      y = Math.max(16, Math.min(y, height - cardHeight - 16))
      const clipPath = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px, ${left}px ${top}px)`
      setPosition({ left: x, top: y, clipPath })
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (target) observer.observe(target)
    if (popup.current) observer.observe(popup.current)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    window.visualViewport?.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); window.visualViewport?.removeEventListener('resize', measure) }
  }, [open, current])

  function close() { rememberTour(); onClose() }

  return <Dialog open={open} onOpenChange={value => { if (!value) close() }}>
    <DialogContent ref={popup} className="coachmark" showCloseButton={false} initialFocus={next} finalFocus={() => document.getElementById('markdown-guide-trigger')}
      style={position ? { left: position.left, top: position.top, transform: 'none' } : undefined}
      overlayProps={{ className: 'coachmark-overlay', style: { clipPath: position?.clipPath ?? 'none' } }}>
      <Badge variant="secondary" className="justify-self-start">Tur aplikasi · {step + 1} dari {steps.length}</Badge>
      <DialogHeader aria-live="polite" aria-atomic="true">
        <DialogTitle>{current.title}</DialogTitle>
        <DialogDescription>{current.description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={close}>Lewati</Button>
        <div className="flex gap-2">
          {step > 0 && <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Kembali</Button>}
          <Button ref={next} size="sm" onClick={() => { if (step === steps.length - 1) close(); else setStep(step + 1) }}>{step === steps.length - 1 ? 'Mulai menulis' : 'Lanjut'}</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
}
