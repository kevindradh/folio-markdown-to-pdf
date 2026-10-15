import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { finishGuide, guideDuration as duration, readGuideProgress, storeGuideProgress } from './guide-storage'

export function RequiredGuide({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(readGuideProgress)
  const progressRef = useRef(progress)
  const elapsed = progress.elapsed
  useEffect(() => {
    let previous = performance.now()
    let visible = document.visibilityState === 'visible'
    function tick() {
      const now = performance.now()
      if (visible) progressRef.current = { ...progressRef.current, elapsed: Math.min(duration, progressRef.current.elapsed + now - previous) }
      previous = now
      progressRef.current = storeGuideProgress(progressRef.current)
      setProgress(progressRef.current)
    }
    function visibility() { tick(); visible = document.visibilityState === 'visible' }
    const interval = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pagehide', tick)
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', tick) }
  }, [])
  const remaining = Math.ceil((duration - elapsed) / 1000)
  function complete() {
    progressRef.current = storeGuideProgress(progressRef.current)
    setProgress(progressRef.current)
    if (progressRef.current.elapsed < duration) return
    finishGuide()
    onComplete()
  }
  return <div className="latih-shell latih-required-guide">
    <header className="latih-guide-header"><div className="brand"><img className="brand-mark" src={`${import.meta.env.BASE_URL}latih.svg`} alt="" width={32} height={32} />latih<span className="brand-dot">.</span></div><span>Panduan pertama</span></header>
    <main className="latih-guide-reading">
      <h1>Sebelum mulai belajar</h1>
      <p className="latih-guide-intro">Baca panduan ini selama satu menit. Fitur aplikasi akan tersedia setelah waktu selesai dan kamu menekan tombol di bawah.</p>
      <ol className="latih-guide-steps">
        <li><h2>Ambil template soal</h2><p>Buka <strong>Template</strong>, pilih Pilihan ganda atau Flashcard, lalu salin instruksi dan format JSON yang disediakan.</p></li>
        <li><h2>Buat soal di AI pilihanmu</h2><p>Ganti <code>[ISI MATERI]</code> dengan topik atau materi belajar dan <code>[JUMLAH SOAL]</code> dengan jumlah soal. Kirim instruksi ke AI yang kamu gunakan. latih. tidak membuat soal secara otomatis.</p></li>
        <li><h2>Impor hasil JSON</h2><p>Gunakan tombol salin pada blok kode JSON dari AI agar format rumus tetap utuh. Impor menerima objek JSON atau satu blok kode json lengkap tanpa kalimat pengantar. Pilih <strong>Impor soal</strong>, tempel hasilnya atau buka file <code>.json</code>, lalu pilih <strong>Tambahkan koleksi</strong>. Batasnya 100 KiB dan 100 soal per koleksi.</p></li>
        <li><h2>Kerjakan dan baca pembahasannya</h2><p>Pilih <strong>Mulai latihan</strong> pada koleksi. Untuk pilihan ganda, pilih jawaban lalu tekan <strong>Periksa jawaban</strong>. Baca pembahasan sebelum memilih <strong>Berikutnya</strong>. Tombol Petunjuk tersedia jika soal menyertakannya. Pada flashcard, tekan <strong>Lihat jawaban</strong> untuk membalik kartu.</p></li>
      </ol>
      <section><h2>Hal yang perlu kamu tahu</h2><ul><li><strong>Periksa hasil AI.</strong> Soal, jawaban, dan pembahasannya bisa keliru; cocokkan dengan sumber belajarmu.</li><li><strong>Markdown dan rumus didukung.</strong> Soal pilihan ganda, opsi, pembahasan, dan petunjuk bisa memakai Markdown serta LaTeX. Ikuti contoh pada Template agar JSON valid.</li><li><strong>Koleksi tersimpan di browser ini.</strong> Refresh tidak menghapus koleksi. Menghapus data situs akan menghapusnya; simpan file JSON asli sebagai cadangan.</li><li><strong>Refresh saat kuis akan memulihkan sesi pada tab yang sama.</strong> Tombol kembali ke koleksi mengakhiri sesi tersebut.</li><li><strong>Panduan bisa dibuka lagi.</strong> Gunakan menu Panduan di sidebar desktop atau ikon bantuan di header ponsel.</li></ul></section>
    </main>
    <footer className="latih-guide-lock"><div className="latih-guide-lock-inner"><div><span className="latih-guide-time"><Clock3 aria-hidden="true" />{remaining ? `Waktu membaca tersisa ${remaining} detik` : 'Waktu membaca selesai'}</span><p>Hitung mundur berhenti saat tab tidak terlihat.</p></div><Button size="lg" disabled={remaining > 0} onClick={complete}>Saya sudah membaca<ArrowRight data-icon="inline-end" /></Button></div><progress aria-label="Waktu membaca panduan" value={elapsed} max={duration} /></footer>
  </div>
}
