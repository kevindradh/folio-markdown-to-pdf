import { useRef, useState, type ReactNode } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, FileText, Check, Columns2, Eye, Code2, Bold, Italic, Link, List, Heading2, Minus, Plus, RotateCcw, BookOpen, PanelLeftClose } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Toaster } from '@/components/ui/toast'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { MathExpression } from '@/components/math-expression'
import { HighlightedCode } from '@/components/highlighted-code'
import { PaginatedDocument } from '@/components/paginated-document'

const example = `# Ruang untuk ide yang baik

Catatan kecil tentang bekerja dengan lebih terarah.

---

## Mulai dari yang penting

Ide terbaik sering datang dalam bentuk yang sederhana. Sebuah catatan, beberapa kalimat, atau daftar kecil tentang hal yang ingin kita buat.

Dengan **Markdown**, kamu bisa fokus pada isi tulisan. Biarkan format mengikuti, tanpa menghalangi alur berpikir.

## Sedikit struktur, banyak kejelasan

- Tulis satu ide utama untuk setiap bagian
- Gunakan judul yang singkat dan jelas
- Beri ruang agar tulisan mudah dibaca

> Dokumen yang baik tidak hanya menyampaikan informasi, tetapi juga memberi ruang untuk memahaminya.

## Langkah berikutnya

Rapikan catatanmu, lihat pratinjaunya, lalu simpan sebagai PDF. Siap untuk dibagikan.

Selamat membuat sesuatu yang berarti.`

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\\{1,2}\([\s\S]+?\\{1,2}\)|(?<![\\$])\$(?!\s|\$)[^$\n]+?(?<!\s|\\)\$(?!\$)|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const math = part.match(/^\\{1,2}\(([\s\S]+)\\{1,2}\)$/)
    if (math) return <MathExpression key={i} expression={math[1]} />
    if (part.startsWith('$') && part.endsWith('$')) return <MathExpression key={i} expression={part.slice(1, -1)} />
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
    if (part.startsWith('`')) return <HighlightedCode key={i} text={part.slice(1, -1)} />
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) return <a key={i} href={/^https?:\/\//.test(link[2]) ? link[2] : undefined} target="_blank" rel="noreferrer">{link[1]}</a>
    return part
  })
}

function Markdown({ text }: { text: string }) {
  const rows = text.split('\n'); const result: ReactNode[] = []
  for (let i = 0; i < rows.length; i++) {
    const line = rows[i]
    if (!line.trim()) continue
    if (line.startsWith('```')) {
      const language = line.slice(3).trim().split(/\s+/)[0]
      const code: string[] = []
      while (++i < rows.length && !rows[i].startsWith('```')) code.push(rows[i])
      result.push(<pre key={i}><HighlightedCode text={code.join('\n')} language={language} /></pre>); continue
    }
    const displayStart = line.trim().match(/^(\\{1,2}\[|\$\$)/)
    if (displayStart) {
      const closing = displayStart[0] === '$$' ? /\$\$\s*$/ : /\\{1,2}\]\s*$/
      const formula = [line.trim().slice(displayStart[0].length)]
      let end = i
      while (!closing.test(formula[formula.length - 1]) && end + 1 < rows.length) formula.push(rows[++end])
      if (closing.test(formula[formula.length - 1])) {
        formula[formula.length - 1] = formula[formula.length - 1].replace(closing, '')
        result.push(<div key={i} className="math-block"><MathExpression expression={formula.join('\n')} display /></div>)
        i = end
        continue
      }
    }
    if (/^---+$/.test(line)) { result.push(<Separator key={i} className="my-5" />); continue }
    if (/^[-*] /.test(line)) {
      const items = [line.slice(2)]
      while (i + 1 < rows.length && /^[-*] /.test(rows[i + 1])) items.push(rows[++i].slice(2))
      result.push(<ul key={i}>{items.map((item, n) => <li key={n}>{inline(item)}</li>)}</ul>); continue
    }
    if (line.startsWith('### ')) result.push(<h3 key={i}>{inline(line.slice(4))}</h3>)
    else if (line.startsWith('## ')) result.push(<h2 key={i}>{inline(line.slice(3))}</h2>)
    else if (line.startsWith('# ')) result.push(<h1 key={i}>{inline(line.slice(2))}</h1>)
    else if (line.startsWith('> ')) result.push(<blockquote key={i}>{inline(line.slice(2))}</blockquote>)
    else result.push(<p key={i}>{inline(line)}</p>)
  }
  return result
}

function DocumentSetting({ id, label, value, options, onChange }: {
  id: string; label: string; value: string; options: string[]; onChange: (value: string) => void
}) {
  const items = options.map(option => ({ label: option, value: option }))
  return <Field className="min-w-0 flex-1 sm:w-auto sm:flex-none">
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <Select items={items} value={value} onValueChange={next => { if (next) onChange(next) }}>
      <SelectTrigger id={id} className="w-full sm:min-w-28"><SelectValue /></SelectTrigger>
      <SelectContent alignItemWithTrigger={false}><SelectGroup>
        {items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
      </SelectGroup></SelectContent>
    </Select>
  </Field>
}

function MarkdownGuide() {
  return <Dialog>
    <DialogTrigger render={<Button variant="ghost" size="sm" />}>
      <BookOpen data-icon="inline-start" /> Panduan Markdown
    </DialogTrigger>
    <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Panduan Markdown</DialogTitle>
        <DialogDescription>Format yang didukung oleh pratinjau awal ini.</DialogDescription>
      </DialogHeader>
      <dl className="markdown-guide">
        <dt># Judul</dt><dd>Judul utama</dd>
        <dt>## Subjudul</dt><dd>Judul bagian</dd>
        <dt>**tebal** dan *miring*</dt><dd>Penekanan teks</dd>
        <dt>- Item daftar</dt><dd>Daftar berpoin</dd>
        <dt>&gt; Kutipan</dt><dd>Blok kutipan</dd>
        <dt>{String.raw`\(x^2\) atau $x^2$`}</dt><dd>Rumus inline</dd>
        <dt>{String.raw`\[...\] atau $$...$$`}</dt><dd>Rumus terpisah, termasuk matriks dan pecahan. Bisa ditulis dalam beberapa baris.</dd>
        <dt>[teks](https://...)</dt><dd>Tautan</dd>
        <dt>`kode` atau ```javascript</dt><dd>Kode berwarna. Tulis nama bahasa setelah tiga backtick, misalnya javascript, ts, python, atau css. Tanpa nama bahasa, deteksi otomatis; gunakan text untuk teks biasa.</dd>
      </dl>
      <p className="text-sm text-muted-foreground">Untuk PDF, pilih “Save as PDF” di dialog cetak. Gunakan ukuran kertas yang dipilih di aplikasi, skala 100%, margin “None”, dan nonaktifkan header/footer browser agar hasilnya sesuai pratinjau.</p>
      <DialogFooter><DialogClose render={<Button />}>Mulai menulis</DialogClose></DialogFooter>
    </DialogContent>
  </Dialog>
}

export default function App() {
  const [text, setText] = useState(example)
  const [name, setName] = useState('Catatan kreatif')
  const [view, setView] = useState('split')
  const [paper, setPaper] = useState('A4')
  const [font, setFont] = useState('Literary')
  const [margin, setMargin] = useState('Normal')
  const [zoom, setZoom] = useState(90)
  const [resetOpen, setResetOpen] = useState(false)
  const [pageCount, setPageCount] = useState(1)
  const input = useRef<HTMLInputElement>(null)
  const editor = useRef<HTMLTextAreaElement>(null)
  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  function insert(before: string, after = '') {
    const el = editor.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selection = text.slice(start, end) || 'teks'
    setText(text.slice(0, start) + before + selection + after + text.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selection.length)
    })
  }

  async function upload(file?: File) {
    if (!file) return
    if (!/\.(md|markdown|txt)$/i.test(file.name)) {
      toast.add({ title: 'Pilih file .md, .markdown, atau .txt.', type: 'error' })
      return
    }
    try {
      setText(await file.text())
      setName(file.name.replace(/\.[^.]+$/, ''))
      toast.add({ title: 'File berhasil dibuka.', type: 'success' })
    } catch {
      toast.add({ title: 'File tidak dapat dibaca.', description: 'Coba pilih kembali.', type: 'error' })
    }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><FileText size={22} /></span>folio<span className="brand-dot">.</span><span className="brand-description">Markdown to PDF</span></a>
      <MarkdownGuide />
    </header>
    <main>
      <section className="workspace-heading">
        <div><div className="workspace-label"><span /> alat konversi</div><h1>Konversi markdown menjadi PDF</h1><p>Tulis dalam Markdown. Jadikan PDF yang rapi dan siap dibagikan.</p></div>
        <div className="heading-actions">
          <Button variant="outline" size="lg" onClick={() => input.current?.click()}><ArrowUpFromLine data-icon="inline-start" /> Buka file .md</Button>
          <Button size="lg" onClick={async () => { await document.fonts.ready; document.title = name || 'Dokumen'; requestAnimationFrame(() => window.print()) }}><ArrowDownToLine data-icon="inline-start" /> Ekspor PDF</Button>
        </div>
        <Input ref={input} aria-label="Pilih file Markdown" type="file" accept=".md,.markdown,.txt" className="hidden" onChange={e => { void upload(e.target.files?.[0]); e.target.value = '' }} />
      </section>
      <section className={cn('workspace', `view-${view}`)}>
        <div className="workspace-bar">
          <FieldGroup className="min-w-0 flex-1 sm:max-w-sm">
            <Field orientation="horizontal" className="document-name-field">
              <FieldLabel htmlFor="document-name" className="flex-none"><FileText size={17} /><span className="sr-only">Nama dokumen</span></FieldLabel>
              <Input id="document-name" className="min-w-0 flex-1" value={name} onChange={e => setName(e.target.value)} />
            </Field>
          </FieldGroup>
          <ToggleGroup aria-label="Tampilan editor" value={[view]} onValueChange={values => { if (values.length) setView(values[0]) }} variant="outline" size="sm" spacing={0}>
            {[{ id: 'editor', icon: Code2, label: 'Editor' }, { id: 'split', icon: Columns2, label: 'Berdampingan' }, { id: 'preview', icon: Eye, label: 'Pratinjau' }].map(({ id, icon: Icon, label }) => <ToggleGroupItem key={id} value={id} title={label} aria-label={label}><Icon /></ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        <Separator />
        <div className="panes">
          <section className="editor-pane">
            <div className="pane-toolbar">
              <span><Code2 size={15} /> Markdown</span>
              <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
                <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Muat ulang contoh" title="Muat ulang contoh" />}><RotateCcw /></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Ganti tulisan dengan contoh?</AlertDialogTitle><AlertDialogDescription>Tulisan di editor akan diganti dengan contoh awal. Salin tulisanmu terlebih dahulu jika ingin menyimpannya.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => { setText(example); setResetOpen(false) }}>Muat contoh</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <Separator />
            <div className="format-toolbar">
              {[{ icon: Heading2, label: 'Judul', before: '\n## ' }, { icon: Bold, label: 'Tebal', before: '**', after: '**' }, { icon: Italic, label: 'Miring', before: '*', after: '*' }, { icon: Link, label: 'Tautan', before: '[', after: '](https://example.com)' }, { icon: List, label: 'Daftar', before: '\n- ' }, { icon: Code2, label: 'Kode', before: '`', after: '`' }].map(({ icon: Icon, label, before, after }) => <Button variant="ghost" size="icon-sm" key={label} aria-label={label} title={label} onClick={() => insert(before, after)}><Icon /></Button>)}
              <span>Markdown sederhana, ide tanpa batas.</span>
            </div>
            <FieldGroup className="editor-content">
              <Field className="h-full"><FieldLabel htmlFor="markdown-editor" className="sr-only">Editor Markdown</FieldLabel>
                <Textarea variant="editor" id="markdown-editor" ref={editor} spellCheck={false} value={text} onChange={e => setText(e.target.value)} placeholder="# Mulai ceritamu di sini" />
              </Field>
            </FieldGroup>
            <Separator />
            <div className="editor-footer"><span>{words} kata <span aria-hidden="true">·</span> {text.length} karakter</span><span>Markdown <Check size={12} /></span></div>
          </section>
          <section className="preview-pane">
            <div className="pane-toolbar"><span><Eye size={15} /> Pratinjau</span></div>
            <Separator />
            <PaginatedDocument name={name} paper={paper} font={font} margin={margin} zoom={zoom} onPagesChange={setPageCount}>
              {text.trim() ? <Markdown text={text} /> : <Empty><EmptyHeader><EmptyMedia variant="icon"><FileText /></EmptyMedia><EmptyTitle>Mulai dengan sebuah ide</EmptyTitle><EmptyDescription>Tulis Markdown di editor. Pratinjau dokumenmu akan muncul di sini.</EmptyDescription></EmptyHeader></Empty>}
            </PaginatedDocument>
            <Separator />
            <div className="preview-footer"><span><FileText size={13} /> {paper} · {pageCount} halaman<span className="paper-dimensions">{paper === 'A4' ? '210 × 297 mm' : '215,9 × 279,4 mm'}</span></span>
              <div><Button variant="ghost" size="icon-xs" aria-label="Perkecil" disabled={zoom <= 50} onClick={() => setZoom(zoom - 10)}><Minus /></Button><span>{zoom}%</span><Button variant="ghost" size="icon-xs" aria-label="Perbesar" disabled={zoom >= 120} onClick={() => setZoom(zoom + 10)}><Plus /></Button></div>
            </div>
          </section>
        </div>
        <Separator />
        <div className="settings-bar">
          <span className="settings-title"><PanelLeftClose size={16} /> Pengaturan dokumen</span>
          <FieldGroup className="document-settings-fields">
            <DocumentSetting id="paper-size" label="Ukuran kertas" value={paper} options={['A4', 'Letter']} onChange={setPaper} />
            <DocumentSetting id="document-font" label="Tipografi" value={font} options={['Literary', 'Modern']} onChange={setFont} />
            <DocumentSetting id="document-margin" label="Margin" value={margin} options={['Normal', 'Lebar', 'Tipis']} onChange={setMargin} />
          </FieldGroup>
        </div>
      </section>
      <footer className="app-footer"><span><Check size={12} /> File diproses di browser kamu. Tanpa unggah ke server.</span><span>Dibuat oleh (github: <a href="https://github.com/kevindradh" target="_blank" rel="noreferrer" className="underline underline-offset-2">kevindradh</a>)</span></footer>
    </main>
    <Toaster />
    <style>{`@page { size: ${paper === 'A4' ? 'A4' : 'letter'}; margin: 0; }`}</style>
  </div>
}
