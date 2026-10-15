# Kesiapan beta Folio dan latih.

Pemeriksaan lokal pada 15 Oktober 2026, branch `codex/latih-preview`, berdasarkan commit `6774cf1` beserta perubahan audit ini. Hasil: **siap dilanjutkan ke deployment beta terbatas**, dengan verifikasi hosting di bawah sebelum mengundang pengguna. Belum ada push atau deployment dalam pemeriksaan ini.

## Hasil verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Node dan lockfile | Node 24.21.0, sesuai engines 24.x; `npm ci --dry-run --ignore-scripts` berhasil |
| Build produksi dan changelog | Lulus, versi branch tetap 0.0.32 |
| ESLint dan tipe pengujian | Lulus |
| Regresi produksi Chromium/WebKit | **198 lulus, 6 dilewati**, 3,9 menit; kasus PDF WebKit dilewati karena API PDF hanya tersedia di Chromium |
| Audit dependensi npm, termasuk dev | **0 kerentanan dilaporkan** saat pemeriksaan |
| Pemindaian pola kredensial | Tidak ditemukan pola private key, token GitHub, access key AWS, atau API key yang diperiksa pada berkas proyek dan riwayat HEAD |
| Responsivitas | Lebar 320, 390, 768, dan 1280 px tanpa overflow horizontal pada halaman yang diuji |

Regresi meliputi impor dan penyimpanan koleksi, konflik/gagal storage, progres kuis setelah refresh, materi terakhir dibuka, panduan pertama 60 detik, pilihan ganda Markdown/LaTeX, petunjuk/pembahasan, flashcard, grid/list, routing/404, pemilih aplikasi, draft dan riwayat Folio, pagination/PDF, offline, serta update PWA yang menjaga draft. Laporan browser dan screenshot dihasilkan di `playwright-report/` dan `test-results/` yang tidak masuk Git.

Screenshot Folio desktop/ponsel, koleksi desktop, Beranda/Template ponsel, pembahasan matematika, dan flashcard panjang diperiksa secara visual. Aksi utama tetap terlihat pada kuis dan flashcard. Pemeriksaan kontras pasangan token utama memberi rasio teks/latar 12,44 (Folio) dan 11,16 (latih), teks sekunder/latar 4,57 dan 5,27, serta teks putih/tombol utama 4,98 dan 4,91. Ini pemeriksaan pasangan warna terpilih, bukan audit aksesibilitas menyeluruh.

## Penguatan dan pengujian keamanan

[Konfigurasi Vercel](../vercel.json) menambahkan Content-Security-Policy, nosniff, larangan embedding iframe, kebijakan referrer, serta menonaktifkan izin kamera/mikrofon/lokasi. `sw.js` memakai no-cache/no-store agar pembaruan tidak tertahan cache HTTP. SPA fallback tetap berlaku.

CSP membatasi skrip dan koneksi ke origin sendiri, melarang object dan skrip inline. Style inline tetap diizinkan untuk React, komponen UI, dan layout dokumen; font data diizinkan karena stylesheet KaTeX menyertakan font tertanam. Gambar lokal data/blob tetap bisa digunakan. Browser menguji konfigurasi ini pada hasil build, termasuk matematika, gambar lokal, PDF Chromium, kuis, dan reload offline tanpa pelanggaran CSP. Percobaan menyisipkan skrip inline diblokir.

[Regresi beta](../tests/beta-readiness.spec.ts) juga menguji payload HTML/script/iframe/SVG, tautan javascript/data, dan gambar jarak jauh di soal. Payload yang diuji tidak mengeksekusi kode atau meminta gambar eksternal. Parser menolak struktur JSON tidak valid, tipe hint salah, indeks jawaban salah, opsi berlebih, lebih dari 100 soal, dan input melebihi 100 KiB. HTML Markdown tetap nonaktif dan KaTeX memakai trust false. Tidak ada perubahan destruktif pada database maupun format koleksi dalam audit ini.

Audit dependensi dan pola kredensial tidak membuktikan ketiadaan seluruh kerentanan. Ini verifikasi lokal dan pengujian kasus keamanan terarah; belum mencakup penetration test eksternal. Referensi konfigurasi: [Vercel headers](https://vercel.com/docs/headers) dan [CSP pada MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy).

## Batas beta dan tindak lanjut

- Koleksi tersimpan di browser/origin/perangkat yang sama; penghapusan data situs menghapus koleksi. Pengguna perlu menyimpan JSON asli sebagai cadangan. Tidak ada sinkronisasi cloud atau integrasi LLM.
- Progres kuis dipulihkan pada tab yang sama. Tautan koleksi pribadi memerlukan datanya tersedia di browser tujuan. Flashcard kini mendukung Markdown/LaTeX; pengujian tambahannya tercatat di bawah.
- Identitas dan cache PWA masih bersama Folio; kontrol pembaruan tersedia di Folio. Browser dengan build lama perlu menerima pembaruan agar mendapat kode terbaru.
- Chunk renderer Markdown sekitar 598,77 kB (195,67 kB gzip) masih menimbulkan peringatan ukuran build. Pemisahan lebih lanjut dapat dilakukan setelah mengukur perangkat pengguna; ini bukan kegagalan build.
- Chromium dan WebKit otomatis sudah diuji. Perangkat iOS/Android fisik, Firefox, hasil GitHub Actions Linux, serta konfigurasi Vercel yang benar-benar terpasang belum diverifikasi dalam sesi ini.

## Deployment beta

Pembaruan setelah audit awal: Markdown/LaTeX flashcard dan prompt AI telah diverifikasi melalui build, lint, tipe test, serta 64 kasus Chromium/WebKit pada `tests/flashcard-markdown.spec.ts`, latih, routing, dan kesiapan beta. Screenshot rumus desktop/mobile diperiksa. Jumlah 198 pada tabel di atas tetap merupakan hasil audit awal, bukan jumlah regresi pembaruan ini.

Gunakan proyek/domain Vercel beta dengan **origin terpisah dari produksi utama** agar cache PWA dan penyimpanan lokal pengujian tidak bercampur dengan pengguna produksi. Konfigurasi proyek beta: branch `codex/latih-preview`, Node 24.x, install `npm ci`, build `npm run build`, output `dist`. Aplikasi saat ini tidak memerlukan secret environment untuk berjalan. Konfigurasi ini belum diterapkan ke akun hosting.

Setelah commit dan push:

1. Pastikan workflow GitHub Verify hijau sebelum merilis kepada penguji.
2. Periksa HTTPS, header keamanan dari respons hosting, MIME aset JS/CSS/font, serta akses langsung dan refresh `/`, `/latih/`, `/latih/koleksi`, `/latih/template`, `/latih/panduan`, URL latihan, dan URL 404. Server fixture lokal menguji header/build, bukan keseluruhan perilaku infrastruktur Vercel.
3. Pada profil browser baru, pastikan panduan mengunci selama 60 detik waktu tab terlihat. Impor JSON, kerjakan pilihan ganda dengan rumus dan flashcard, lalu refresh dan pastikan koleksi/progres/materi terakhir tetap sesuai.
4. Ulangi alur utama pada ponsel fisik, termasuk keyboard pada impor/pencarian, pembahasan, dan bar aksi kuis.
5. Tunggu cache siap, matikan jaringan, dan buka ulang kedua aplikasi. Pada deployment berikutnya, coba pembaruan dari Folio dengan draft belum tersimpan dan tab lain terbuka.

Jika ada regresi hosting, kembalikan deployment beta ke build sebelumnya. Hindari menghapus data situs sebagai langkah rollback rutin karena koleksi dan draft bersifat lokal; simpan JSON/Markdown terlebih dahulu jika reset data memang diperlukan.
