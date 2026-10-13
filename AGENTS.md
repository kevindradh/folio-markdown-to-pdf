# Panduan Proyek

Dokumentasi ini berdasarkan pemeriksaan kode, konfigurasi, dan paket lokal pada 11 Oktober 2026. Perbarui jika struktur atau tooling berubah.

## Gambaran umum

- Tujuan proyek: membangun tool untuk mengonversi Markdown menjadi dokumen PDF. Markdown menjadi input, dan file PDF menjadi hasil konversi. Detail fitur dan alur penggunaan akan ditentukan lebih lanjut bersama pengguna.
- Nama paket: `markdown-to-pdf`; paket privat, versi aplikasi mengikuti `package.json` (saat penerapan versioning: `0.0.20`), menggunakan ES modules (`type: module`).
- Aplikasi frontend React + Vite + TypeScript. Tampilan awal di `src/App.tsx` menggunakan nama sementara “folio”, dengan editor dan pratinjau berdampingan.
- Editor, unggah file Markdown, pratinjau Markdown terstruktur, pengaturan kertas/tipografi/margin, dan zoom sudah tersedia. Ekspor memakai dialog cetak browser (Save as PDF). Parser awal belum mendukung seluruh spesifikasi Markdown; rumus memakai KaTeX dan syntax highlighting memakai lowlight. Tulisan, nama dokumen, dan pengaturan tersimpan otomatis sebagai banyak dokumen dalam project IndexedDB, dengan riwayat versi otomatis + manual; tombol Unduh .md menyediakan salinan file.
- Belum ada router, backend, atau state management eksternal. Pengujian regresi memakai Playwright pada build produksi.
- Gunakan npm; lockfile yang tersedia adalah `package-lock.json`. `README.md` berisi panduan menjalankan proyek, fitur, syntax highlighting, ekspor PDF, dan batasan aplikasi.
- Repository Git sudah diinisialisasi. Periksa `git status` sebelum mengubah file agar perubahan pengguna tetap terjaga.

## Skill proyek

- Skill `frontend-design` tersedia di `.agents/skills/frontend-design/SKILL.md`; metadata instalasinya tercatat di `skills-lock.json` dengan sumber `anthropics/skills`.
- Baca dan gunakan skill tersebut saat membangun UI baru atau mengubah desain UI yang sudah ada.
- Panduannya mencakup arah visual sesuai konteks produk, palet warna, tipografi, layout, dan penulisan teks antarmuka. Susun rencana desain singkat, tinjau terhadap brief, lalu implementasikan dan evaluasi hasil visualnya.
- Perhatikan responsivitas, fokus keyboard, aksesibilitas visual, dan preferensi reduced motion. Ikuti brief pengguna serta integrasikan desain dengan stack proyek yang tersedia.
- Skill `shadcn` tersedia di `.agents/skills/shadcn/SKILL.md`; metadata instalasinya tercatat di `skills-lock.json` dengan sumber `shadcn-ui/ui`.
- Baca dan gunakan skill `shadcn` saat menambah, memperbaiki, menata, atau menyusun komponen shadcn/ui. Gunakan `frontend-design` untuk arah visual dan `shadcn` untuk implementasi komponen sesuai API serta pola komposisinya.
- Utamakan komponen yang sudah terpasang, variant bawaan, token warna semantik, dan helper `cn()`. Perhatikan aturan form, aksesibilitas overlay, serta ikon pada referensi skill.
- Untuk pekerjaan komponen, periksa konteks dengan `npx shadcn@latest info` dan baca dokumentasi melalui `npx shadcn@latest docs <component>` beserta URL hasilnya. Proyek ini menggunakan npm, Base UI (`base-nova`), dan ikon Lucide; jangan mencampur API Base UI dengan Radix.
- Sebelum memperbarui komponen, tinjau perubahan melalui `--dry-run` dan `--diff`, serta pertahankan modifikasi lokal. Panduan lengkap dan referensi tambahan berada di direktori skill `shadcn`.

## Dependensi aplikasi

Versi berikut adalah rentang yang dideklarasikan di `package.json`, bukan selalu versi persis yang terpasang. Lihat `package-lock.json` atau `npm ls --depth=0` untuk versi hasil resolusi.

| Paket | Versi deklarasi | Peran dan pemakaian saat ini |
| --- | --- | --- |
| `react`, `react-dom` | `^19.2.8` | UI React dan rendering melalui `createRoot`; entry point memakai `StrictMode`. |
| `@base-ui/react` | `^1.9.0` | Primitive UI; komponen Button memakai `@base-ui/react/button`. |
| Stylesheet shadcn lokal | asal `4.21.4` | `src/styles/shadcn.css` mempertahankan stylesheet resmi tanpa memasang CLI sebagai dependensi aplikasi. Komponen shadcn tetap di `src/components/ui/`; konfigurasi di `components.json`. |
| `tailwindcss`, `@tailwindcss/vite` | `^4.3.3` | Styling utility Tailwind v4, terintegrasi lewat plugin Vite. |
| `class-variance-authority` | `^0.7.1` | Mendefinisikan variant dan size Button melalui `cva` serta tipe `VariantProps`. |
| `cn` | `^0.4.0` | Helper class name yang dipakai langsung oleh Button dan diekspor ulang di `src/lib/utils.ts`. |
| `katex` | `^0.19.0` | Merender rumus LaTeX ke HTML/MathML beserta font lokal untuk pratinjau dan cetak. |
| `markdown-it` | `^15.0.2` | Parser token Markdown terstruktur; tabel kompatibel folio dan rule matematika/checklist ditambahkan secara lokal. |
| `markdown-it-footnote` | `^4.0.0` | Definisi serta referensi catatan kaki bernomor, termasuk referensi berulang. |
| `lowlight` | `^3.3.0` | Syntax highlighting berbasis AST highlight.js, dirender sebagai elemen React tanpa HTML mentah. |
| `lucide-react` | `^1.55.0` | Library ikon yang dipilih di konfigurasi shadcn dan digunakan di antarmuka aplikasi. |
| `tw-animate-css` | `^1.4.0` | Stylesheet utility animasi, diimpor oleh CSS global. |
| `@fontsource-variable/inter` | `^5.3.0` | Font Inter Variable lokal, diimpor oleh CSS global. |

## Dependensi pengembangan

| Paket | Versi deklarasi | Peran |
| --- | --- | --- |
| `@types/markdown-it`, `@types/markdown-it-footnote` | `^14.2.0`, `^3.0.4` | Tipe untuk kompatibilitas plugin footnote; token renderer memakai tipe parser markdown-it 15 yang sudah bundled. |
| `@playwright/test` | `^1.64.0` | Pengujian browser Chromium/WebKit, assertion DOM, serta ekspor PDF Chromium. |
| `pdfjs-dist` | `^6.4.299` | Membaca ukuran, halaman, footer, dan teks PDF dalam pengujian; tidak masuk bundle aplikasi. |
| `vite` | `^8.3.0` | Development server, build produksi, dan preview. |
| `@vitejs/plugin-react` | `^6.1.1` | Integrasi React pada Vite. |
| `typescript` | `~6.0.2` | Pemeriksaan tipe melalui `tsc -b` sebelum build Vite. |
| `@types/react`, `@types/react-dom` | `^19.2.18`, `^19.2.7` | Definisi tipe React dan React DOM. |
| `@types/node` | `^24.13.3` | Definisi tipe Node untuk konfigurasi tooling; bukan penetapan versi runtime Node. |
| `eslint`, `@eslint/js` | `^10.10.0`, `^10.0.1` | ESLint flat config dan aturan JavaScript recommended. |
| `typescript-eslint` | `^8.69.0` | Integrasi lint TypeScript dengan aturan recommended. |
| `eslint-plugin-react-hooks` | `^7.1.1` | Aturan React Hooks. |
| `eslint-plugin-react-refresh` | `^0.5.6` | Pemeriksaan pola ekspor untuk React Fast Refresh. |
| `globals` | `^17.12.0` | Definisi global browser untuk lint. |

## Struktur dan konfigurasi

- `index.html`: elemen mount `#root`, entry `/src/main.tsx`, favicon, dan pemuatan CSS global lewat `<link href="/src/style.css">`. CSS tidak diimpor dari `main.tsx` saat ini.
- `src/main.tsx`: memasang `App` di dalam `StrictMode`.
- `src/App.tsx`: workspace folio, draft, pengaturan, impor Markdown/gambar, serta ekspor; renderer dokumen dipisahkan ke `src/components/markdown-document.tsx`.
- `src/components/highlighted-code.tsx`: rendering token syntax highlighting dari AST lowlight ke elemen React, termasuk deteksi bahasa dan fallback teks biasa.
- `src/styles/shadcn.css`: stylesheet resmi yang disalin dari paket shadcn 4.21.4; lisensinya di `THIRD_PARTY_NOTICES.md`.
- `src/style.css`: import Tailwind, animasi, stylesheet shadcn lokal, dan Inter; token warna OKLCH, radius, serta tema terang/gelap dengan kelas `.dark`. Belum ada kontrol UI untuk mengganti tema.
- `src/components/ui/button.tsx`: Button berbasis Base UI dengan variant `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`, serta ukuran biasa dan ikon. Mengekspor `Button`; `buttonVariants` merupakan konstanta internal.
- `src/components/ui/`: komponen resmi shadcn berbasis Base UI untuk kontrol, form, dialog, status, dan notifikasi. Textarea memiliki variant `editor`; helper variant Toggle dipisah ke `toggle-variants.ts` agar kompatibel dengan Fast Refresh.
- `src/lib/document-draft.ts`: batas input UTF-8/baris, migrasi draft versi 1, salinan pemulihan localStorage, dan sanitasi nama unduhan.
- `src/lib/document-library.ts`: penyimpanan IndexedDB project/dokumen/versi, batas kapasitas, dan transaksi pemulihan.
- `src/components/document-library.tsx`: dialog shadcn project, pengelolaan dokumen, dan riwayat versi.
- `src/hooks/use-document-draft.ts`: migrasi/pemulihan awal, antrean autosave, pergantian dokumen, checkpoint otomatis/manual, dan penanganan konflik/gagal storage.
- `src/lib/toast.ts`: manager notifikasi bersama untuk komponen shadcn Toaster dan aksi aplikasi.
- `src/lib/utils.ts`: re-export `cn` dari paket `cn`; tidak menggunakan implementasi lokal berbasis `clsx`/`tailwind-merge`.
- `src/assets/` dan `public/`: aset gambar/logo serta favicon dan ikon statis.
- `vite.config.ts`: plugin React dan Tailwind; alias `@` menuju `src`.
- `components.json`: shadcn style `base-nova`, TSX aktif, RSC nonaktif, base color `neutral`, CSS variables aktif, ikon Lucide. Alias komponen/UI/lib/utils/hooks mengarah ke `@/...`; folder hooks berisi hook penyimpanan draft.
- `tsconfig.json`: project references ke konfigurasi aplikasi dan tooling, serta pemetaan `@/*` ke `./src/*`. Konfigurasi anak tidak memakai `extends` ke file ini, sehingga alias aplikasi juga dideklarasikan langsung dalam `tsconfig.app.json`.
- `tsconfig.app.json`: target ES2023, module ESNext, resolusi bundler, JSX `react-jsx`, `noEmit`, dan pemeriksaan unused locals/parameters. `strict` belum diaktifkan secara eksplisit.
- `tsconfig.node.json`: konfigurasi untuk `vite.config.ts`, target ES2023, module NodeNext, dan tipe Node.
- `eslint.config.js`: memeriksa `**/*.{ts,tsx}` menggunakan recommended JavaScript, TypeScript, React Hooks, dan React Refresh; mengabaikan `dist` dan `.agents/**` (aset referensi skill, bukan kode aplikasi).

## Perintah kerja

| Perintah | Fungsi |
| --- | --- |
| `npm ci` | Memasang dependensi berdasarkan lockfile. |
| `npm run dev` | Menjalankan development server Vite. |
| `npm run build` | Menjalankan `tsc -b` lalu build produksi ke `dist/`. |
| `npm run lint` | Menjalankan ESLint. |
| `npm run preview` | Meninjau hasil build menggunakan Vite preview. |
| `npm test` | Build, pemeriksaan tipe pengujian, lalu regresi Chromium/WebKit terhadap build produksi. |
| `npm run test:chromium` | Pengujian build produksi khusus Chromium, termasuk PDF. |

Pasang browser uji sekali dengan `npx playwright install chromium webkit` (Linux: tambahkan `--with-deps`). Pengujian memakai port 4173 khusus dan tidak menggunakan server dev pengguna. Workflow `.github/workflows/verify.yml` menjalankan audit, lint, dan pengujian pada Node 24. Runtime ditetapkan **Node 24.x** melalui `engines` di `package.json` dan `.nvmrc`.

## Pedoman perubahan

- **Wajib menggunakan komponen shadcn/ui untuk kontrol antarmuka.** Gunakan skill `shadcn` saat implementasi. Jangan membuat pengganti kustom untuk Button, Input, Textarea, Select, ToggleGroup, Dialog, AlertDialog, Badge, Empty, Separator, atau Toast yang tersedia. HTML semantik tetap digunakan untuk struktur halaman dan isi dokumen Markdown.

- Ikuti pola React function component dan TypeScript yang sudah tersedia.
- Gunakan komponen UI yang tersedia, Base UI, serta token Tailwind/CSS proyek sebelum menambahkan solusi serupa.
- Pertahankan konfigurasi alias Vite dan TypeScript agar konsisten saat menambahkan penggunaan import `@/`.
- Jika mengubah dependensi, sinkronkan `package.json` dan `package-lock.json` melalui npm.
- Jalankan build dan lint untuk perubahan kode/config yang relevan; bedakan masalah yang sudah ada dari regresi baru.
- Jangan menganggap fitur Markdown/PDF sudah tersedia hanya berdasarkan nama proyek.

## Hasil verifikasi awal

- `npm ls --depth=0`: berhasil. Versi terpasang antara lain React/React DOM `19.3.0`, Vite `8.3.4`, dan TypeScript `6.0.3`; perbedaan dari angka dasar di manifest masih sesuai rentangnya.
- `npm run build`: berhasil. Pada pemeriksaan awal Vite memberi peringatan penggunaan `__dirname` di `vite.config.ts`. Ini telah diperbaiki menjadi `import.meta.dirname` saat persiapan publikasi; build dengan loader native juga telah diverifikasi.
- `npm run lint`: gagal dengan satu error `react-refresh/only-export-components` pada ekspor `buttonVariants` di `src/components/ui/button.tsx`. Error awal ini sudah diperbaiki saat implementasi UI dengan menjadikan `buttonVariants` konstanta internal.
- Pembaruan setelah pemeriksaan awal: Git sudah diinisialisasi dan `git status` berhasil dijalankan. Skill `frontend-design` juga sudah tersedia di direktori skill proyek.

## Pembaruan 12 Oktober 2026

- Kontrol antarmuka telah dimigrasikan ke komponen shadcn/ui: Button, Input, Textarea, Select, ToggleGroup, Field, Dialog, AlertDialog, Badge, Separator, Empty, dan Toast.
- Warna aplikasi memakai token tema semantik. Dialog panduan dan konfirmasi reset menggunakan manajemen fokus bawaan Base UI.

## Pagination pratinjau

- `src/components/paginated-document.tsx` mengukur konten DOM pada ukuran fisik A4 (210 × 297 mm) atau Letter (215,9 × 279,4 mm), lalu membaginya menjadi lembar dengan header dan nomor halaman. Margin Normal/Lebar/Tipis adalah 20/25/12 mm.
- Paragraf, kutipan, kode, dan item daftar yang melebihi satu halaman dipecah sambil mempertahankan teks serta markup inline. Judul mengikuti blok berikutnya. Sumber pengukuran berada dalam portal tersembunyi agar mode editor tetap dapat menghitung halaman.
- Zoom hanya mengubah skala tampilan. Cetak memakai DOM halaman yang sama, tanpa transformasi, dengan `@page` margin 0 dan ukuran kertas pilihan. Gunakan skala cetak 100%, margin None, serta matikan header/footer browser.
- Verifikasi browser: dokumen panjang, A4/Letter, margin dan tipografi alternatif, mode editor, serta zoom; teks sumber dan hasil pagination identik, tidak ada overflow atau judul tertinggal dalam dokumen uji. Build dan lint berhasil. Aturan cetak telah diperiksa; file PDF hasil dialog cetak belum diverifikasi langsung karena browser dalam aplikasi tidak menyediakan dialog cetak yang dapat dikendalikan.

## Syntax highlighting

- `src/components/highlighted-code.tsx` memakai grammar `common` dari lowlight. Kode inline dan fenced code tanpa bahasa memakai deteksi otomatis terbatas pada JavaScript, TypeScript, Python, Bash, JSON, CSS, HTML/XML, dan SQL.
- Bahasa setelah fence (misalnya `javascript`, `ts`, `python`, `css`, `html`, `jsx`, atau `tsx`) digunakan secara eksplisit. `text` dan bahasa yang tidak dikenali tetap berupa teks biasa. Highlighting memberi warna token, bukan validasi atau diagnosis kesalahan program.
- Warna token berada di CSS bersama untuk pratinjau dan cetak. Pagination mempertahankan span token, teks, dan indentasi ketika kode panjang terbagi halaman.
- Verifikasi: build/lint berhasil; browser menguji kode inline, JavaScript, Python, HTML, teks biasa, bahasa tak dikenal, dan blok TypeScript 150 baris yang menjadi enam halaman. Teks identik dengan sumber dan tidak ada overflow. Konten HTML dalam kode tidak dieksekusi. Verifikasi PDF langsung masih mengikuti batasan pada bagian pagination.

## Dukungan matematika

- `src/components/math-expression.tsx` merender rumus dengan KaTeX, CSS/font lokal, `trust: false`, pembatas ekspansi macro, serta fallback untuk input salah. Hanya HTML hasil KaTeX yang disisipkan; HTML Markdown pengguna tetap tidak dirender.
- Inline: `\(...\)` atau `$...$`. Blok: `\[...\]` atau `$$...$$`, termasuk beberapa baris; delimiter dengan dua backslash juga diterima. Kode dalam backtick/fence tidak diproses sebagai matematika.
- Pagination memakai satu karakter logis untuk tiap rumus dan mengkloning seluruh subtree HTML/MathML. Rumus blok dipindahkan sebagai satu kesatuan dan diperkecil bila melampaui area kertas. Jangan membelah subtree KaTeX berdasarkan teks DOM.
- Verifikasi browser: matriks 3×3, invers, boxed, determinan, inline, dan penjumlahan. Dokumen 24 halaman dengan 540 rumus mempertahankan seluruh markup rumus identik dengan sumber, tanpa overflow atau error rendering. Hasil PDF langsung belum diverifikasi.

## Tabel Markdown

- `src/lib/markdown-table.ts` memisahkan sel, mempertahankan pipe yang di-escape dan pipe dalam code span, serta memvalidasi baris pemisah dengan minimal tiga tanda minus per kolom. Jumlah kolom pemisah harus sama dengan header.
- Renderer di `src/components/markdown-document.tsx` menghasilkan tabel HTML semantik untuk isi dokumen (bukan kontrol UI), dengan `thead`, `tbody`, header `scope="col"`, dan perataan dari titik dua. Inline formatting, syntax highlighting, dan matematika tetap tersedia dalam sel.
- Pagination membagi tabel per baris dan mengulang header. Baris melebihi satu halaman dibagi per sel menggunakan pemotongan logis yang mempertahankan formula dan markup inline. Lebar kolom tetap konsisten antarhalaman melalui table-layout fixed.
- Verifikasi browser: contoh alat ukur tiga baris; tabel 100 baris pada delapan halaman, header berulang, 100 rumus utuh, isi identik, dan tanpa overflow. Satu baris panjang pada tujuh halaman mempertahankan isi setiap sel tanpa overflow. Build/lint berhasil.

## Tema kode pada dokumen

- Pilihan Terang/Gelap memakai Field dan ToggleGroup shadcn berbasis Base UI. State `codeTheme` menjadi bagian draft App, default `light`, dan dipulihkan dari penyimpanan lokal.
- `PaginatedDocument` meneruskan `data-code-theme` ke template dan semua lembar hasil clone. Token warna kode di CSS dipakai bersama oleh inline code, blok kode, syntax highlighting, dan cetak. Ukuran font tidak berubah saat mengganti tema.
- Pengaturan dokumen ditata dua kolom pada layar kecil. Pengujian browser memeriksa tema terang/gelap dan lebar 390 px tanpa overflow horizontal. Build/lint berhasil. Cetak menggunakan print-color-adjust exact; pengguna perlu mengaktifkan background di dialog cetak bila browser mengabaikannya.

## Prioritas kesiapan produksi — 12 Oktober 2026

- Rantai CLI shadcn sebelumnya menghasilkan 7 entri high dari advisory `braces` [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), yang belum memiliki patch pada pemeriksaan ini. CLI dihapus dari manifest/lockfile; stylesheet resminya disalin tanpa perubahan perilaku ke `src/styles/shadcn.css`, beserta lisensi di `THIRD_PARTY_NOTICES.md`. Semua kontrol tetap menggunakan komponen shadcn/ui resmi. Audit setelah perubahan: **0 vulnerabilities**, termasuk dependensi pengujian.
- CLI untuk pekerjaan komponen masih dapat dijalankan ad hoc melalui `npx shadcn@latest`; cache/instalasi ad hoc tersebut bukan bagian audit proyek. Periksa keamanan rilis CLI sebelum memperbarui komponen; jangan memasang kembali rantai yang rentan atau memakai `npm audit fix --force` untuk downgrade otomatis.
- Pagination menghitung ulang clone halaman pada `beforeprint`, termasuk cetak melalui shortcut browser, agar cetak menggunakan konten dan pengaturan terbaru. Ekspor tetap menunggu font lokal selesai dimuat.
- `tests/document.spec.ts` mencakup pemisahan sel dan alignment, batas akhir tabel, HTML dan tautan berbahaya, delimiter/rumus rusak, highlight dan kode literal, dokumen panjang, A4/Letter, margin/tipografi alternatif, tema kode, zoom, tabel dengan baris sangat panjang, kode 150 baris, footer, dan tombol ekspor. Pemeriksaan membandingkan semua teks, isi sel per kolom, dan markup rumus dengan sumber serta mendeteksi overflow.
- Pengujian PDF mengeluarkan file PDF sebenarnya melalui mesin cetak Chromium, lalu membaca seluruh halaman dengan PDF.js. Dokumen uji 80 bagian: A4 **41 halaman**, Letter **46 halaman**, sesuai pratinjau; ukuran fisik, footer berurutan, dan seluruh 80 penanda awal/akhir serta baris tabel lengkap. Tema terang/gelap, tabel, kode, dan matriks diperiksa secara visual dari raster PDF. Ini menggantikan batas verifikasi PDF pada catatan historis di atas.
- Cakupan browser: layout dan tombol ekspor pada Chromium serta WebKit. Pembuatan PDF otomatis hanya tersedia pada Chromium; dua kasus PDF WebKit dilewati secara eksplisit. Dialog cetak Safari/Firefox dan pengaturan printer pengguna belum diverifikasi. Kesamaan hasil tetap mensyaratkan kertas sesuai pilihan aplikasi, skala 100%, margin None, header/footer browser nonaktif, dan background aktif.
- Artefak PDF, trace, dan laporan disimpan di `test-results/` serta `playwright-report/`, diabaikan Git dan diunggah oleh workflow bila dijalankan. Workflow CI sudah ditambahkan, tetapi belum dijalankan di GitHub pada sesi lokal ini.
- Hasil akhir lokal: `npm run lint`, `npm run build`, pemeriksaan tipe test, dan `npm test -- --workers=2` berhasil; **14 passed, 2 skipped** (PDF WebKit). `git diff --check` bersih. Audit full dependency: **0 vulnerabilities**. Peringatan build mengenai ukuran bundle dan `__dirname` yang sudah ada tetap tercatat sebagai pekerjaan terpisah.
- Tiga prioritas utama telah ditangani; ini bukan klaim seluruh proyek siap produksi. Draft dan pembatas input/performa ditangani pada pembaruan berikutnya. Ukuran bundle, kompatibilitas Markdown penuh, dan konfigurasi deployment masih perlu ditangani terpisah.

## Prioritas penting — draft dan dokumen besar, 12 Oktober 2026

Catatan historis: penyimpanan satu draft berikut telah digantikan oleh library project dan riwayat pada pembaruan di akhir dokumen.

- Satu draft disimpan otomatis pada `localStorage` dengan key `folio:draft:v1`: teks, nama, kertas, tipografi, margin, dan tema kode. Perubahan diterima disimpan setelah commit React, terpisah dari debounce pratinjau; juga dicoba pada `pagehide`/perubahan visibility. Reload memulihkan dokumen kosong secara sengaja. Data JSON yang rusak, versi tak dikenal, atau isi melewati batas kembali ke contoh awal; pengaturan divalidasi terhadap pilihan resmi.
- Status `Draft tersimpan` atau `Draft belum tersimpan; unduh .md` menunjukkan hasil penyimpanan. Storage penuh/tidak tersedia tidak menghalangi editor maupun unduhan. Draft berlaku pada browser dan origin yang sama, bukan sinkronisasi cloud; beberapa tab memakai satu draft terakhir yang disimpan. Data browser yang dihapus menghapus draft.
- Tombol **Unduh .md** memakai Button shadcn yang sudah terpasang, Blob UTF-8, serta nama dokumen yang disanitasi. Isi file mengikuti editor terbaru tanpa menunggu pagination. Mengganti isi dengan contoh tetap memerlukan dialog konfirmasi yang sudah ada; contoh tersebut menjadi draft terbaru.
- Input dibatasi **100 KiB (102.400 byte UTF-8)** serta **5.000 baris**. Ukuran File diperiksa sebelum `file.text()`, lalu isi hasil pembacaan diperiksa kembali. Paste divalidasi bersama teks yang tersisa setelah selection sebelum browser memasukkannya ke textarea; pengetikan/perubahan editor dan toolbar juga memakai validasi yang sama. Penolakan mempertahankan isi, nama, serta draft sebelumnya, dengan pesan alasan yang jelas.
- Pratinjau menunggu **250 ms** setelah perubahan teks dan memakai element Markdown yang dimemoisasi. Mengubah status draft, zoom, atau penghitung halaman tidak merender ulang seluruh Markdown. Pagination berupa generator yang memberi kesempatan pada browser setelah sekitar **8 ms**, pada batas blok, baris tabel, atau potongan teks. Pekerjaan lama dibatalkan saat sumber/pengaturan berubah; pratinjau lama yang lengkap tetap tampil hingga pengganti selesai.
- Lembar baru hanya mengkloning kerangka/header/footer; kelanjutan tabel hanya mengkloning header dan kerangka tbody. Tidak lagi menyalin seluruh dokumen/tabel untuk setiap halaman. Delimiter rumus blok yang tak ditutup tidak memicu pemindaian ulang seluruh sisa dokumen untuk tiap baris.
- Untuk membatasi pekerjaan grammar, kode lebih dari **8.000 karakter** ditampilkan utuh sebagai teks biasa dengan tema kode yang dipilih. Rumus lebih dari **2.000 karakter** ditampilkan sebagai sumber berwarna merah dengan petunjuk membaginya; tidak diteruskan ke KaTeX. Ini merupakan batas pemrosesan, bukan penghapusan isi.
- Ekspor PDF dinonaktifkan selama pembaruan pratinjau/pagination. Native `beforeprint` memperbarui sumber debounced melalui `flushSync` sebelum pagination cetak sinkron, sehingga cetak saat baru mengetik memakai versi terbaru. DOM akhir, ukuran kertas, dan aturan cetak tetap sama.
- Verifikasi akhir: build, lint, pemeriksaan tipe test, serta **40 passed / 2 skipped** (PDF WebKit). `tests/draft.spec.ts` menguji reload dan draft kosong, pengaturan, UTF-8/nama unduhan, storage gagal/rusak, unggah valid, penolakan file sebelum membaca, batas byte multibyte/baris, paste, respons timer browser selama pagination 1.200 paragraf, edit cepat, cetak selama debounce, fallback kode/rumus besar, serta mobile 390 px tanpa overflow. Regresi parser/tabel/matematika dan PDF A4/Letter tetap lulus.
- Batas mitigasi: pengukuran DOM dan render React tetap pada thread utama; jeda 8 ms adalah target antarlangkah, bukan batas waktu keras untuk satu blok. Cetak native menghitung ulang secara sinkron. Solusi ini mengurangi risiko input besar melalui batas dan pemrosesan bertahap; tidak menjamin waktu yang sama pada setiap perangkat. Worker/parser lengkap dan pengurangan bundle merupakan pekerjaan penyempurnaan terpisah.

## Identitas aplikasi

- Judul browser: `folio. – Markdown to PDF`. Ikon `public/favicon.svg` berupa kertas berhuruf f dengan latar biru; aset yang sama digunakan di navbar dan favicon. Ikon navbar dekoratif (`alt=""`) karena nama folio sudah tersedia pada tautan.
- Ekspor memakai nama dokumen sebagai judul sementara untuk nama PDF, lalu mengembalikan judul aplikasi melalui `afterprint`, termasuk saat dialog cetak ditutup.

## Markdown lebih lengkap — gambar, daftar, checklist, catatan kaki

- Parser awal diganti dengan token `markdown-it` di `src/lib/markdown-parser.ts`. `src/components/markdown-document.tsx` menyusun token menjadi elemen React; HTML mentah tetap nonaktif, dan tautan hanya diaktifkan untuk HTTP(S), mailto, atau anchor internal. Soft line break dipertahankan sebagai `<br>`. Kedalaman parsing dibatasi 30; batas dokumen 100 KiB/5.000 baris tetap berlaku.
- Rule matematika lokal mempertahankan `$...$`, `\(...\)`, `$$...$$`, serta `\[...\]`, termasuk delimiter dua backslash. Fenced/inline code tetap memakai lowlight. Rule tabel mempertahankan `tableCells`/`tableAlignment`, termasuk pipe dalam code span, sel kosong, dan batas minimum pemisah yang sudah digunakan proyek.
- Daftar `ol`/`ul` dapat bertingkat dan dicampur. `src/lib/list-fragments.ts` memecah item sesuai urutan dokumen, mempertahankan indentasi dan nilai nomor eksplisit, serta menyembunyikan marker pada konteks induk/kelanjutan tanpa mengulang isi. Indentasi Markdown mengikuti posisi teks item induk; gunakan contoh empat spasi untuk subdaftar.
- Checklist `- [ ]`/`- [x]` merupakan isi dokumen statis, bukan kontrol form; status ditampilkan sebagai simbol berlabel aksesibel. Pengguna mengubah status pada sumber Markdown. Marker, rumus, gambar, line break, dan referensi catatan kaki menjadi unit atomik saat pagination.
- Catatan kaki memakai `[^label]` dan definisi `[^label]: ...`, termasuk kelanjutan berindentasi serta referensi berulang. Catatan ditampilkan pada akhir dokumen, bukan di footer setiap halaman. Target `folio-footnote-N` dan `folio-ref-N-M` ditetapkan sekali pada output pagination; template pengukuran tidak memiliki ID yang dapat menduplikasi tujuan tautan.
- Tombol shadcn **Sisipkan gambar** pada toolbar membuka Input file lokal. Format PNG/JPEG/WebP divalidasi melalui MIME, signature, decoding, ukuran maksimal **2 MiB**, dan dimensi maksimal **4.096 × 4.096 px**. SVG tidak diterima sebagai lampiran gambar dokumen. Gambar disimpan di IndexedDB `folio-images`, store `images`, berupa ArrayBuffer beserta MIME/nama/ID/waktu; format ini telah diuji pada Chromium dan WebKit. Total penyimpanan gambar dibatasi **10 MiB**.
- Markdown yang disisipkan memakai `![nama](folio-image:UUID)`. Referensi relatif pada Markdown impor dapat dihubungkan dengan memilih gambar yang nama filenya sesuai; pemilihan tersebut tidak menambahkan gambar duplikat. Alias nama yang sama memakai gambar terakhir disimpan, sedangkan referensi UUID tetap merujuk asetnya sendiri. Blob URL hanya digunakan selama sesi dan dibuat ulang setelah reload; tidak ada unggah atau fetch gambar eksternal.
- Pagination menunggu font serta gambar sumber selesai dimuat, mempertahankan rasio dan batas ukuran gambar, serta memperlakukan subtree gambar sebagai unit utuh saat paragraf terbagi halaman. Gambar yang belum tersedia menampilkan pesan dan menonaktifkan tombol PDF sampai dilengkapi. Native shortcut cetak tetap sebaiknya dipakai setelah pratinjau siap.
- `Unduh .md` masih mengunduh teks dan referensi, **bukan paket gambar**. Simpan file gambar asli jika ingin memindahkan Markdown ke browser/perangkat lain. Menghapus data browser menghapus aset lokal; referensi UUID di file Markdown tidak membawa data gambar. Gambar HTTP/data URL tidak dimuat pada tahap fitur lokal ini.
- Verifikasi: **53 passed / 3 skipped** (tiga kasus PDF WebKit), build, lint, tipe test, dan audit **0 vulnerabilities**. Pengujian baru mencakup 80 item bernomor mulai 7 beserta tiga tingkat/checklist, teks identik tanpa overflow, catatan multiline dan referensi ulang dengan target unik, pemulihan gambar/Markdown setelah reload, penolakan file palsu/oversize, pipe dalam kode tabel, elemen atomik pada paragraf/footnote panjang, serta PDF Chromium dengan gambar benar-benar tertanam. PDF contoh telah diraster dan diperiksa visual untuk gambar, penomoran, checklist, serta catatan kaki. Regresi draft, matematika, tabel, dan PDF A4/Letter tetap lulus.
- Build utama sekarang sekitar 996 KB sebelum gzip (sekitar 324 KB gzip). Pengurangan bundle tetap pekerjaan penyempurnaan terpisah; penambahan parser tidak menghilangkan batas input/performance yang sudah ada.

## Persiapan repository GitHub dan Vercel

- Branch aplikasi utama adalah `main`. Implementasi penghitung kunjungan ditunda dan disimpan pada branch lokal `codex/visit-counter`; tidak menjadi fitur atau konfigurasi deployment pada `main`.
- `.gitignore` mengecualikan `.env`/`.env.*` (contoh tersanitasi `.env.example`/`.env.*.example` tetap dapat dilacak), private key/sertifikat, direktori `.secrets`, konfigurasi lokal Vercel/Netlify/Wrangler/Codex, cache, coverage, dependensi, hasil build, dan artefak pengujian. `.agents/skills`, `AGENTS.md`, dan `package-lock.json` tetap dibagikan sebagai bagian proyek.
- Runtime Node **24.x** konsisten pada `.nvmrc`, `package.json` beserta lockfile, dan CI. Vite memakai `import.meta.dirname` agar konfigurasi ES modules kompatibel dengan loader native.
- Workflow verifikasi GitHub memiliki izin minimum `contents: read` dan membatalkan run lama pada ref yang sama. Workflow ini tidak mempublikasikan situs; deployment Vercel dikonfigurasi terpisah, dengan production branch `main`, preset Vite, `npm ci`, `npm run build`, dan output `dist`. Aplikasi utama tidak memerlukan environment variable atau API key.
- README memuat persiapan repository kosong, impor Vercel, konfigurasi build, dan domain sendiri. Belum ada Git remote yang dikonfigurasi atau push/deployment yang dilakukan dari workspace ini.
- Pemeriksaan pola umum token/private key pada file yang dilacak dan riwayat seluruh branch tidak menemukan kecocokan; ini pemeriksaan pola, bukan jaminan lengkap bebas kredensial. Tidak ada environment file/private key yang sudah dilacak Git pada pemeriksaan ini.
- Verifikasi: build biasa dan build dengan `--configLoader native`, lint, serta dry-run `npm ci` dari lockfile berhasil. Audit dari sinkronisasi npm melaporkan **0 vulnerabilities**. Peringatan bundle besar tetap ada. Regresi browser/PDF sebelumnya masih tercatat pada bagian fitur Markdown; tidak ada perubahan renderer atau UI dalam persiapan ini.

## Perbaikan pengujian unduhan WebKit di GitHub Actions

- Log runner Linux GitHub menunjukkan `suggestedFilename()` WebKit dapat mengubah `Catatan pribadi.md` menjadi `Catatan_pribadi.md`. Pemeriksaan sebelumnya hanya menerima spasi, sehingga gagal meskipun unduhan berhasil.
- `tests/draft.spec.ts` menerima kedua nama persis tersebut khusus pada WebKit. Chromium tetap memerlukan nama dengan spasi; ekstensi/nama lengkap dan isi UTF-8 file tetap diperiksa. Pemeriksaan fungsi `markdownFilename` terpisah memastikan aplikasi tetap menghasilkan `Catatan pribadi.md`. Perilaku unduhan aplikasi tidak diubah.
- Verifikasi lokal: **26 pengujian draft/unduhan lulus** pada Chromium/WebKit; build, lint, dan pemeriksaan tipe test berhasil. Runner Linux GitHub belum dijalankan ulang dari workspace; hasil CI perlu diperiksa setelah perubahan di-push.


## Project, beberapa draft, dan riwayat lokal — 12 Oktober 2026

- Implementasi memakai komponen shadcn/Base UI yang tersedia (Dialog, AlertDialog, Button, Input, Textarea, Select, Field, Badge, Empty). Project dan riwayat dibuka dari bar ringkas di atas workspace; dialog responsif dan tidak masuk hasil cetak.
- IndexedDB `folio-library` versi 1 memiliki store `projects`, `documents`, `versions`, dan `meta`. Dokumen menyimpan projectId, Draft lengkap, timestamp, serta revision. Versi diindeks berdasarkan documentId/createdAt dan waktu global. Semua mutasi kapasitas/isi/riwayat memakai transaksi atomik.
- Migrasi membaca `folio:draft:v1` hanya saat database library kosong, lalu membuat project Umum dan dokumen pertama beserta versi awal. localStorage tetap menyimpan salinan darurat dokumen aktif dengan documentId/revision/pending. Edit menulis salinan ini segera; saat reload salinan pending hanya dipulihkan jika revision database masih sama, sehingga tidak menimpa perubahan tab lain.
- Hook mengantrekan penyimpanan setiap edit secara terpisah dari debounce pratinjau. Aksi project/dokumen menunggu penyimpanan terbaru dan mengunci edit selama berlangsung. Perbandingan revision menolak edit dari tab dengan data lama; tulisan tetap di editor dan pesan meminta unduhan sebelum reload. Tidak ada merge otomatis antar-tab.
- Project satu tingkat: buat, ubah nama, dan hapus setelah kosong; minimal satu project. Dokumen dapat dibuat, dicari berdasarkan nama dalam project, dibuka, dipindahkan beserta riwayat, dan dihapus dengan konfirmasi. Menghapus dokumen terakhir membuat pengganti kosong. Impor Markdown membuat dokumen baru di project aktif, mempertahankan dokumen sebelumnya.
- Pilihan pengguna: versi otomatis + manual. Checkpoint otomatis setelah jeda 15 detik, sebelum pergantian dokumen, serta sebelum membuat/mengimpor dokumen. Tombol Simpan versi menyimpan checkpoint manual; versi identik tidak digandakan (versi otomatis identik terakhir dapat ditandai manual). Pemulihan menyimpan checkpoint sebelum-restore, lalu mengembalikan teks/nama/pengaturan; project tidak berubah. Memuat contoh menyimpan versi dahulu.
- Batas: 20 project, 100 dokumen, 20 versi per dokumen, dan 20 MiB estimasi JSON Draft UTF-8 untuk isi+riwayat. Checkpoint tertua per dokumen dipangkas saat jumlah penuh; versi tertua global dipangkas saat kapasitas penuh. Dokumen aktif tidak dihapus untuk mengosongkan kapasitas. Batas input 100 KiB/5.000 baris tetap berlaku.
- Gambar tetap memakai database folio-images dan kapasitas 10 MiB terpisah; referensi/nama file gambar tersedia bersama pada browser, bukan namespace khusus project. Unduh .md berisi teks/referensi saja; belum ada ekspor seluruh project/riwayat/lampiran. Tidak ada backend atau sinkronisasi perangkat. Menghapus data browser menghapus seluruh data lokal.
- Saat IndexedDB tidak tersedia, kontrol library dinonaktifkan tetapi editor dan unduh .md masih dapat dipakai dengan salinan localStorage jika tersedia. Status tersimpan untuk fitur library berarti transaksi IndexedDB berhasil; penulisan localStorage yang gagal tidak menghalangi IndexedDB.
- `tests/library.spec.ts` mencakup migrasi draft kosong/pengaturan, project/dokumen independen, impor tanpa mengganti isi, pemindahan dengan riwayat, versi otomatis/manual dan pemulihan, konflik dua tab, localStorage tidak tersedia, penolakan hapus project berisi dokumen, pengganti dokumen terakhir, pemangkasan 20 versi/kapasitas, salinan pending sesuai revision, dialog mobile/desktop, fokus keyboard, dan pengecualian dari cetak.
- Verifikasi akhir: build, lint, tipe test, **71 passed / 3 skipped** (PDF WebKit). Pemeriksaan visual dialog mobile 390 px dan desktop 1440 px berhasil; perubahan ukuran layar menunggu layout stabil, tidak ada isi dialog terpotong. Fokus kembali ke tombol pembuka setelah Escape. Pengujian ukuran dialog diulang khusus pada Chromium/WebKit dan lulus. Peringatan bundle besar masih ada (~1.022 KB sebelum gzip / 331 KB gzip); perubahan tidak menambah dependensi.


## Pemeriksaan beta sebelum main — 12 Oktober 2026

- Dua bug ditemukan dan direproduksi pada Chromium/WebKit: aksi riwayat dapat mengganti dokumen aktif mengikuti tab lain; target pemulihan dapat berubah ketika riwayat otomatis diperbarui selama dialog konfirmasi terbuka.
- Hook mempertahankan dokumen aktif milik tab setelah aksi project/riwayat; aksi buka/buat/impor memilih ID dokumen hasil aksi secara eksplisit, bukan mengambil pilihan terakhir tab lain dari metadata bersama. Jika dokumen aktif dihapus, pengganti yang tersedia tetap digunakan.
- Dialog konfirmasi menyimpan snapshot target versi ketika pengguna menekan Pulihkan versi ini. Refresh riwayat otomatis tidak mengubah ID target yang dikonfirmasi.
- Dua kasus regresi di tests/library.spec.ts gagal sebelum perbaikan dan lulus setelah perbaikan di kedua browser. Verifikasi akhir: build, lint, tipe test, **75 passed / 3 skipped** (PDF WebKit), npm audit **0 vulnerabilities**, diff-check bersih. Dialog project mobile dan riwayat desktop diperiksa visual.
- Remote main diperiksa setelah fetch dan merupakan ancestor beta sehingga penggabungan dapat dilakukan tanpa konflik pada titik pemeriksaan. Fitur folder gambar tetap hanya berada pada codex/image-local-storage; tidak masuk beta.
- Peringatan bundle besar yang sudah ada tetap muncul. Hasil CI Linux untuk commit perbaikan belum tersedia karena belum di-push; tidak ada merge/deployment yang dilakukan dalam pemeriksaan ini.


## Penyesuaian timeout WebKit di CI — 12 Oktober 2026

- Log GitHub Linux yang diberikan pengguna menunjukkan timeout 60 detik pada pagination Letter dan 21 siklus riwayat; kasus kedua berhenti saat menunggu tombol Close stabil. Tidak ada assertion isi salah dalam log tersebut. Trace CI belum tersedia di workspace, sehingga CPU/animasi merupakan diagnosis berdasarkan log, bukan akar masalah yang sudah dibuktikan dari trace.
- Playwright sekarang menggunakan satu worker saat CI dan dua worker lokal; workflow memanggil npm test tanpa override --workers=2. Regresi umum memakai reducedMotion reduce untuk menghindari ketergantungan pada waktu animasi; kasus layout/fokus dialog secara eksplisit tetap menggunakan no-preference. CSS aplikasi tidak diubah.
- Pagination panjang A4/Letter dan 21 siklus riwayat memakai test.slow khusus WebKit CI: budget total 180 detik, kasus lain tetap 60 detik dan assertion 15 detik. Tidak ada force click, tambahan retry, pengurangan data uji, atau skip baru.
- Loop riwayat memeriksa dialog tersembunyi dan fokus kembali sebelum putaran berikutnya. Pagination menunggu tombol PDF siap setelah perubahan tema dan memiliki test.step untuk memperjelas tahap kegagalan (render, integritas, cetak sinkron).
- Verifikasi lokal pada macOS: lint, build, tipe test, dan CI=true npm test berhasil dengan satu worker (**75 passed / 3 skipped**, 2,9 menit). Dua kasus WebKit yang dilaporkan gagal diulang masing-masing tiga kali: **6 passed**, 53,2 detik. Diff-check bersih. Pengujian ini memverifikasi konfigurasi CI secara lokal; hasil runner Linux GitHub tetap perlu diperiksa setelah push oleh pengguna.

## PWA dan penggunaan offline — 12 Oktober 2026

- Fitur dikembangkan pada branch lokal `codex/pwa-offline` dari main. Integrasi memakai `vite-plugin-pwa` 2 (dependensi pengembangan) dengan Workbox generateSW. Tidak ada backend atau sinkronisasi cloud. Versi dependensi lama tetap sama setelah penambahan.
- Manifest menyediakan identitas folio, start URL/scope root, display standalone, ikon PNG 192/512, maskable 512, dan apple-touch-icon. Ikon dirender dari SVG identitas folio yang sudah ada. Cache produksi mencakup HTML, JS, CSS, ikon, serta seluruh font lokal Inter/KaTeX, sekitar 2,4 MiB pada build ini.
- `src/lib/pwa.ts` mendaftarkan service worker sekali setelah load, hanya pada produksi, dan menyediakan status melalui useSyncExternalStore. Worker baru menunggu pesan SKIP_WAITING dari tindakan pengguna. Registrasi memakai updateViaCache none; pemeriksaan tambahan saat foreground/online dibatasi sekali per jam. Dev server 5173 tidak memasang worker.
- `src/components/pwa-status.tsx` memakai Badge dan Button shadcn untuk status siap/offline serta tombol pembaruan. Kontrol menunggu draft tersimpan dan proses impor selesai, menyimpan ulang draft terakhir melalui antrean IndexedDB, lalu membatasi edit sampai aktivasi selesai. Penyimpanan gagal mencegah reload; aktivasi yang tidak selesai dalam 15 detik melepaskan pembatas edit. Hanya tab peminta yang reload, tab lain termasuk draft yang belum tersimpan tetap terbuka. Status aplikasi tersembunyi saat cetak.
- Project, dokumen, riwayat, dan gambar tetap di IndexedDB; batas input/gambar sebelumnya tetap berlaku. Cache browser bukan salinan cadangan permanen atau folder perangkat. Penggunaan offline memerlukan kunjungan online yang berhasil sampai status siap; instalasi memakai menu browser/perangkat dan tidak wajib untuk cache offline. Hosting HTTPS (localhost untuk pengujian), browser/perangkat yang mendukung, dan storage yang tersedia tetap diperlukan.
- `tests/pwa.spec.ts` menjalankan build produksi melalui server lokal terisolasi per kasus. Perubahan byte script worker mensimulasikan deployment baru tanpa mengubah dist bersama. Cakupan Chromium/WebKit: manifest, reload/tab baru offline, pemulihan gambar dan rumus/font, edit/autosave, impor Markdown dan riwayat offline, unduhan, PDF Chromium, pembaruan eksplisit dengan pemulihan draft, tab lain dengan storage gagal, serta pembatalan reload saat storage tidak tersedia. Uji mobile 390 px dan status di media cetak juga tersedia.
- Verifikasi akhir lokal: lint, build, tipe test, CI=true npm test satu worker **81 passed / 3 skipped** (PDF WebKit), sekitar 3 menit. Enam kasus PWA diulang pada build final dan semuanya lulus. Audit npm **0 vulnerabilities**, diff-check bersih. Tampilan mobile dan ikon maskable diperiksa visual. Instalasi melalui menu browser/OS serta runner Linux GitHub belum diuji langsung pada sesi ini. Peringatan bundle besar yang sudah ada tetap muncul. Preview produksi lokal menggunakan port 4174; tidak ada push atau penggabungan ke main.


## Status PWA ringkas di navbar — 13 Oktober 2026

- Status PWA dipindahkan dari baris/chip di atas halaman ke ikon pada navbar di sebelah Panduan Markdown, langsung pada main. Keterangan tersedia melalui Tooltip shadcn/Base UI saat hover atau fokus keyboard; label aksesibel dan live region tetap menyediakan status untuk pembaca layar. Ikon pembaruan juga ringkas dengan tooltip dan tetap mengikuti pengamanan draft sebelumnya.
- Komponen Tooltip resmi ditambahkan tanpa dependensi baru, dan TooltipProvider membungkus App. Status serta popup tooltip disembunyikan pada media cetak. Pengujian PWA disesuaikan untuk tombol berlabel, popup keyboard/Escape, dan layout mobile; proses storage/service worker tidak diubah.
- Verifikasi: build, lint, tipe test, enam kasus PWA Chromium/WebKit lulus, diff-check bersih. Screenshot navbar mobile 390 px diperiksa visual; tidak ada baris status tambahan atau overflow horizontal. Tidak ada push pada sesi ini.

## Versi aplikasi dan changelog — 13 Oktober 2026

- Versi aplikasi dimulai dari commit pertama pada main sebagai v0.0.1. Sebanyak 19 commit awal direkonstruksi menjadi v0.0.1–v0.0.19; implementasi versioning adalah v0.0.20. Tidak membuat tag atau mengklaim rilis historis. Branch yang belum digabung tidak dihitung.
- Setiap perubahan berikutnya yang dikomit ke main harus menaikkan patch package.json dan package-lock.json melalui `npm version patch --no-git-tag-version`, menambahkan satu entri terbaru di `src/data/releases.json`, dan menjalankan `npm run changelog`. Catatan baru memakai `retrospective: false`; commit dapat null sebelum commit dibuat. Jangan mengubah nomor historis. Kebijakan versi dapat diperbarui jika pengguna meminta.
- `src/components/app-releases.tsx` menampilkan nomor build pada footer dan dialog shadcn/Base UI dengan riwayat yang tersedia offline. Data JSON yang sama menghasilkan CHANGELOG.md lewat scripts/changelog.mjs. Build menjalankan changelog:check untuk memeriksa versi package/lockfile, urutan catatan, dan dokumen Markdown; tidak bergantung pada Git lengkap di CI. Versi format database/draft tetap terpisah dari versi aplikasi.
- Verifikasi: build, lint, tipe test, enam pengujian PWA Chromium/WebKit lulus. Dialog diuji offline pada 390 px, akses ke versi pertama, Escape dan pengembalian fokus, serta batas area dialog; screenshot diperiksa visual. Peringatan bundle besar tetap ada. Tidak ada push.

## Coachmark pengguna baru — 13 Oktober 2026

- v0.0.21 menambahkan tur lima langkah: toolbar/editor Markdown, pratinjau, pengaturan dokumen, Project/Riwayat, dan ekspor PDF. Sorotan memakai area transparan pada backdrop Dialog shadcn/Base UI; kartu ditempatkan di dekat target dan dibatasi viewport, termasuk saat resize. DialogContent menerima overlayProps opsional tanpa mengubah default dialog lain.
- Deteksi kunjungan pertama dilakukan sebelum autosave membuat draft: tidak ada folio:tour:v1 dan tidak ada folio:draft:v1. Pengguna lama dengan draft tidak mendapat tur otomatis. Lewati, Escape, atau selesai menyimpan penanda tur pada browser/origin yang sama. Storage tidak tersedia tidak menghalangi tur manual atau penutupan.
- Tur dapat dibuka ulang dari Panduan Markdown → Tur aplikasi, termasuk offline. Saat dibuka manual, pilihan view sementara menjadi split lalu dikembalikan ketika selesai; tidak mengubah draft/pengaturan. Fokus keyboard tetap di dialog dan dikembalikan ke Panduan Markdown. Tur tidak ikut tercetak, dan mengikuti reduced motion tanpa animasi otomatis.
- tests/fixtures.ts menandai tur sudah dilewati untuk regresi fitur lama. tests/coachmark.spec.ts memakai fixture Playwright asli untuk menguji kunjungan baru, urutan maju/mundur, penyelesaian dan skip, persistensi penanda, fokus/keyboard, pembukaan ulang, storage gagal, draft tidak berubah, mobile dan cetak. Pengujian PWA memeriksa pembukaan tur manual saat offline.
- Verifikasi: build, lint, tipe test, seluruh regresi satu worker **87 passed / 3 skipped** (PDF WebKit). Screenshot desktop dan mobile diperiksa visual. Peringatan bundle besar tetap ada; tidak ada dependensi baru. Tidak ada push.

## Tema kode inline dan blok terpisah — 13 Oktober 2026

- v0.0.22 memisahkan ToggleGroup Kode inline dan Blok kode. Kode inline berarti code span/backtick; blok berarti fenced/indented code, termasuk blok satu baris. Keduanya memakai pilihan Terang/Gelap dan tersimpan pada draft/dokumen/versi.
- codeTheme tetap menjadi tema blok untuk kompatibilitas. inlineCodeTheme opsional pada format penyimpanan; draft dan versi lama yang tidak memilikinya memakai codeTheme untuk keduanya. Saat tema blok lama diubah, tema inline dibekukan ke nilai sebelumnya agar tetap independen. Tidak mengubah versi IndexedDB atau menulis ulang catatan lama beserta perhitungan kapasitasnya.
- PaginatedDocument meneruskan data-inline-code-theme ke template dan clone cetak. CSS mendefinisikan token warna pada pre/code dan memilih aturan gelap terpisah, tanpa mengubah ukuran font atau isi kode. Pengaturan responsif menempatkan kedua kontrol tema berdampingan pada ponsel.
- tests/code-themes.spec.ts menguji warna independen, reload, riwayat, mode cetak, mobile, migrasi localStorage serta dokumen IndexedDB lama tanpa properti baru. Pemeriksaan dokumen/PDF dan draft lama memakai grup Blok kode untuk menghindari tombol Terang/Gelap yang ambigu.
- Verifikasi: build, lint, tipe test, regresi terarah dokumen/PDF/draft **44 passed / 2 skipped** (PDF WebKit), serta tema/library/coachmark **32 passed**. Pengujian tema diulang pada build final dengan viewport 390/730/900/1280 px; screenshot pengaturan mobile diperiksa visual. Peringatan ukuran bundle yang sudah ada tetap muncul. Tidak ada push.

## Perbaikan teks kode tanpa hasil deteksi — 13 Oktober 2026

- v0.0.23 memperbaiki HighlightedCode: lowlight.highlightAuto dapat menghasilkan tree.children kosong dengan relevance 0 untuk sumber nonkosong seperti Console.WriteLine(), Program, atau eko. Renderer kini memakai teks asli ketika tree kosong. Perbaikan berlaku pada inline code dan blok tanpa bahasa; warna highlighting yang dikenali tetap tersedia.
- Pengujian regresi memakai lima contoh pengguna, blok otomatis serta C# eksplisit, kedua tema inline, hasil pagination/beforeprint, dan ekstraksi teks PDF Chromium sebenarnya. Build, lint, dan tipe test berhasil. Tidak ada perubahan format penyimpanan atau dependensi.
- Kasus baru lulus pada Chromium/WebKit setelah cleanup PDF pengujian disesuaikan ke loadingTask.destroy(); regresi dokumen dan tema lainnya lulus, dengan dua PDF WebKit dilewati sesuai keterbatasan Playwright. Peringatan bundle besar tetap ada; tidak ada push.

## Tata letak pengaturan dokumen — 13 Oktober 2026

- v0.0.24 mengelompokkan pengaturan memakai FieldSet/FieldLegend shadcn: Halaman (kertas, tipografi, margin) dan Tema kode (inline, blok). Grid intrinsik menggantikan lebar tetap dan pembungkusan flex yang membuat kontrol berpindah tidak konsisten. Kontrol tema memiliki dua segmen berlebar sama.
- Desktop menampilkan dua kelompok berdampingan dengan Separator; hingga 900 px kelompok ditumpuk dan pemisah horizontal. Ponsel hingga 480 px memakai dua kolom halaman dengan margin selebar kelompok. Pilihan pengaturan, penyimpanan, dan cetak mengikuti perilaku sebelumnya; target coachmark .settings-bar tetap tersedia.
- Verifikasi: build, lint, tipe test, sepuluh kasus tema/coachmark Chromium/WebKit lulus. Screenshot pengaturan 390/730/900/1280 px diperiksa; tidak ada overflow horizontal. Peringatan bundle besar tetap ada. Tidak ada push.

## Visibilitas indikator PWA — 13 Oktober 2026

- v0.0.25 menghilangkan early return yang menyembunyikan PwaStatus pada mode pengembangan atau browser tanpa service worker. Ikon dan Tooltip kini tetap tersedia dengan keterangan yang sesuai: Mode pengembangan · cache offline tidak aktif, atau browser tidak mendukung penggunaan offline.
- Service worker tetap hanya didaftarkan pada build produksi; ikon pengembangan tidak mengklaim cache siap. Tombol pembaruan dibatasi ke lingkungan yang mendukung PWA. Tidak mengubah perilaku cache, penyimpanan draft, atau aktivasi update.
- tests/pwa.spec.ts menjalankan Vite dev server sementara untuk menguji ikon, tooltip fokus keyboard, tidak adanya registrasi service worker, serta tidak munculnya tombol pembaruan pada dev. Server uji ditutup setelah kasus selesai. Regresi PWA produksi tetap memeriksa online/offline, cache, ekspor, pembaruan dan storage gagal.
- Verifikasi: build, lint, tipe test, delapan pengujian dev/produksi pada Chromium/WebKit lulus. Ikon juga terverifikasi kembali pada tab pengguna localhost:5173 melalui pembaruan dev; screenshot tooltip diperiksa visual. Peringatan bundle besar tetap ada; tidak ada push.

## Sinkronisasi scroll editor/pratinjau — 13 Oktober 2026

- v0.0.26 menambahkan Toggle shadcn dengan Tooltip di dekat pilihan tampilan. Preferensi `folio:scroll-sync:v1` terpisah dari draft, awal nonaktif, dan kegagalan menyimpan preferensi tidak menghalangi kontrol. Mode satu panel menjeda sinkronisasi; kedua panel pada ponsel tetap didukung.
- Renderer mempertahankan rentang baris token melalui `data-source-start/end`; rule tabel memberikan rentang per baris. Atribut mengikuti clone pagination tanpa mengubah isi atau format cetak. Hook `use-scroll-sync.ts` mengukur baris textarea dengan mirror tersembunyi untuk memperhitungkan wrapping, lalu memasangkan rentang sumber dengan fragmen halaman. Celah antarhalaman dipetakan sebagai dua posisi pada batas sumber yang sama. Posisi di dalam blok merupakan interpolasi, bukan jaminan kecocokan setiap karakter pada rumus/gambar/footnote.
- Scroll dua arah dijadwalkan sekali per animation frame dan event dari panel pengikut diabaikan untuk mencegah loop. Pengukuran diperbarui saat sumber, ukuran, font, atau skala berubah; sinkronisasi menunggu pagination siap dan perubahan zoom mempertahankan posisi sumber. Mirror dikeluarkan dari cetak dan semua listener/observer dibersihkan saat fitur dijeda atau dimatikan.
- Verifikasi: build, lint, tipe test, dan diff check berhasil. Seluruh 95 kasus regresi lama lulus (3 PDF WebKit dilewati). Uji menyeluruh menemukan satu selisih blok kode WebKit pada pemetaan celah halaman; setelah diperbaiki, seluruh 10 pengujian fitur Chromium/WebKit lulus, meliputi dua arah, wrapping, zoom, blok kode lintas halaman, toggle, reload, mode satu panel, perubahan sumber, ponsel, keyboard, dan penyimpanan preferensi gagal. Screenshot desktop/ponsel diperiksa tanpa overflow. Peringatan ukuran bundle tetap ada; tidak ada push.

## Pemisah halaman manual dan awal bab — 13 Oktober 2026

- v0.0.27 menambahkan directive `<!-- pagebreak -->` pada baris tersendiri di tingkat dokumen. Rule markdown-it hanya mengenali komentar persis tersebut, di luar kode berindentasi/fence, daftar, dan kutipan; HTML lain tetap tidak dieksekusi. Renderer menghasilkan marker tersembunyi yang dikonsumsi pagination dan tidak disalin ke halaman cetak. Toolbar Button shadcn menyisipkan directive tanpa menghapus teks yang dipilih dan mengembalikan fokus editor. Panduan Markdown serta README memuat syntax.
- Pengaturan Select shadcn **Awal bab** memakai `chapterStart` opsional pada Draft: `none` (default dokumen lama/baru), `h1` (judul #), atau `h2` (judul # dan ##). Judul Setext ikut mengikuti tingkat heading; heading di dalam kutipan/daftar tidak memicu bab. Validasi library menerima dokumen lama tanpa properti baru dan memeriksa nilai ketika tersedia. Autosave, recovery, dan riwayat memakai properti yang sama tanpa migrasi IndexedDB. Pengaturan bukan bagian file .md; directive manual tetap tersedia pada unduhan.
- Pagination menunda break sampai isi berikutnya tersedia. Leading/trailing/consecutive marker serta kombinasi marker dan bab tidak membuat halaman kosong tambahan. Pemisahan alami konten panjang dan beforeprint tetap menggunakan pipeline yang sama; chapterStart menjadi dependensi penghitungan ulang. Margin/zoom/tema kode tidak berubah. Setting ditempatkan satu baris penuh di kelompok Halaman dengan layout responsif, menggunakan kontrol yang sudah terpasang.
- Verifikasi: build, lint, tipe test, diff check, dan seluruh regresi berhasil: **115 passed / 5 skipped** (pembuatan PDF WebKit tidak didukung). Pengujian baru mencakup marker berulang/awal/akhir, literal pada kode/daftar/kutipan, level judul termasuk Setext, reload/riwayat, penyisipan tanpa kehilangan selection, unduhan .md, mobile, dan PDF A4/Letter dengan penanda isi serta nomor halaman yang sesuai. Screenshot desktop/ponsel diperiksa. Peringatan bundle besar tetap ada; tidak ada push.

## Perbaikan scroll saat penyisipan editor — 13 Oktober 2026

- v0.0.28 memperbaiki lompatan ke akhir textarea saat menyisipkan pemisah halaman pada dokumen panjang. Penyebab terverifikasi pada Chromium dan WebKit, termasuk ketika sinkronisasi dimatikan: penggantian controlled value memindahkan caret sementara ke akhir, lalu focus dalam requestAnimationFrame memperlihatkan posisi itu sebelum selection dipulihkan. Sinkronisasi memperluas lompatan tersebut ke pratinjau.
- Helper applyEditorEdit mengingat scrollTop/scrollLeft, melakukan commit nilai dengan flushSync, lalu memulihkan selection, focus dengan preventScroll, serta posisi scroll pada event yang sama. Dipakai untuk pemisah halaman dan tombol format yang sebelumnya memakai pola deferred focus yang sama. Validasi ukuran sumber tetap dipakai; penyisipan gagal tidak mengubah selection atau fokus editor.
- Regresi baru menempatkan caret di bagian tengah dokumen panjang, menyisipkan break dengan toolbar, memeriksa isi/kursor/viewport dan posisi pratinjau, lalu mengetik directive secara langsung dan memakai tombol Tebal. Dijalankan dengan sinkronisasi aktif/nonaktif pada kedua mesin browser.
- Verifikasi: build, lint, tipe test, dan diff check berhasil. Pengujian terkait editor/draft, scroll, pemisah halaman/PDF A4/Letter, serta PWA: **58 passed / 2 skipped** (PDF WebKit). Bug lama direproduksi sebelum perbaikan; empat kasus long-document baru lulus setelah perbaikan. Peringatan bundle besar tetap ada; tidak ada push.

## Mode fokus — 13 Oktober 2026

- v0.0.29 menyediakan Button shadcn dengan Tooltip untuk membuka/menutup mode fokus di dekat pilihan tampilan. Mode memenuhi viewport aplikasi (bukan Fullscreen API), membuka view Editor dan menyembunyikan navigasi/pengaturan sementara. Body/root tidak bergulir; editor atau pratinjau yang terlihat memiliki scroll internal. Editor satu panel memakai kolom tulisan sekitar 80ch di layar besar.
- Hook use-focus-mode.ts menangkap tampilan/scroll halaman sebelum masuk dan mengembalikannya ketika keluar, dengan focus preventScroll serta pemulihan scroll dokumen melalui layout effect. Mode bersifat sesi dan tidak mengubah Draft. Escape keluar kecuali overlay dialog/listbox sedang terbuka. Cleanup menghapus class root dan listener.
- CSS fokus hanya berlaku pada media screen, menggunakan 100dvh, flex/min-height:0, overscroll containment, dan safe-area insets. Split ditumpuk dalam dua baris terbatas pada ponsel; pilihan satu panel tetap satu baris. CSS print yang sudah ada tetap menampilkan semua halaman, termasuk ketika layar fokus hanya menampilkan editor. Kontrol tersembunyi juga keluar dari tab order; unduhan dan status draft tetap tersedia.
- Posisi panel yang disembunyikan tidak ditimpa nilai nol; listener scroll mengingat posisi terakhir panel yang terlihat, termasuk sebelum berganti view. ResizeObserver pagination mempertahankan skala terakhir saat clientWidth nol sehingga pratinjau tidak mengecil sementara dan kehilangan scroll.
- Verifikasi: build, lint, tipe test, dan diff check berhasil. Regresi penuh awal **124 passed / 6 skipped**; pemeriksaan tambahan menemukan/reset scroll panel tersembunyi dan diperbaiki. Setelahnya regresi pagination/zoom/scroll/PDF **35 passed / 3 skipped**, serta seluruh pengujian mode fokus final **5 passed / 1 skipped**, termasuk ingatan posisi saat berganti panel, scroll containment, Escape/dialog, resize/ponsel/landscape, sinkronisasi, dan PDF lengkap. Screenshot desktop/ponsel diperiksa. Kasus skipped adalah pembuatan PDF WebKit yang tidak didukung; peringatan bundle besar tetap ada. Tidak ada push.

## Navbar lebih langsing pada main — 13 Oktober 2026

- v0.0.30 pada main merampingkan navbar dari 78 menjadi 60 px desktop, dan dari 65 menjadi 56 px ponsel. Logo/atribut ukuran gambar menjadi 32 px, nama folio 25 px, serta jarak deskripsi brand lebih ringkas. Kontrol PWA dan panduan memakai komponen serta perilaku yang sama.
- Verifikasi: build, lint, diff check, dan 14 kasus PWA/coachmark Chromium/WebKit lulus; screenshot navbar desktop/ponsel diperiksa. Tidak ada pengujian baru untuk perubahan visual kecil ini. Peringatan bundle besar tetap ada; tidak ada push.
