import { flushSync } from 'react-dom'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
import { tableCells, tableAlignment } from '@/lib/markdown-table'
import { cn } from '@/lib/utils'
import { MathExpression } from '@/components/math-expression'
import { HighlightedCode } from '@/components/highlighted-code'
import { useDocumentDraft } from '@/hooks/use-document-draft'
import { inputError, MAX_DOCUMENT_BYTES, markdownFilename } from '@/lib/document-draft'
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
  // Unclosed display delimiters must not rescan the remaining document for every line.
  const bracketEnd = rows.findLastIndex(row => /\\{1,2}\]\s*$/.test(row))
  const dollarEnd = rows.findLastIndex(row => /\$\$\s*$/.test(row))
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
    if (displayStart && (displayStart[0] === '$$' ? dollarEnd : bracketEnd) >= i) {
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
    const alignment = tableAlignment(line, rows[i + 1])
    if (alignment) {
      const headers = tableCells(line)
      const entries: string[][] = []
      const key = i
      i++
      while (i + 1 < rows.length && rows[i + 1].trim() && rows[i + 1].includes('|')) {
        const cells = tableCells(rows[++i])
        entries.push(headers.map((_, column) => cells[column] ?? ''))
      }
      result.push(<table key={key} className="markdown-table">
        <thead><tr>{headers.map((cell, column) => <th key={column} scope="col" style={{ textAlign: alignment[column] }}>{inline(cell)}</th>)}</tr></thead>
        <tbody>{entries.map((cells, row) => <tr key={row}>{cells.map((cell, column) => <td key={column} style={{ textAlign: alignment[column] }}>{inline(cell)}</td>)}</tr>)}</tbody>
      </table>)
      continue
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
        <dt>| Kolom | Kolom |</dt><dd>Tabel: tambahkan baris pemisah |---|---| di bawah header. Gunakan :---:, atau ---: untuk perataan.</dd>
        <dt>{String.raw`\(x^2\) atau $x^2$`}</dt><dd>Rumus inline</dd>
        <dt>{String.raw`\[...\] atau $$...$$`}</dt><dd>Rumus terpisah, termasuk matriks dan pecahan. Bisa ditulis dalam beberapa baris.</dd>
        <dt>[teks](https://...)</dt><dd>Tautan</dd>
        <dt>`kode` atau ```javascript</dt><dd>Kode berwarna. Tulis nama bahasa setelah tiga backtick, misalnya javascript, ts, python, atau css. Tanpa nama bahasa, deteksi otomatis; gunakan text untuk teks biasa.</dd>
      </dl>
      <p className="text-sm text-muted-foreground">Untuk PDF, pilih “Save as PDF” di dialog cetak. Gunakan ukuran kertas yang dipilih di aplikasi, skala 100%, margin “None”, dan nonaktifkan header/footer browser agar hasilnya sesuai pratinjau. Aktifkan pencetakan background untuk mempertahankan latar tema kode.</p>
      <DialogFooter><DialogClose render={<Button />}>Mulai menulis</DialogClose></DialogFooter>
    </DialogContent>
  </Dialog>
}

export default function App() {
  const { draft, update, setDraft, saved } = useDocumentDraft({ text: example, name: 'Catatan kreatif', paper: 'A4', font: 'Literary', margin: 'Normal', codeTheme: 'light' })
  const { text, name, paper, font, margin, codeTheme } = draft
  const setName = (value: string) => update('name', value)
  const setPaper = (value: string) => update('paper', value)
  const setFont = (value: string) => update('font', value)
  const setMargin = (value: string) => update('margin', value)
  const setCodeTheme = (value: string) => update('codeTheme', value)
  const [view, setView] = useState('split')
  const [previewText, setPreviewText] = useState(text)
  const [layoutPending, setLayoutPending] = useState(true)
  useEffect(() => {
    if (text === previewText) return
    const timer = window.setTimeout(() => { setLayoutPending(true); setPreviewText(text) }, 250)
    return () => clearTimeout(timer)
  }, [text, previewText])
  useEffect(() => {
    const flushPreview = () => flushSync(() => setPreviewText(text))
    // Capture runs before pagination's beforeprint handler, even during the typing debounce.
    window.addEventListener('beforeprint', flushPreview, true)
    return () => window.removeEventListener('beforeprint', flushPreview, true)
  }, [text])
  const previewContent = useMemo(() => previewText.trim() ? <Markdown text={previewText} /> : <Empty><EmptyHeader><EmptyMedia variant="icon"><FileText /></EmptyMedia><EmptyTitle>Mulai dengan sebuah ide</EmptyTitle><EmptyDescription>Tulis Markdown di editor. Pratinjau dokumenmu akan muncul di sini.</EmptyDescription></EmptyHeader></Empty>, [previewText])
  const previewPending = text !== previewText || layoutPending
  function setText(next: string) {
    const error = inputError(next)
    if (error) { toast.add({ title: 'Tulisan tidak ditambahkan.', description: error, type: 'error' }); return false }
    update('text', next)
    return true
  }
  function downloadMarkdown() {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = markdownFilename(name)
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
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
    if (!setText(text.slice(0, start) + before + selection + after + text.slice(end))) return
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
    if (file.size > MAX_DOCUMENT_BYTES) {
      toast.add({ title: 'File terlalu besar.', description: 'Pilih file maksimal 100 KiB.', type: 'error' })
      return
    }
    try {
      const next = await file.text()
      const error = inputError(next)
      if (error) { toast.add({ title: 'File tidak dibuka.', description: error, type: 'error' }); return }
      setDraft(previous => ({ ...previous, text: next, name: file.name.replace(/\.[^.]+$/, '').slice(0, 120) }))
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
        <div><div className="workspace-label"><span /> Alat Konversi</div><h1>Konversi Markdown Menjadi PDF</h1><p>Tulis dalam Markdown. Jadikan PDF yang rapi dan siap dibagikan.</p></div>
        <div className="heading-actions">
          <Button variant="outline" size="lg" onClick={() => input.current?.click()}><ArrowUpFromLine data-icon="inline-start" /> Buka file .md</Button>
          <Button size="lg" disabled={previewPending} onClick={async () => { await document.fonts.ready; document.title = name || 'Dokumen'; requestAnimationFrame(() => window.print()) }}><ArrowDownToLine data-icon="inline-start" /> Ekspor PDF</Button>
        </div>
        <Input ref={input} aria-label="Pilih file Markdown" type="file" accept=".md,.markdown,.txt" className="hidden" onChange={e => { void upload(e.target.files?.[0]); e.target.value = '' }} />
      </section>
      <section className={cn('workspace', `view-${view}`)}>
        <div className="workspace-bar">
          <FieldGroup className="min-w-0 flex-1 sm:max-w-sm">
            <Field orientation="horizontal" className="document-name-field">
              <FieldLabel htmlFor="document-name" className="flex-none"><FileText size={17} /><span className="sr-only">Nama dokumen</span></FieldLabel>
              <Input maxLength={120} id="document-name" className="min-w-0 flex-1" value={name} onChange={e => setName(e.target.value)} />
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
              <div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={downloadMarkdown}><ArrowDownToLine data-icon="inline-start" /> Unduh .md</Button>
              <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
                <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Muat ulang contoh" title="Muat ulang contoh" />}><RotateCcw /></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Ganti tulisan dengan contoh?</AlertDialogTitle><AlertDialogDescription>Tulisan di editor akan diganti dengan contoh awal. Unduh Markdown terlebih dahulu untuk menyimpan salinan tulisanmu.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => { setText(example); setResetOpen(false) }}>Muat contoh</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog></div>
            </div>
            <Separator />
            <div className="format-toolbar">
              {[{ icon: Heading2, label: 'Judul', before: '\n## ' }, { icon: Bold, label: 'Tebal', before: '**', after: '**' }, { icon: Italic, label: 'Miring', before: '*', after: '*' }, { icon: Link, label: 'Tautan', before: '[', after: '](https://example.com)' }, { icon: List, label: 'Daftar', before: '\n- ' }, { icon: Code2, label: 'Kode', before: '`', after: '`' }].map(({ icon: Icon, label, before, after }) => <Button variant="ghost" size="icon-sm" key={label} aria-label={label} title={label} onClick={() => insert(before, after)}><Icon /></Button>)}
            </div>
            <FieldGroup className="editor-content">
              <Field className="h-full"><FieldLabel htmlFor="markdown-editor" className="sr-only">Editor Markdown</FieldLabel>
                <Textarea variant="editor" id="markdown-editor" ref={editor} spellCheck={false} value={text} onChange={e => setText(e.target.value)} onPaste={event => {
                  const element = event.currentTarget
                  const next = text.slice(0, element.selectionStart) + event.clipboardData.getData('text') + text.slice(element.selectionEnd)
                  const error = inputError(next)
                  if (error) {
                    event.preventDefault()
                    toast.add({ title: 'Tulisan tidak ditambahkan.', description: error, type: 'error' })
                  }
                }} aria-describedby="draft-status" placeholder="# Mulai ceritamu di sini" />
              </Field>
            </FieldGroup>
            <Separator />
            <div className="editor-footer"><span>{words} kata <span aria-hidden="true">·</span> {text.length} karakter</span><span id="draft-status" role="status">{saved ? 'Draft tersimpan' : 'Draft belum tersimpan; unduh .md'}</span></div>
          </section>
          <section className="preview-pane">
            <div className="pane-toolbar"><span><Eye size={15} /> Pratinjau</span><span role="status">{previewPending ? 'Memperbarui halaman…' : ''}</span></div>
            <Separator />
            <PaginatedDocument onPendingChange={setLayoutPending} name={name} paper={paper} font={font} margin={margin} codeTheme={codeTheme} zoom={zoom} onPagesChange={setPageCount}>
              {previewContent}
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
            <Field className="min-w-0 flex-1 sm:w-auto sm:flex-none">
              <FieldLabel id="code-theme-label">Tema kode</FieldLabel>
              <ToggleGroup aria-labelledby="code-theme-label" value={[codeTheme]} onValueChange={values => { if (values.length) setCodeTheme(values[0]) }} variant="outline" spacing={0}>
                <ToggleGroupItem value="light">Terang</ToggleGroupItem>
                <ToggleGroupItem value="dark">Gelap</ToggleGroupItem>
              </ToggleGroup>
            </Field>
          </FieldGroup>
        </div>
      </section>
      <footer className="app-footer"><span><Check size={12} /> File diproses di browser kamu. Tanpa unggah ke server.</span><span>Dibuat oleh (GitHub: <a href="https://github.com/kevindradh" target="_blank" rel="noreferrer" className="underline underline-offset-2">kevindradh</a>)</span></footer>
    </main>
    <Toaster />
    <style>{`@page { size: ${paper === 'A4' ? 'A4' : 'letter'}; margin: 0; }`}</style>
  </div>
}
