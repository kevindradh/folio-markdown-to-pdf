# folio — Markdown to PDF

Aplikasi React, Vite, dan TypeScript untuk menulis Markdown, melihat pratinjau dokumen, lalu menyimpannya sebagai PDF melalui dialog cetak browser.

## Menjalankan proyek

Gunakan **Node.js 24.x** dan npm. Versi Node dicatat di `.nvmrc`, `package.json`, dan workflow CI. Jika memakai nvm, jalankan `nvm use` sebelum memasang dependensi. Gunakan lockfile yang tersedia:

```sh
npm ci
npm run dev
```

Aplikasi pada branch `main` tidak memerlukan environment variable, API key, atau backend. Jangan mengunggah dokumen pribadi maupun file kredensial ke repository. `.gitignore` mengecualikan environment file, dependensi, hasil build/pengujian, dan konfigurasi deployment lokal; `package-lock.json`, sumber aplikasi, serta contoh environment yang sudah disanitasi tetap dapat dilacak.

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

Pilih **Tema kode → Terang** atau **Gelap** pada Pengaturan dokumen. Pilihan berlaku untuk kode inline dan blok kode pada pratinjau serta cetak PDF; tema awal adalah Terang. Tema hanya mengubah warna, bukan ukuran teks atau pembagian halaman.

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
npm test -- --workers=2
```

Di Linux, gunakan `npx playwright install --with-deps chromium webkit`. Pengujian membuka build produksi pada port 4173; pastikan port tersebut tersedia. Playwright menghasilkan laporan, trace kegagalan, dan PDF uji di direktori yang diabaikan Git. PDF diuji pada Chromium; WebKit menguji layout dan tombol ekspor. Workflow GitHub menjalankan audit, lint, dan pengujian yang sama pada Node 24.

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

Verifikasi terbaru: **71 pengujian lulus, 3 kasus PDF WebKit dilewati**; build, lint, dan pemeriksaan tipe test berhasil. Pengujian mencakup project, impor/pemindahan dokumen, riwayat otomatis/manual, pemulihan aman, konflik antar-tab, batas riwayat/kapasitas, migrasi draft, unduhan, storage gagal, batas input, pagination, cetak, serta tampilan desktop/mobile. PDF Chromium tetap diuji langsung.

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
