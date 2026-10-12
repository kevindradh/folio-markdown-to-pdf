import { useEffect, useState } from 'react'
import { FileText, Folder, FolderPlus, History, Plus, Trash2, Pencil, FolderInput, RotateCcw } from 'lucide-react'
import type { DocumentLibraryController } from '@/hooks/use-document-draft'
import { listVersions, type DocumentVersion, type LibraryDocument } from '@/lib/document-library'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { toast } from '@/lib/toast'

const date = (value: number) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
type Intent = { kind: 'create' | 'rename' } | { kind: 'move'; document: LibraryDocument } | null
type Removal = { kind: 'project' | 'document'; id: string; name: string } | null

export function DocumentLibraryBar({ controller: c, disabled = false }: { controller: DocumentLibraryController; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const [query, setQuery] = useState('')
  const [intent, setIntent] = useState<Intent>(null)
  const [formName, setFormName] = useState('')
  const [destination, setDestination] = useState('')
  const [removal, setRemoval] = useState<Removal>(null)
  const activeProject = c.library.projects.find(project => project.id === c.activeDocument?.projectId)
  const projectId = c.library.projects.some(project => project.id === selectedProject) ? selectedProject : activeProject?.id
  const project = c.library.projects.find(item => item.id === projectId)
  const documents = c.library.documents.filter(document => document.projectId === projectId)
    .filter(document => document.draft.name.toLocaleLowerCase('id-ID').includes(query.toLocaleLowerCase('id-ID')))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  const locked = disabled || c.busy || !c.available

  async function submit() {
    if (intent?.kind === 'create') {
      const created = await c.newProject(formName)
      if (created) { setSelectedProject(created.id); setQuery(''); setIntent(null) }
    } else if (intent?.kind === 'rename' && projectId) {
      if (await c.renameProject(projectId, formName)) setIntent(null)
    } else if (intent?.kind === 'move') {
      if (await c.moveDocument(intent.document.id, destination)) setIntent(null)
    }
  }

  return <>
    <div className="library-bar">
      <div className="library-location">
        <Button variant="outline" size="sm" disabled={locked} onClick={() => { setSelectedProject(activeProject?.id ?? ''); setOpen(true) }}><Folder data-icon="inline-start" /> Project</Button>
        <span className="truncate" title={activeProject?.name}>{activeProject?.name ?? 'Penyimpanan lokal tidak tersedia'}</span>
      </div>
      <Button variant="ghost" size="sm" disabled={locked} onClick={() => setHistoryOpen(true)}><History data-icon="inline-start" /> Riwayat</Button>
    </div>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="project-library-dialog">
        <DialogHeader><DialogTitle>Project kamu</DialogTitle><DialogDescription>Kelompokkan dokumenmu. Semua tersimpan di browser ini.</DialogDescription></DialogHeader>
        <div className="project-library-grid">
          <aside className="project-navigation">
            <Button variant="outline" size="sm" disabled={locked} onClick={() => { setFormName(''); setIntent({ kind: 'create' }) }}><FolderPlus data-icon="inline-start" /> Project baru</Button>
            <nav aria-label="Daftar project">
              {c.library.projects.map(item => <Button key={item.id} variant={item.id === projectId ? 'secondary' : 'ghost'} className="justify-start" aria-current={item.id === projectId ? 'true' : undefined} disabled={c.busy} onClick={() => { setSelectedProject(item.id); setQuery('') }}><Folder data-icon="inline-start" /><span className="truncate">{item.name}</span><span className="project-document-count">{c.library.documents.filter(document => document.projectId === item.id).length}</span></Button>)}
            </nav>
          </aside>
          <section className="project-documents" aria-label="Dokumen dalam project">
            <div className="project-documents-heading">
              <h3 className="truncate" title={project?.name}>{project?.name}</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Ubah nama project" disabled={locked} onClick={() => { setFormName(project?.name ?? ''); setIntent({ kind: 'rename' }) }}><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Hapus project" disabled={locked || c.library.projects.length <= 1} onClick={() => { if (project) setRemoval({ kind: 'project', id: project.id, name: project.name }) }}><Trash2 /></Button>
              </div>
            </div>
            <div className="project-document-tools">
              <FieldGroup className="min-w-0 flex-1"><Field><FieldLabel htmlFor="document-search" className="sr-only">Cari dokumen</FieldLabel><Input id="document-search" placeholder="Cari dokumen di project ini…" value={query} onChange={event => setQuery(event.target.value)} /></Field></FieldGroup>
              <Button size="sm" disabled={locked || !projectId} onClick={async () => { if (projectId && await c.newDocument(projectId)) setOpen(false) }}><Plus data-icon="inline-start" /> Dokumen baru</Button>
            </div>
            <div className="project-document-list">
              {documents.map(document => <div className="project-document-row" key={document.id}>
                <Button variant="ghost" className="project-document-open" disabled={locked} onClick={async () => { if (await c.openDocument(document.id)) setOpen(false) }} aria-label={`Buka ${document.draft.name || 'Dokumen tanpa nama'}`}>
                  <FileText data-icon="inline-start" /><span className="min-w-0 flex-1"><span className="block truncate">{document.draft.name || 'Dokumen tanpa nama'}</span><span className="project-document-date">Diperbarui {date(document.updatedAt)}</span></span>
                </Button>
                {document.id === c.library.activeId && <Badge variant="secondary">Aktif</Badge>}
                <Button variant="ghost" size="icon-sm" disabled={locked || c.library.projects.length < 2} aria-label={`Pindahkan ${document.draft.name}`} onClick={() => { setDestination(document.projectId); setIntent({ kind: 'move', document }) }}><FolderInput /></Button>
                <Button variant="ghost" size="icon-sm" disabled={locked} aria-label={`Hapus ${document.draft.name}`} onClick={() => setRemoval({ kind: 'document', id: document.id, name: document.draft.name })}><Trash2 /></Button>
              </div>)}
              {!documents.length && <Empty><EmptyHeader><EmptyTitle>{query ? 'Dokumen tidak ditemukan' : 'Project ini masih kosong'}</EmptyTitle><EmptyDescription>{query ? 'Coba nama dokumen lain.' : 'Buat dokumen baru untuk mulai menulis.'}</EmptyDescription></EmptyHeader></Empty>}
            </div>
          </section>
        </div>
        <DialogFooter><span className="library-local-note">Simpan salinan .md untuk cadangan di luar browser.</span><DialogClose render={<Button variant="outline" />}>Selesai</DialogClose></DialogFooter>
        <Dialog open={Boolean(intent)} onOpenChange={value => { if (!value) setIntent(null) }}>
          <DialogContent><DialogHeader><DialogTitle>{intent?.kind === 'create' ? 'Project baru' : intent?.kind === 'rename' ? 'Ubah nama project' : 'Pindahkan dokumen'}</DialogTitle><DialogDescription>{intent?.kind === 'move' ? 'Isi dan riwayat dokumen tetap dibawa ke project tujuan.' : 'Gunakan nama sesuai topik atau pekerjaanmu.'}</DialogDescription></DialogHeader>
            <form onSubmit={event => { event.preventDefault(); void submit() }}>
              <FieldGroup><Field><FieldLabel htmlFor="project-form">{intent?.kind === 'move' ? 'Project tujuan' : 'Nama project'}</FieldLabel>
                {intent?.kind === 'move' ? <Select items={c.library.projects.map(item => ({ value: item.id, label: item.name }))} value={destination} onValueChange={value => { if (value) setDestination(value) }}><SelectTrigger id="project-form"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{c.library.projects.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectGroup></SelectContent></Select>
                  : <Input id="project-form" autoFocus required maxLength={120} value={formName} onChange={event => setFormName(event.target.value)} placeholder="Misalnya: Makalah fisika" />}
              </Field></FieldGroup>
              <DialogFooter className="mt-4"><DialogClose render={<Button variant="outline" disabled={c.busy} />}>Batal</DialogClose><Button type="submit" disabled={locked || (intent?.kind !== 'move' && !formName.trim())}>{intent?.kind === 'move' ? 'Pindahkan' : 'Simpan'}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={Boolean(removal)} onOpenChange={value => { if (!value) setRemoval(null) }}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus {removal?.kind === 'project' ? 'project' : 'dokumen'} “{removal?.name}”?</AlertDialogTitle><AlertDialogDescription>{removal?.kind === 'project' ? 'Project hanya dapat dihapus setelah semua dokumennya dipindahkan atau dihapus.' : 'Dokumen dan riwayatnya akan dihapus dari browser. Unduh .md terlebih dahulu jika perlu salinan.'}</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel disabled={c.busy}>Batal</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={c.busy} onClick={async () => {
              if (!removal) return
              const removed = removal.kind === 'project' ? await c.deleteProject(removal.id) : await c.deleteDocument(removal.id)
              if (removed) setRemoval(null)
            }}>Hapus</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
    <HistoryDialog key={c.library.activeId} controller={c} open={historyOpen} onOpenChange={setHistoryOpen} />
  </>
}

function HistoryDialog({ controller: c, open, onOpenChange }: { controller: DocumentLibraryController; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [error, setError] = useState('')
  const [restoreOpen, setRestoreOpen] = useState(false)
  const selected = versions.find(version => version.id === selectedId) ?? versions[0]
  useEffect(() => {
    if (!open || !c.library.activeId) return
    let active = true
    listVersions(c.library.activeId).then(value => { if (active) { setVersions(value); setError('') } })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Riwayat tidak dapat dibaca.') })
    return () => { active = false }
  }, [open, c.historyTick, c.library.activeId])
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="project-library-dialog">
      <DialogHeader><DialogTitle>Riwayat versi</DialogTitle><DialogDescription>{c.draft.name || 'Dokumen tanpa nama'} — versi otomatis setelah jeda menulis 15 detik. Maksimal 20 versi per dokumen.</DialogDescription></DialogHeader>
      {error ? <p role="alert">{error}</p> : <div className="history-grid">
        <nav className="history-list" aria-label="Daftar versi">
          {versions.map(version => <Button key={version.id} variant={version.id === selected?.id ? 'secondary' : 'ghost'} className="history-version-button" onClick={() => setSelectedId(version.id)} aria-current={version.id === selected?.id ? 'true' : undefined}>
            <History data-icon="inline-start" /><span><span className="block">{date(version.createdAt)}</span><span className="project-document-date">{version.kind === 'manual' ? 'Disimpan manual' : version.kind === 'before-restore' ? 'Sebelum pemulihan' : 'Otomatis'}</span></span>
          </Button>)}
        </nav>
        <FieldGroup className="min-w-0"><Field><FieldLabel htmlFor="version-preview">Isi versi {selected ? `— ${selected.draft.name || 'Dokumen tanpa nama'}` : ''}</FieldLabel><Textarea id="version-preview" className="version-preview" readOnly value={selected?.draft.text ?? ''} /></Field></FieldGroup>
      </div>}
      <DialogFooter>
        <Button variant="outline" disabled={c.busy} onClick={async () => { if (await c.saveVersion()) toast.add({ title: 'Versi saat ini tersimpan.', type: 'success' }) }}><Plus data-icon="inline-start" /> Simpan versi</Button>
        <Button disabled={c.busy || !selected || Boolean(error)} onClick={() => setRestoreOpen(true)}><RotateCcw data-icon="inline-start" /> Pulihkan versi ini</Button>
      </DialogFooter>
      <AlertDialog open={restoreOpen} onOpenChange={setRestoreOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Pulihkan versi ini?</AlertDialogTitle><AlertDialogDescription>Isi, nama, dan pengaturan dokumen akan kembali ke versi pilihan. Perubahan saat ini disimpan sebagai versi sebelum pemulihan.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={c.busy}>Batal</AlertDialogCancel><AlertDialogAction disabled={c.busy} onClick={async () => {
        if (selected && await c.restoreVersion(selected.id)) { setRestoreOpen(false); onOpenChange(false); toast.add({ title: 'Versi berhasil dipulihkan.', type: 'success' }) }
      }}>Pulihkan</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </DialogContent>
  </Dialog>
}
