import { useEffect } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

export function AppNotFound({ application = 'folio', study = false }: { application?: 'folio' | 'latih'; study?: boolean }) {
  const latih = application === 'latih'
  const home = latih ? '/latih/' : '/'
  const title = study ? 'Latihan tidak ditemukan' : 'Halaman tidak ditemukan'
  const destination = study ? '/latih/koleksi' : home
  const label = latih ? study ? 'Buka koleksi' : 'Buka Beranda' : 'Kembali ke Folio'
  const description = latih ? study ? 'Koleksi ini belum tersedia di browser ini. Buka koleksi lain atau impor file JSON aslinya.' : 'Alamat ini tidak tersedia. Periksa URL atau kembali ke Beranda untuk membuka latihanmu.' : 'Alamat ini tidak tersedia. Periksa URL atau kembali ke Folio untuk membuka dokumenmu.'

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${title} – ${application}.`
    return () => { document.title = previousTitle }
  }, [title, application])
  return <div className={`app-not-found${latih ? ' latih-shell' : ''}`}>
    <header><Link className="brand" to={home} aria-label={latih ? 'Beranda latih' : 'Beranda Folio'}><img className="brand-mark" src={`${import.meta.env.BASE_URL}${latih ? 'latih.svg' : 'favicon.svg'}`} alt="" width={32} height={32} />{application}<span className="brand-dot">.</span></Link></header>
    <main><Empty><EmptyHeader><p className="app-not-found-code" aria-hidden="true">404</p><EmptyTitle><h1>{title}</h1></EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader><ButtonLink to={destination} size="lg"><ArrowLeft data-icon="inline-start" />{label}</ButtonLink></Empty></main>
  </div>
}
