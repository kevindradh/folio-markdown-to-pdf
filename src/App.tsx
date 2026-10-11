import { useRef, useState, type ReactNode } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, FileText, ChevronDown, Check, Columns2, Eye, Code2, Bold, Italic, Link, List, Heading2, Minus, Plus, RotateCcw, X, BookOpen, PanelLeftClose } from 'lucide-react'
import { Button } from './components/ui/button'

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
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
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
      const code: string[] = []
      while (++i < rows.length && !rows[i].startsWith('```')) code.push(rows[i])
      result.push(<pre key={i}><code>{code.join('\n')}</code></pre>); continue
    }
    if (/^---+$/.test(line)) { result.push(<hr key={i} />); continue }
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

export default function App() {
  const [text, setText] = useState(example)
  const [name, setName] = useState('Catatan kreatif')
  const [view, setView] = useState('split')
  const [paper, setPaper] = useState('A4')
  const [font, setFont] = useState('Literary')
  const [margin, setMargin] = useState('Normal')
  const [zoom, setZoom] = useState(90)
  const [help, setHelp] = useState(false)
  const [notice, setNotice] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const editor = useRef<HTMLTextAreaElement>(null)
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  function insert(before: string, after = '') {
    const el = editor.current
    if (!el) return
    const start = el.selectionStart; const end = el.selectionEnd
    const selection = text.slice(start, end) || 'teks'
    setText(text.slice(0, start) + before + selection + after + text.slice(end))
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + before.length, start + before.length + selection.length) })
  }
  async function upload(file?: File) {
    if (!file) return
    if (!/\.(md|markdown|txt)$/i.test(file.name)) { setNotice('Pilih file .md, .markdown, atau .txt.'); return }
    try { setText(await file.text()); setName(file.name.replace(/\.[^.]+$/, '')); setNotice('File berhasil dibuka.') }
    catch { setNotice('File tidak dapat dibaca. Coba pilih kembali.') }
  }
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><FileText size={22} /></span>folio<span className="brand-dot">.</span><span className="brand-description">Markdown to PDF</span></a>
      <button className="help-button" onClick={() => setHelp(true)}><BookOpen size={16} /> Panduan Markdown</button>
    </header>
    <main>
      <section className="workspace-heading">
        <div><div className="workspace-label"><span /> Ruang menulis kamu</div><h1>Dari ide, menjadi dokumen.</h1><p>Tulis dalam Markdown. Jadikan PDF yang rapi dan siap dibagikan.</p></div>
        <div className="heading-actions"><Button variant="outline" className="upload-button" onClick={() => input.current?.click()}><ArrowUpFromLine size={16} /> Buka file .md</Button><Button className="export-button" onClick={() => { document.title = name || 'Dokumen'; window.print() }}><ArrowDownToLine size={17} /> Ekspor PDF</Button></div>
        <input ref={input} type="file" accept=".md,.markdown,.txt" hidden onChange={e => { void upload(e.target.files?.[0]); e.target.value = '' }} />
      </section>
      <section className={`workspace view-${view}`}>
        <div className="workspace-bar"><div className="document-name"><FileText size={17} /><input aria-label="Nama dokumen" value={name} onChange={e => setName(e.target.value)} /><span>.md</span><span className="session-status"><Check size={13} /> Sesi lokal</span></div><div className="view-switch" aria-label="Tampilan editor">{[{ id: 'editor', icon: Code2, label: 'Editor' }, { id: 'split', icon: Columns2, label: 'Berdampingan' }, { id: 'preview', icon: Eye, label: 'Pratinjau' }].map(({ id, icon: Icon, label }) => <button key={id} title={label} aria-label={label} aria-pressed={view === id} className={view === id ? 'selected' : ''} onClick={() => setView(id)}><Icon size={16} /></button>)}</div></div>
        <div className="panes">
          <section className="editor-pane"><div className="pane-toolbar"><span><Code2 size={15} /> Markdown</span><button title="Muat ulang contoh" aria-label="Muat ulang contoh" onClick={() => { if (text === example || window.confirm('Ganti tulisan dengan contoh awal?')) setText(example) }}><RotateCcw size={14} /></button></div>
            <div className="format-toolbar">{[{ icon: Heading2, label: 'Judul', before: '\n## ' }, { icon: Bold, label: 'Tebal', before: '**', after: '**' }, { icon: Italic, label: 'Miring', before: '*', after: '*' }, { icon: Link, label: 'Tautan', before: '[', after: '](https://example.com)' }, { icon: List, label: 'Daftar', before: '\n- ' }, { icon: Code2, label: 'Kode', before: '`', after: '`' }].map(({ icon: Icon, label, before, after }) => <button key={label} aria-label={label} title={label} onClick={() => insert(before, after)}><Icon size={16} /></button>)}<span>Markdown sederhana, ide tanpa batas.</span></div>
            <div className="editor-content"><div className="line-numbers" aria-hidden="true">{text.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}</div><textarea ref={editor} aria-label="Editor Markdown" spellCheck={false} value={text} onChange={e => setText(e.target.value)} placeholder="# Mulai ceritamu di sini" /></div>
            <div className="editor-footer"><span>{words} kata <i /> {text.length} karakter</span><span>Markdown <Check size={12} /></span></div>
          </section>
          <section className="preview-pane"><div className="pane-toolbar"><span><Eye size={15} /> Pratinjau</span><span className="live-status"><span /> Diperbarui langsung</span></div><div className="paper-stage"><article className={`paper font-${font.toLowerCase()} margin-${margin.toLowerCase()}`} style={{ zoom: zoom / 100, aspectRatio: paper === 'A4' ? '210 / 297' : '216 / 279' }}><div className="paper-topline">{name || 'Tanpa judul'}</div><div className="document-body">{text.trim() ? <Markdown text={text} /> : <p className="empty-document">Tulisanmu akan tampil di sini.</p>}</div><div className="paper-footer"><span>Dibuat dengan folio</span><span>Markdown to PDF</span></div></article></div><div className="preview-footer"><span><FileText size={13} /> {paper} <span className="paper-dimensions">{paper === 'A4' ? '210 × 297 mm' : '216 × 279 mm'}</span></span><div><button aria-label="Perkecil" disabled={zoom <= 50} onClick={() => setZoom(zoom - 10)}><Minus size={14} /></button><span>{zoom}%</span><button aria-label="Perbesar" disabled={zoom >= 120} onClick={() => setZoom(zoom + 10)}><Plus size={14} /></button></div></div></section>
        </div>
        <div className="settings-bar"><span className="settings-title"><PanelLeftClose size={16} /> Pengaturan dokumen</span><label>Ukuran kertas <span className="select-wrap"><select value={paper} onChange={e => setPaper(e.target.value)}><option>A4</option><option>Letter</option></select><ChevronDown size={12} /></span></label><label>Tipografi <span className="select-wrap"><select value={font} onChange={e => setFont(e.target.value)}><option>Literary</option><option>Modern</option></select><ChevronDown size={12} /></span></label><label>Margin <span className="select-wrap"><select value={margin} onChange={e => setMargin(e.target.value)}><option>Normal</option><option>Lebar</option><option>Tipis</option></select><ChevronDown size={12} /></span></label></div>
      </section>
      <footer className="app-footer"><span><span className="privacy-dot" /> File diproses di browser kamu. Tanpa unggah ke server.</span><span>Dibuat untuk ide yang layak dibagikan.</span></footer>
      {notice && <div className="toast" role="status">{notice}<button aria-label="Tutup notifikasi" onClick={() => setNotice('')}><X size={16} /></button></div>}
      {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Escape') setHelp(false); if (e.key === 'Tab') { const buttons = e.currentTarget.querySelectorAll('button'); const first = buttons[0]; const last = buttons[buttons.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() } } }}><button autoFocus className="close-dialog" aria-label="Tutup panduan" onClick={() => setHelp(false)}><X size={20} /></button><h2 id="help-title">Sedikit sintaks. Banyak kemungkinan.</h2><p>Format yang didukung oleh pratinjau awal ini:</p><dl><dt># Judul</dt><dd>Judul utama</dd><dt>## Subjudul</dt><dd>Judul bagian</dd><dt>**tebal** dan *miring*</dt><dd>Penekanan teks</dd><dt>- Item daftar</dt><dd>Daftar berpoin</dd><dt>&gt; Kutipan</dt><dd>Blok kutipan</dd><dt>[teks](https://...)</dt><dd>Tautan</dd><dt>`kode` atau ```</dt><dd>Kode inline atau blok kode</dd></dl><p>Untuk PDF, pilih “Save as PDF” di dialog cetak. Sesuaikan ukuran kertas di dialog dan nonaktifkan header/footer browser.</p><Button className="export-button" onClick={() => setHelp(false)}>Mulai menulis</Button></section></div>}
    </main><style>{`@page { size: ${paper === 'A4' ? 'A4' : 'letter'}; margin: ${margin === 'Lebar' ? '25mm' : margin === 'Tipis' ? '12mm' : '20mm'}; }`}</style>
  </div>
}
