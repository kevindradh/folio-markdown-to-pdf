# folio — Markdown to PDF

Aplikasi React, Vite, dan TypeScript untuk menulis Markdown, melihat pratinjau dokumen, lalu menyimpannya sebagai PDF melalui dialog cetak browser.

## Menjalankan proyek

Gunakan **Node.js 24.x** dan npm. Versi Node dicatat di `.nvmrc`, `package.json`, dan workflow CI. Jika memakai nvm, jalankan `nvm use` sebelum memasang dependensi. Gunakan lockfile yang tersedia:

```sh
npm ci
npm run dev
```

Aplikasi pada branch `main` tidak memerlukan environment variable, API key, atau backend. Jangan mengunggah dokumen pribadi maupun file kredensial ke repository. `.gitignore` mengecualikan environment file, dependensi, hasil build/pengujian, dan konfigurasi deployment lokal; `package-lock.json`, sumber aplikasi, serta contoh environment yang sudah disanitasi tetap dapat dilacak.

## Preview latih.

Pada branch `codex/latih-preview`, navbar Folio menyediakan tautan **latih.** ke `/latih/`. Halaman ini masih berupa preview dengan tema terpisah dan tautan kembali ke Folio. Kode aplikasi berada di `src/apps/latih/`; entry `src/app-entry.tsx` memuat aplikasi sesuai URL secara lazy dalam satu build. URL `/latih/` dan `/latih` membuka halaman yang sama. Hosting harus mengarahkan URL aplikasi ke `index.html` (SPA fallback).

## Publikasi ke GitHub dan Vercel

1. Buat repository GitHub kosong. Jangan membuat README atau `.gitignore` baru dari GitHub karena proyek ini sudah memilikinya.
2. Commit perubahan lokal, tambahkan URL repository GitHub sebagai remote `origin`, lalu push branch **main**. Branch `codex/visit-counter` adalah fitur penghitung yang ditunda dan tidak perlu dipublikasikan sebagai aplikasi utama.
3. Di Vercel, pilih **Add New → Project** lalu impor repository tersebut. Gunakan pengaturan berikut:

   | Pengaturan | Nilai |
   | --- | --- |
   | Framework Preset | Vite |
   | Root Directory | Root repository |
   | Production Branch | `main` |
   | Node.js Version | `24.x` |
   | Install Command | `npm ci` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Environment Variables | Tidak diperlukan untuk fitur pada `main` |

4. Setelah deployment berhasil, buka URL situs dan periksa editor, unggah Markdown/gambar lokal, pemulihan draft, serta ekspor PDF.
5. Tambahkan domain sendiri melalui **Project Settings → Domains**, kemudian sesuaikan DNS di penyedia domain mengikuti nilai yang diberikan Vercel. Domain tidak perlu dipindahkan registrasinya.

Workflow `.github/workflows/verify.yml` memeriksa audit, lint, dan pengujian saat push/pull request dengan izin baca repository. Deployment otomatis Vercel dan workflow verifikasi adalah proses terpisah; jika ingin mewajibkan pemeriksaan lulus sebelum merge ke `main`, atur aturan branch di GitHub. CI tidak melakukan deployment situs.

Referensi: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [pengaturan domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain). Hosting Vercel Hobby ditujukan untuk penggunaan pribadi nonkomersial; periksa ketentuan paket jika tujuan aplikasi berubah.

Perintah lainnya:

| Perintah | Fungsi |
| --- | --- |
| `npm run build` | Memeriksa TypeScript dan membuat build produksi di `dist/`. |
| `npm run lint` | Memeriksa kode dengan ESLint. |
| `npm run preview` | Menjalankan pratinjau build produksi. |
| `npm test` | Build, pemeriksaan tipe pengujian, dan regresi Chromium/WebKit serta PDF Chromium. |
| `npm run test:chromium` | Menjalankan pengujian khusus Chromium. |

## Fitur

- Editor Markdown, toolbar format, impor file `.md`, `.markdown`, atau `.txt`, dan unduhan `.md`.
- Mode editor, pratinjau, atau tampilan berdampingan.
- Sinkronisasi scroll dua arah yang bisa diaktifkan atau dinonaktifkan.
- Pratinjau beberapa halaman sesuai ukuran A4 atau Letter, dengan nomor halaman.
- Pilihan tipografi Literary/Modern, margin Normal/Lebar/Tipis, dan zoom.
- Syntax highlighting untuk kode inline dan blok kode, dengan pilihan tema Terang/Gelap.
- Tabel Markdown dengan header, perataan kolom, serta kelanjutan antarhalaman.
- Gambar lokal PNG/JPEG/WebP yang dipulihkan setelah reload.
- Daftar bernomor/bertingkat, checklist, dan catatan kaki bertautan.
- Rumus LaTeX inline dan blok melalui KaTeX, termasuk matriks, pecahan, dan operator.
- Project untuk mengelompokkan banyak dokumen, penyimpanan otomatis, dan riwayat versi lokal otomatis + manual.

Kontrol antarmuka menggunakan shadcn/ui berbasis Base UI. Panduan pengembangan berada di [AGENTS.md](AGENTS.md).

## Menulis kode dengan syntax highlighting

Tambahkan nama bahasa setelah tiga backtick:

````markdown
```javascript
// Contoh JavaScript
const message = "Halo, folio!";
console.log(message);
```

```python
def greet(name):
    return f"Halo, {name}"
```
````

Bahasa umum seperti JavaScript (`js`, `jsx`), TypeScript (`ts`, `tsx`), Python, HTML, CSS, JSON, Bash, dan SQL tersedia. Kode inline di antara backtick dan blok tanpa nama bahasa memakai deteksi otomatis. Deteksi otomatis bisa keliru; tulis nama bahasa untuk hasil yang lebih tepat. Gunakan `text` untuk menonaktifkan warna pada sebuah blok. Bahasa yang tidak dikenali ditampilkan sebagai teks biasa.

Pada Pengaturan dokumen, pilih **Terang** atau **Gelap** secara terpisah untuk **Kode inline** (di antara satu backtick) dan **Blok kode** (fence tiga backtick atau kode berindentasi). Blok tetap memakai tema blok walaupun isinya hanya satu baris. Pilihan berlaku pada pratinjau serta cetak PDF dan tersimpan bersama dokumen/riwayatnya; tema awal keduanya Terang. Dokumen lama memakai tema sebelumnya untuk keduanya sampai diubah. Tema hanya mengubah warna, bukan ukuran teks atau pembagian halaman.

Pengaturan dibagi menjadi kelompok **Halaman** (kertas, tipografi, margin) dan **Tema kode**. Kedua kelompok tampil berdampingan di desktop dan ditumpuk pada layar yang lebih sempit.

Warna membedakan token seperti keyword, string, angka, nama fungsi, dan komentar. Highlighting tidak menjalankan kode atau memvalidasi kesalahan program. Kode dirender sebagai elemen React dari AST lowlight, tanpa menyisipkan HTML mentah.

## Tabel Markdown

Gunakan baris header dan baris pemisah, diikuti isi tabel:

```markdown
| Besaran | Alat | Pemasangan |
|---|---|---|
| Arus | Amperemeter | Seri dengan jalur arus |
| Tegangan | Voltmeter | Paralel dengan komponen |
| Hambatan | Ohmmeter | Pada kedua ujung komponen tanpa daya luar |
```

Pemisah `:---`, `:---:`, dan `---:` mengatur perataan kiri, tengah, dan kanan. Teks tebal, miring, kode, tautan, serta rumus inline dapat digunakan dalam sel. Untuk karakter pipe sebagai isi, tulis `\|`. Sel yang kurang diisi menjadi kosong; sel tambahan di luar jumlah kolom header diabaikan.

Tabel panjang dilanjutkan pada halaman berikutnya dengan header berulang. Baris dipertahankan utuh jika muat pada satu halaman; baris yang lebih tinggi dari satu halaman dilanjutkan per sel agar seluruh teks tetap tersedia. Tampilan tabel yang sama digunakan saat mencetak.

## Rumus matematika

Gunakan `\(...\)` atau `$...$` untuk rumus inline. Gunakan `\[...\]` atau `$$...$$` untuk rumus terpisah. Blok rumus dapat ditulis dalam beberapa baris:

```latex
\[
A = \begin{bmatrix}
a & b & c \\
d & e & f \\
g & h & i
\end{bmatrix}
\]

\[
\boxed{A^{-1} = \frac{1}{\det(A)}\operatorname{adj}(A)}
\]
```

Masukkan sintaks tersebut langsung ke editor tanpa pagar kode jika ingin merender rumus. Rumus di dalam backtick atau pagar kode tetap berupa kode. Rumus yang tidak valid ditampilkan sebagai sumber berwarna merah dengan penjelasan saat diarahkan kursor; delimiter yang belum ditutup tetap berupa teks. KaTeX mendukung sintaks matematikanya, bukan seluruh paket atau dokumen LaTeX.

Pagination mempertahankan rumus sebagai satu kesatuan. Rumus blok yang melebihi ukuran area cetak diperkecil agar muat dalam lembar; rumus sangat besar sebaiknya dipecah menjadi beberapa persamaan terpisah.

## Menyimpan PDF

1. Pilih ukuran kertas, tipografi, dan margin di aplikasi.
2. Klik **Ekspor PDF**, lalu pilih **Save as PDF** pada dialog cetak.
3. Gunakan ukuran kertas yang sama, orientasi portrait, skala **100%**, margin **None**, dan nonaktifkan header/footer browser. Aktifkan pencetakan background jika browser menyediakan opsi tersebut agar latar blok kode ikut tercetak.

Cetak menggunakan susunan halaman, tipografi, dan warna token yang sama dengan pratinjau. Zoom hanya mengubah tampilan layar. Pengaturan dialog cetak yang berbeda dapat mengubah hasil akhir.

## Batasan dan verifikasi

Parser memakai markdown-it dengan dukungan judul, paragraf, daftar bernomor/bertingkat, checklist, kutipan, pemisah, tautan, penekanan teks, kode, tabel, rumus, gambar lokal, dan catatan kaki. HTML mentah tidak dijalankan; bukan renderer dokumen LaTeX penuh. Belum ada backend atau sinkronisasi cloud. Draft memakai penyimpanan lokal browser.

Build dan lint berhasil. Pengujian browser mencakup pagination A4/Letter, pengaturan dokumen, syntax highlighting, serta kode TypeScript 150 baris yang terbagi enam halaman tanpa kehilangan teks atau overflow. File PDF dari mesin cetak Chromium telah diperiksa: jumlah halaman sesuai pratinjau pada A4/Letter, ukuran kertas benar, footer berurutan, serta penanda isi lengkap. Dialog cetak Safari/Firefox belum diverifikasi; rincian dan batas pemeriksaan tercatat di AGENTS.md.

## Pengujian dan dependensi

Setelah `npm ci`, pasang browser uji sekali:

```sh
npx playwright install chromium webkit
npm run lint
npm test
```

Di Linux, gunakan `npx playwright install --with-deps chromium webkit`. Pengujian membuka build produksi pada port 4173; pastikan port tersebut tersedia. Playwright menghasilkan laporan, trace kegagalan, dan PDF uji di direktori yang diabaikan Git. PDF diuji pada Chromium; WebKit menguji layout dan tombol ekspor. Workflow GitHub menjalankan audit, lint, dan pengujian yang sama pada Node 24. Playwright memakai dua worker lokal dan satu worker saat CI untuk mengurangi perebutan CPU/memori. Regresi umum memakai reduced motion; pengujian layout/fokus dialog tetap memeriksa animasi normal. Kasus pagination panjang dan 21 siklus riwayat pada WebKit CI diberi batas 180 detik, sedangkan kasus lainnya tetap 60 detik.

Komponen UI tetap memakai shadcn/ui berbasis Base UI. CLI shadcn tidak menjadi dependensi aplikasi untuk menghapus rantai dependensi tooling yang rentan. Stylesheet resmi dipertahankan di `src/styles/shadcn.css` dengan lisensi pada `THIRD_PARTY_NOTICES.md`. CLI tetap dapat digunakan untuk pemeliharaan setelah keamanan rilisnya diperiksa. Audit dependensi proyek pada 12 Oktober 2026: **0 vulnerabilities**.

## Draft dan unduhan Markdown

Tulisan, nama dokumen, ukuran kertas, tipografi, margin, dan tema kode disimpan otomatis di browser yang sama dan dipulihkan setelah reload. Status **Draft tersimpan** menunjukkan penyimpanan berhasil. Jika status menyebut draft belum tersimpan, gunakan **Unduh .md** di toolbar editor untuk menyimpan salinan UTF-8. Unduhan memakai isi editor terbaru dan nama dokumen.

Klik **Project** untuk membuat kelompok, membuat atau mencari dokumen, mengganti nama project, serta memindahkan atau menghapus dokumen. Project memiliki satu tingkat; nama dokumen diubah melalui kolom nama pada editor. **Buka file .md** membuat dokumen baru di project aktif. Draft lama otomatis dipindahkan ke project **Umum** pada pemakaian pertama fitur ini.

Klik **Riwayat** untuk melihat sumber Markdown setiap versi dan memulihkannya. Versi otomatis dibuat setelah jeda menulis **15 detik**, saat berpindah dokumen, atau sebelum membuat/mengimpor dokumen baru. **Simpan versi** menandai perubahan penting secara manual. Isi identik tidak digandakan; menyimpan manual menandai versi identik terakhir sebagai manual. Pemulihan mengembalikan teks, nama, dan pengaturan kertas/tipografi/margin/tema kode, serta menyimpan isi saat ini sebagai versi sebelum pemulihan. Mengganti tulisan dengan contoh juga menyimpan versi terlebih dahulu.

Penyimpanan menggunakan IndexedDB, maksimal **20 project**, **100 dokumen**, **20 versi per dokumen**, dan **20 MiB** untuk isi dokumen serta riwayat. Versi tertua dipangkas saat batas jumlah atau kapasitas tercapai; isi dokumen terbaru tetap dipertahankan. Kapasitas gambar lokal dihitung terpisah. Penghapusan membutuhkan konfirmasi; project berisi dokumen harus dikosongkan dahulu. Menghapus dokumen terakhir menyediakan dokumen kosong baru agar editor tetap dapat dipakai.

Data hanya tersedia pada origin/browser/perangkat yang sama, tanpa akun atau sinkronisasi cloud. Menghapus data browser menghapus project, dokumen, riwayat, dan gambar. Unduh `.md` sebagai cadangan; unduhan tidak mencakup riwayat atau lampiran gambar. Saat dua tab mengubah dokumen yang sama, penyimpanan tab kedua ditolak agar perubahan sebelumnya tidak tertimpa. Tulisan tab tersebut tetap di editor: unduh salinannya sebelum memuat ulang.

## Batas input dan respons pratinjau

File dan isi editor maksimal **100 KiB (102.400 byte UTF-8)** dan **5.000 baris**. File diperiksa sebelum dibaca; paste atau perubahan yang melewati batas ditolak tanpa mengganti tulisan sebelumnya. Pisahkan dokumen yang lebih besar menjadi beberapa file.

Pratinjau diperbarui setelah jeda mengetik 250 ms. Pagination dikerjakan bertahap dan pekerjaan lama dibatalkan saat isi berubah. Selama **Memperbarui halaman…**, pratinjau terakhir tetap terlihat dan Ekspor PDF belum dapat digunakan. Unduh .md tetap tersedia. Cetak langsung melalui shortcut browser memperbarui isi terbaru sebelum mencetak.

Blok kode lebih dari 8.000 karakter tetap dicetak utuh dengan tema pilihan, tetapi tanpa warna token. Rumus lebih dari 2.000 karakter ditampilkan sebagai sumber dengan petunjuk untuk membaginya. Pengukuran dokumen tetap menggunakan thread utama browser; batas input dan jeda pemrosesan mengurangi risiko tersendat pada dokumen besar.

Verifikasi terbaru: **75 pengujian lulus, 3 kasus PDF WebKit dilewati**; build, lint, dan pemeriksaan tipe test berhasil. Pengujian mencakup project, impor/pemindahan dokumen, riwayat otomatis/manual, pemulihan aman, konflik antar-tab, batas riwayat/kapasitas, migrasi draft, unduhan, storage gagal, batas input, pagination, cetak, serta tampilan desktop/mobile. PDF Chromium tetap diuji langsung. Regresi dua tab memastikan aksi riwayat tidak mengganti dokumen aktif mengikuti tab lain; konfirmasi pemulihan mempertahankan versi pilihan meskipun riwayat otomatis diperbarui.

## Gambar lokal

Klik ikon **Sisipkan gambar** pada toolbar editor, lalu pilih PNG, JPEG, atau WebP. Folio menyimpan gambar di browser dan menyisipkan referensi seperti `![Diagram](folio-image:...)`. Gambar tetap tersedia setelah reload, termasuk pada PDF.

Untuk Markdown impor yang berisi `![Diagram](./gambar/diagram.png)`, pilih file lokal `diagram.png` melalui tombol yang sama. Folio menghubungkannya berdasarkan nama file tanpa menambahkan salinan gambar ke tulisan.

Batas: 2 MiB per gambar, 4.096 piksel per sisi, dan total penyimpanan gambar 10 MiB. Ukuran gambar pada kertas menyesuaikan ruang dengan rasio tetap. Gambar yang belum tersedia ditandai dan tombol PDF menunggu sampai gambar dilengkapi. Gambar eksternal tidak diambil otomatis.

Unduhan `.md` berisi teks/referensi, bukan file gambar. Simpan gambar aslinya untuk memindahkan dokumen ke perangkat lain. Aset lokal hilang jika data browser dihapus.

## Daftar bernomor, bertingkat, dan checklist

```markdown
1. Langkah pertama
    - Penjelasan tambahan
    - [x] Bagian selesai
    - [ ] Bagian yang perlu dikerjakan
2. Langkah kedua
```

Gunakan indentasi sesuai posisi teks item induk. Daftar dapat mencampur nomor dan poin; nomor serta tingkatnya dipertahankan ketika berpindah halaman. Checklist ditampilkan sebagai status statis pada dokumen; ubah `[ ]` menjadi `[x]` di editor untuk mencentangnya.

## Catatan kaki

```markdown
Penjelasan dengan sumber[^sumber]. Sumber yang sama dapat disebut lagi[^sumber].

[^sumber]: Keterangan **sumber** dengan rumus $x^2$.
    Baris lanjutan ditulis dengan empat spasi.
```

Catatan diberi nomor sesuai referensi dan ditampilkan di akhir dokumen. Pratinjau memiliki tautan menuju catatan dan kembali ke referensi.

Verifikasi fitur Markdown terbaru: **53 pengujian lulus, 3 kasus PDF WebKit dilewati**. Build/lint berhasil dan audit dependensi bersih. PDF Chromium telah diperiksa untuk gambar tertanam, isi daftar, checklist, serta catatan kaki.


## Penggunaan offline / PWA

Folio dapat digunakan offline setelah dibuka sekali saat online dan tooltip ikon status di navbar menunjukkan **Siap digunakan offline**. Kode aplikasi, stylesheet, font Inter/KaTeX, serta ikon disimpan sebagai cache; project, dokumen, riwayat, dan gambar tetap disimpan di IndexedDB. Saat koneksi terputus, aplikasi dapat dibuka ulang, dipakai untuk mengedit/impor file lokal, dan mengunduh Markdown. Ekspor PDF tetap memakai dialog cetak/Save as PDF yang tersedia di perangkat.

Untuk memasang aplikasi, gunakan menu instalasi atau penambahan ke layar utama/Dock yang disediakan browser. Pilihan dan tampilan instalasi bergantung pada browser/perangkat. Hosting produksi harus menggunakan HTTPS; localhost dapat dipakai untuk pengujian. Pemasangan PWA tidak wajib untuk menggunakan cache offline.

Jika versi baru tersedia, ikon pembaruan dengan tooltip **Perbarui aplikasi** muncul. Tombol menunggu draft tersimpan dan proses impor selesai; saat ditekan, aplikasi menyimpan ulang draft terbaru sebelum mengaktifkan versi baru. Hanya tab yang meminta pembaruan dimuat ulang. Tab lain tetap terbuka. Jika penyimpanan gagal, pembaruan dibatalkan dan pengguna dapat mengunduh .md. Pemeriksaan versi dilakukan saat membuka aplikasi dan saat kembali ke aplikasi/online, paling sering sekali per jam selama sesi berjalan.

PWA tetap memakai penyimpanan browser, bukan folder perangkat atau sinkronisasi cloud. Batas gambar 2 MiB per file/10 MiB total tetap berlaku. Menghapus data situs atau penghapusan oleh browser dapat menghilangkan cache serta dokumen/gambar lokal; simpan salinan Markdown dan gambar asli. Perubahan domain atau port memakai penyimpanan terpisah.

Service worker hanya aktif pada build produksi, agar cache tidak mengganggu pengembangan. Ikon status tetap terlihat pada server pengembangan, dengan tooltip **Mode pengembangan · cache offline tidak aktif**. Browser yang tidak mendukung service worker menampilkan keterangan penggunaan offline tidak didukung. Untuk meninjau secara lokal:

```sh
npm run build
npm run preview
```

Buka URL preview, tunggu status offline siap, lalu putuskan koneksi dan muat ulang halaman. Server pengembangan pada port 5173 tidak mengaktifkan PWA. Pengujian `tests/pwa.spec.ts` memakai build produksi dan mencakup reload/tab baru offline, dokumen/gambar/font/rumus, impor dan riwayat offline, unduhan, PDF Chromium, pembaruan atas tindakan pengguna, tab lain, serta kegagalan penyimpanan.

## Tur aplikasi

Pada kunjungan pertama tanpa draft sebelumnya, tur singkat menyorot editor, pratinjau, pengaturan dokumen, Project/Riwayat, dan Ekspor PDF. Gunakan **Lanjut** atau **Kembali**, lalu **Mulai menulis** di langkah terakhir. **Lewati** atau Escape menutup tur; pilihan tersebut diingat di browser dan origin yang sama.

Pengguna yang sudah memiliki draft tidak mendapat tur otomatis. Tur dapat dibuka kembali melalui **Panduan Markdown → Tur aplikasi**, termasuk saat offline. Tur tidak mengubah tulisan atau pengaturan dokumen. Jika tampilan editor/pratinjau sedang dipilih, tur menampilkan keduanya sementara dan mengembalikan pilihan tampilan setelah ditutup. Tur tidak ikut tercetak pada PDF. Jika penyimpanan browser tidak tersedia, tur tetap dapat dibuka manual dan ditutup.

## Versi aplikasi dan changelog

Nomor versi tampil di samping logo folio. Klik **Changelog** di navbar, di sebelah **Panduan Markdown**, untuk melihat perubahan aplikasi. Riwayat ini tersedia offline. Nomor tersebut mengikuti build yang sedang dibuka; ketika ada pembaruan PWA, nomor berubah setelah pengguna menekan **Perbarui aplikasi** dan aplikasi dimuat ulang.

Penomoran dimulai dari commit pertama pada `main`: **v0.0.1**. Sebanyak 19 commit awal dipetakan menjadi v0.0.1–v0.0.19, dan penerapan versioning menjadi **v0.0.20**. Catatan versi awal merupakan rekonstruksi riwayat pengembangan, bukan rilis atau tag yang pernah dipublikasikan. Branch yang belum digabung tidak termasuk. Riwayat lengkap juga tersedia di [CHANGELOG.md](CHANGELOG.md).

Untuk perubahan berikutnya pada `main`, naikkan nomor patch dengan `npm version patch --no-git-tag-version`, lalu tambahkan entri terbaru di `src/data/releases.json` dengan nomor yang sama, tanggal, judul, dan daftar perubahan untuk pengguna. Gunakan `commit: null` untuk entri yang belum memiliki commit dan `retrospective: false` untuk catatan baru. Pertahankan nomor dan isi catatan historis. Jalankan `npm run changelog` untuk memperbarui CHANGELOG.md, lalu build, lint, dan pengujian yang relevan sebelum commit. Penomoran berlanjut sebagai v0.0.21, v0.0.22, dan seterusnya; satu perubahan yang dikomit ke main mendapat satu entri baru.

Versi berasal dari `package.json`; isi changelog antarmuka dan Markdown berasal dari data yang sama. Build memeriksa kecocokan versi, lockfile, urutan catatan, serta CHANGELOG.md tanpa membutuhkan riwayat Git lengkap pada CI. Nomor versi aplikasi terpisah dari versi format penyimpanan dokumen.

## Sinkronisasi scroll

Aktifkan **Sinkronkan scroll** di sebelah pilihan tampilan untuk membuat editor dan pratinjau saling mengikuti. Kondisi awal nonaktif; pilihan diingat pada browser dan origin yang sama, terpisah dari isi dokumen. Pada layar sempit, kontrol berupa ikon rantai dengan tooltip.

Sinkronisasi berlaku ketika kedua panel ditampilkan, termasuk tampilan bertumpuk di ponsel. Posisi mengikuti rentang baris Markdown serta fragmen halaman, bukan persentase panjang kedua panel. Posisi di dalam blok panjang merupakan perkiraan; markup, rumus, dan gambar dapat membuat tinggi sumber dan hasil berbeda. Saat pratinjau diperbarui, sinkronisasi menunggu halaman terbaru siap. Mode Editor atau Pratinjau saja menjeda sinkronisasi tanpa menghapus pilihan.

## Pemisah halaman dan awal bab

Klik **Sisipkan pemisah halaman** pada toolbar editor, atau tulis penanda berikut pada baris tersendiri, di luar kode, daftar, dan kutipan:

```markdown
Isi bagian sebelumnya.

<!-- pagebreak -->

## Lampiran

Isi lampiran dimulai pada halaman baru.
```

Penanda tidak tercetak. Pemisah di awal/akhir dokumen atau beberapa pemisah berurutan tidak menghasilkan halaman kosong tambahan. `---` tetap menjadi garis horizontal biasa. Penanda di dalam blok kode, kode inline, kutipan, atau daftar ditampilkan sebagai teks; HTML lain tetap tidak dirender.

Pada **Pengaturan dokumen → Halaman → Awal bab**, pilih **Alur biasa**, **Halaman baru untuk #**, atau **Halaman baru untuk # dan ##**. Pilihan berlaku untuk judul tingkat tersebut di luar daftar/kutipan, termasuk judul Setext, dan tersimpan bersama dokumen serta riwayat. Pratinjau dan PDF menggunakan pembagian halaman yang sama. Pemisah manual tetap berlaku ketika pilihan awal bab aktif, tanpa menambahkan halaman kosong ganda. Untuk memulai bagian kode pada halaman baru, letakkan penanda sebelum pembuka fence. Unduhan `.md` mempertahankan penanda manual; pilihan awal bab adalah pengaturan aplikasi dan tidak disisipkan ke file `.md`.

## Mode fokus

Klik ikon **Mode fokus** (perluas layar) di sebelah pilihan tampilan. Editor memenuhi area browser, dengan judul halaman, navigasi, dan pengaturan disembunyikan sementara. Halaman luar tidak dapat digulir; pada tampilan awal Editor, hanya tulisan di dalam editor yang digulir. Lebar tulisan dibatasi agar nyaman dibaca pada layar besar.

Pilihan **Pratinjau** atau **Berdampingan** tetap tersedia dalam mode fokus; masing-masing panel dokumen memiliki scroll sendiri, dan sinkronisasi scroll tetap dapat diaktifkan ketika kedua panel ditampilkan. Pada ponsel, kedua panel ditumpuk di dalam tinggi layar. Keluar melalui ikon **Keluar mode fokus** atau **Escape**. Escape saat dialog terbuka menutup dialog terlebih dahulu.

Tampilan sebelum masuk serta posisi halaman luar dikembalikan ketika keluar. Isi, pilihan dokumen, dan autosave tetap berjalan. Mode fokus berlaku selama sesi dan tidak tersimpan setelah reload. Ini memakai area viewport aplikasi, sehingga tidak memerlukan izin Fullscreen API atau menyembunyikan toolbar browser. Unduh .md tetap tersedia; keluar dari mode fokus untuk membuka pengaturan atau tombol Ekspor PDF. Cetak melalui shortcut browser saat mode fokus tetap memakai seluruh halaman dokumen.

Pada ponsel, label Panduan Markdown diringkas menjadi Panduan agar navbar tetap langsing.
