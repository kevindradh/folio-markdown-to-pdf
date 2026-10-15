import { Link, Navigate, useLocation, useNavigate, useParams, useRoutes } from 'react-router'
import { AppNotFound } from '@/components/app-not-found'
import { AppLoading } from '@/components/app-loading'
import { useEffect, useRef, useState } from 'react'
import { House, Library, Braces, Plus, Upload, ArrowUpRight, Play, Layers, ListChecks, Copy, Check, CircleHelp, Search, LayoutGrid, List } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, ButtonLink } from '@/components/ui/button'
import { AppSwitcher } from '@/components/app-switcher'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { examples, identifyCollection, parseCollection, templateFor, type Collection } from './collections'
import { StudySession } from './study-session'
import { HelpPage } from './help-page'
import { readLastOpened, saveLastOpened } from './last-opened-storage'
import { loadCollections, saveCollection } from './collection-storage'
import { RequiredGuide } from './required-guide'
import { hasReadGuide } from './guide-storage'
import { clearStudy, initialProgress, readStudy, saveStudy, type SavedStudy } from './study-storage'

const navigation = [{ id: 'beranda', label: 'Beranda', icon: House }, { id: 'koleksi', label: 'Koleksi', icon: Library }, { id: 'template', label: 'Template', icon: Braces }] as const
type Page = typeof navigation[number]['id'] | 'panduan' | 'latihan' | 'missing'
function pagePath(page: Page) { return page === 'beranda' ? '/latih/' : `/latih/${page}` }

export default function LatihApp() {
 const location = useLocation()
 const legacyPages: Record<string, string> = { '#beranda': '/latih/', '#koleksi': '/latih/koleksi', '#template': '/latih/template', '#panduan': '/latih/panduan' }
 const helpAnchors = ['#mulai-belajar', '#membuat-soal', '#format-soal', '#bantuan-impor']
 const legacy = /^\/latih\/?$/.test(location.pathname) ? legacyPages[location.hash] ?? (helpAnchors.includes(location.hash) ? `/latih/panduan${location.hash}` : null) : null
 const routes = useRoutes([
  { index: true, element: <LatihWorkspace page="beranda" /> },
  { path: 'beranda', element: <Navigate to="/latih/" replace /> },
  { path: 'koleksi', element: <LatihWorkspace page="koleksi" /> },
  { path: 'template', element: <LatihWorkspace page="template" /> },
  { path: 'panduan', element: <LatihWorkspace page="panduan" /> },
  { path: 'latihan/:collectionId', element: <LatihWorkspace page="latihan" /> },
  { path: '*', element: <LatihWorkspace page="missing" /> },
 ])
 return legacy ? <Navigate to={legacy} replace /> : routes
}

function LatihWorkspace({ page }: { page: Page }) {
 const [guideCompleted, setGuideCompleted] = useState(hasReadGuide)
 const routerNavigate = useNavigate()
 const location = useLocation()
 const { collectionId } = useParams()
 const [collections, setCollections] = useState<Collection[]>(examples)
 const [storage, setStorage] = useState<'loading' | 'ready' | 'error'>('loading')
 const [saving, setSaving] = useState(false)
 useEffect(() => {
  let active = true
  loadCollections().then(items => { if (active) { setCollections([...items, ...examples]); setStorage('ready') } }).catch(() => { if (active) setStorage('error') })
  return () => { active = false }
 }, [])
 const [study, setStudy] = useState<SavedStudy | null>(readStudy)
 const [lastOpened, setLastOpened] = useState<Collection | null>(() => readLastOpened() ?? study?.collection ?? null)
 function startStudy(item: Collection) { const identified = identifyCollection(item, collections); saveLastOpened(identified); setLastOpened(identified); clearStudy(); setStudy({ collection: identified, progress: initialProgress }); routerNavigate(`/latih/latihan/${identified.id}`) }
 const [importOpen, setImportOpen] = useState(false)
 const [source, setSource] = useState(''), [error, setError] = useState('')
 const [type, setType] = useState<Collection['type']>('multiple-choice')
 const [copied, setCopied] = useState(false), [copyError, setCopyError] = useState(false)
 const [query, setQuery] = useState('')
 const [collectionView, setCollectionView] = useState<'grid' | 'list'>(() => { try { return localStorage.getItem('latih:collection-view:v1') === 'list' ? 'list' : 'grid' } catch { return 'grid' } })
 const fileInput = useRef<HTMLInputElement>(null)
 const resumePending = useRef(study)
 useEffect(() => {
  if (!guideCompleted || storage === 'loading') return
  const resume = resumePending.current
  resumePending.current = null
  if (resume && !resume.collection.id && page !== 'latihan' && page !== 'missing') {
   const collection = identifyCollection(resume.collection, collections)
   // The previous version stored a session without a route identifier.
   saveStudy({ collection, progress: resume.progress })
   routerNavigate(`/latih/latihan/${collection.id}`, { replace: true })
  }
 }, [guideCompleted, storage, collections, page, routerNavigate])
 useEffect(() => {
  const id = location.hash.slice(1)
  if (page === 'panduan' && id) document.getElementById(id)?.scrollIntoView()
  else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
 }, [location.pathname, location.hash, page])
 function navigate(target: Page) { routerNavigate(pagePath(target)) }
 async function importCollection() {
  if (storage !== 'ready' || saving) return
  setSaving(true)
  try { const collection = await saveCollection(parseCollection(source)); setCollections(items => [collection, ...items]); setImportOpen(false); setSource(''); setError(''); navigate('koleksi') }
  catch (err) { setError(err instanceof DOMException ? 'Penyimpanan lokal gagal. Koleksi belum ditambahkan; simpan JSON asli dan coba lagi.' : (err as Error).message) }
  finally { setSaving(false) }
 }
 const prompt = `Buat soal untuk materi [ISI MATERI], sebanyak [JUMLAH SOAL]. Gunakan bahasa Indonesia. Kembalikan hanya JSON valid dengan struktur ini. Ganti contoh dengan soal dan pembahasan yang akurat. ${type === 'multiple-choice' ? 'answer adalah indeks opsi yang benar, dimulai dari 0. question, options, explanation, dan hint opsional mendukung Markdown. hint memberi petunjuk konsep tanpa membocorkan jawaban. Gunakan $...$ untuk LaTeX inline dan $$...$$ pada baris tersendiri untuk rumus blok. Escape setiap backslash LaTeX menjadi dua backslash dalam JSON dan gunakan \\n untuk baris baru. Jangan gunakan HTML mentah.' : 'answer adalah jawaban singkat berupa teks.'}\n\n${templateFor(type)}`
 const personal = collections.filter(item => !item.demo)
 const visible = page === 'beranda' ? personal.slice(0, 4) : collections.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
 const navItems = navigation.map(({ id, label, icon: Icon }) => <ButtonLink key={id} to={pagePath(id)} variant={page === id ? 'secondary' : 'ghost'} className="latih-nav-link" aria-current={page === id ? 'page' : undefined}><Icon data-icon="inline-start" /><span>{label}</span></ButtonLink>)
 const brand = <div className="navbar-brand"><Link className="brand" to="/latih/"><img className="brand-mark" src={`${import.meta.env.BASE_URL}latih.svg`} alt="" width={32} height={32} />latih<span className="brand-dot">.</span></Link><Badge variant="secondary">Preview</Badge></div>
 if (!guideCompleted) return <RequiredGuide onComplete={() => { setGuideCompleted(true); window.scrollTo({ top: 0 }) }} />
 const persistedStudy = readStudy()
 const routeCollection = collections.find(item => item.id === collectionId) ?? (lastOpened?.id === collectionId ? lastOpened : null) ?? (persistedStudy && persistedStudy.collection.id === collectionId ? persistedStudy.collection : null) ?? (study && study.collection.id === collectionId ? study.collection : null)
 if (page === 'latihan') {
  if (!routeCollection && storage === 'loading') return <AppLoading label="Memuat latihan…" latih />
  if (routeCollection) {
   const progress = persistedStudy && persistedStudy.collection.id === collectionId ? persistedStudy.progress : study && study.collection.id === collectionId ? study.progress : initialProgress
   return <StudySession key={collectionId} collection={routeCollection} initial={progress} onExit={() => { saveLastOpened(routeCollection); setLastOpened(routeCollection); clearStudy(); setStudy(null); navigate('koleksi') }} />
  }
 }
 if (page === 'missing' || page === 'latihan') return <AppNotFound application="latih" study={page === 'latihan'} />
 return <div className="latih-shell latih-dashboard">
  <aside className="latih-sidebar">{brand}<nav aria-label="Navigasi latih" className="latih-side-nav">{navItems}</nav><div className="latih-sidebar-bottom"><ButtonLink to="/latih/panduan" variant={page === 'panduan' ? 'secondary' : 'ghost'} className="latih-nav-link" aria-current={page === 'panduan' ? 'page' : undefined}><CircleHelp data-icon="inline-start" />Panduan</ButtonLink><Separator /><div className="latih-app-menu"><AppSwitcher current="latih" /><span>Aplikasi lainnya</span></div></div></aside>
  <div className="latih-dashboard-body">
   <header className="latih-mobile-header">{brand}<div className="flex items-center gap-2"><ButtonLink to="/latih/panduan" variant="ghost" size="icon-sm" aria-label="Panduan penggunaan"><CircleHelp /></ButtonLink><AppSwitcher current="latih" /></div></header>
   <main className="latih-dashboard-main">
    <section className="latih-page-heading"><div><h1>{page === 'beranda' ? 'Beranda' : page === 'koleksi' ? 'Koleksi latihan' : page === 'panduan' ? 'Panduan penggunaan' : 'Template soal'}</h1></div>{page !== 'panduan' && (page !== 'beranda' || !!personal.length) && <Button onClick={() => { setError(''); setImportOpen(true) }}><Plus data-icon="inline-start" />Impor soal</Button>}</section>
    {page === 'beranda' && <>
     {lastOpened && <section className="latih-last-opened"><h2>Terakhir dibuka</h2><Card><CardHeader><CardTitle>{lastOpened.title}</CardTitle><CardDescription>{lastOpened.type === 'multiple-choice' ? 'Pilihan ganda' : 'Flashcard'} · {lastOpened.questions.length} soal</CardDescription></CardHeader><CardContent><Button onClick={() => startStudy(lastOpened)}><Play data-icon="inline-start" />Mulai latihan</Button></CardContent></Card></section>}
     {!personal.length && <Empty className="latih-home-empty"><EmptyHeader><EmptyTitle>Belum ada koleksi pribadi</EmptyTitle><EmptyDescription>Buat soal dengan template latih., lalu impor hasil JSON dari AI kamu.</EmptyDescription></EmptyHeader><div className="flex flex-wrap justify-center gap-3"><Button variant="outline" onClick={() => navigate('template')}><Braces data-icon="inline-start" />Ambil template</Button><Button onClick={() => { setError(''); setImportOpen(true) }}><Upload data-icon="inline-start" />Impor soal</Button></div><Button variant="link" onClick={() => navigate('panduan')}>Lihat panduan</Button></Empty>}
    </>}
    {page === 'panduan' && <HelpPage onTemplate={() => navigate('template')} onImport={() => { setError(''); setImportOpen(true) }} onTry={() => startStudy(examples[0])} />}
    {(page === 'koleksi' || page === 'beranda' && !!personal.length) && <section className="latih-collections"><div className="latih-section-heading"><div><h2>{page === 'beranda' ? 'Koleksi terbaru' : 'Materi kamu'}</h2></div>{page === 'beranda' && <Button variant="ghost" onClick={() => navigate('koleksi')}>Semua koleksi<ArrowUpRight data-icon="inline-end" /></Button>}</div>
     {page === 'koleksi' && <div className="latih-collection-toolbar"><Field className="latih-search-field"><FieldLabel htmlFor="latih-search">Cari koleksi</FieldLabel><div className="latih-search-input"><Search aria-hidden="true" /><Input id="latih-search" type="search" placeholder="Cari judul materi…" value={query} onChange={event => setQuery(event.target.value)} /></div></Field><ToggleGroup value={[collectionView]} onValueChange={values => { const view = values[0]; if (view === 'grid' || view === 'list') { setCollectionView(view); try { localStorage.setItem('latih:collection-view:v1', view) } catch { /* The view remains available for this session. */ } } }} variant="outline" spacing={0} aria-label="Tampilan koleksi"><ToggleGroupItem value="grid" aria-label="Tampilan grid"><LayoutGrid />Grid</ToggleGroupItem><ToggleGroupItem value="list" aria-label="Tampilan list"><List />List</ToggleGroupItem></ToggleGroup></div>}
     {page === 'koleksi' && <p className="latih-collection-count" role="status">{visible.length} koleksi{query.trim() ? ' ditemukan' : ''}</p>}
     <div className={`latih-collection-grid${page === 'koleksi' && collectionView === 'list' ? ' is-list' : ''}`} data-view={page === 'koleksi' ? collectionView : 'grid'}>{visible.map((item, i) => <Card key={item.id ?? `${item.title}-${i}`} className="latih-exercise-card">
      <CardHeader className="latih-exercise-header"><span className="latih-collection-icon">{item.type === 'multiple-choice' ? <ListChecks aria-hidden="true" /> : <Layers aria-hidden="true" />}</span><Badge variant="outline">{item.demo ? 'Contoh' : 'Impor pribadi'}</Badge><div className="latih-exercise-title"><CardTitle>{item.title}</CardTitle><CardDescription>{item.type === 'multiple-choice' ? 'Pilihan ganda' : 'Flashcard'}</CardDescription></div></CardHeader>
      <CardFooter variant="plain" className="justify-between gap-3"><span className="latih-subtle">{item.questions.length} {item.type === 'multiple-choice' ? 'soal' : 'kartu'}</span><Button onClick={() => startStudy(item)}><Play data-icon="inline-start" />Mulai latihan</Button></CardFooter>
     </Card>)}</div>
     {!visible.length && <Empty><EmptyHeader><EmptyTitle>Koleksi belum ditemukan</EmptyTitle><EmptyDescription>Coba kata lain atau impor materi baru.</EmptyDescription></EmptyHeader></Empty>}
    </section>}
    {page === 'template' && <section className="latih-template-layout"><div><h2>Latihan seperti apa?</h2><p>Pilih format, salin instruksi, lalu tambahkan materi dan jumlah soal di AI pilihanmu.</p><ToggleGroup value={[type]} onValueChange={values => { if (values[0]) { setType(values[0] as Collection['type']); setCopied(false) } }} variant="outline" aria-label="Jenis template"><ToggleGroupItem value="multiple-choice"><ListChecks />Pilihan ganda</ToggleGroupItem><ToggleGroupItem value="flashcard"><Layers />Flashcard</ToggleGroupItem></ToggleGroup></div><Card><CardHeader><CardTitle>Instruksi untuk AI kamu</CardTitle><CardDescription>Ganti [ISI MATERI] dan [JUMLAH SOAL] sebelum dikirim.</CardDescription></CardHeader><CardContent><pre className="latih-json">{prompt}</pre></CardContent><CardFooter className="flex-col items-start gap-2"><Button onClick={async () => { try { await navigator.clipboard.writeText(prompt); setCopied(true); setCopyError(false) } catch { setCopyError(true) } }}>{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? 'Instruksi disalin' : 'Salin instruksi dan JSON'}</Button>{copyError && <p role="status">Salin teks di atas secara manual; clipboard tidak tersedia.</p>}</CardFooter></Card></section>}
    <footer className="latih-dashboard-footer"><span>{storage === 'loading' ? 'Memuat koleksi lokal…' : storage === 'error' ? 'Koleksi lokal gagal dimuat. Muat ulang halaman untuk mencoba lagi.' : 'Koleksi disimpan di browser ini.'}</span></footer>
   </main>
  </div>
  <nav className="latih-bottom-nav" aria-label="Navigasi latih ponsel">{navItems}</nav>
  <Dialog open={importOpen} onOpenChange={open => { if (!saving) setImportOpen(open) }}><DialogContent className="latih-import-dialog"><DialogHeader><DialogTitle>Impor soal kamu</DialogTitle><DialogDescription>Tempel hasil JSON dari AI. Koleksi disimpan secara lokal di browser ini.</DialogDescription></DialogHeader><FieldGroup><Field data-invalid={!!error}><FieldLabel htmlFor="latih-json-input">JSON latihan</FieldLabel><Textarea id="latih-json-input" className="min-h-52" value={source} maxLength={102400} onChange={event => { setSource(event.target.value); setError('') }} placeholder={templateFor('multiple-choice')} aria-invalid={!!error} /><FieldDescription>Maksimal 100 KiB dan 100 soal. Gunakan format dari menu Template.</FieldDescription>{error && <FieldError>{error}</FieldError>}</Field></FieldGroup><input type="file" accept=".json,application/json" ref={fileInput} className="sr-only" aria-label="Pilih file JSON" tabIndex={-1} onChange={async event => { const file = event.target.files?.[0]; if (!file) return; try { if (file.size > 102400) throw new Error('File maksimal 100 KiB.'); setSource(await file.text()); setError('') } catch (err) { setError((err as Error).message) } event.target.value = '' }} /><DialogFooter><Button variant="outline" onClick={() => fileInput.current?.click()}><Upload data-icon="inline-start" />Buka file JSON</Button><Button disabled={!source.trim() || storage !== 'ready' || saving} onClick={importCollection}>{saving ? 'Menyimpan…' : 'Tambahkan koleksi'}</Button></DialogFooter></DialogContent></Dialog>
 </div>
}
