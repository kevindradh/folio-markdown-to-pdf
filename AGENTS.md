# Panduan Proyek

Dokumentasi ini berdasarkan pemeriksaan kode, konfigurasi, dan paket lokal pada 11 Oktober 2026. Perbarui jika struktur atau tooling berubah.

## Gambaran umum

- Tujuan proyek: membangun tool untuk mengonversi Markdown menjadi dokumen PDF. Markdown menjadi input, dan file PDF menjadi hasil konversi. Detail fitur dan alur penggunaan akan ditentukan lebih lanjut bersama pengguna.
- Nama paket: `markdown-to-pdf`; paket privat, versi `0.0.0`, menggunakan ES modules (`type: module`).
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
