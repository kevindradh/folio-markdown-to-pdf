# Panduan Proyek

Dokumentasi ini berdasarkan pemeriksaan kode, konfigurasi, dan paket lokal pada 11 Oktober 2026. Perbarui jika struktur atau tooling berubah.

## Gambaran umum

- Tujuan proyek: membangun tool untuk mengonversi Markdown menjadi dokumen PDF. Markdown menjadi input, dan file PDF menjadi hasil konversi. Detail fitur dan alur penggunaan akan ditentukan lebih lanjut bersama pengguna.
- Nama paket: `markdown-to-pdf`; paket privat, versi `0.0.0`, menggunakan ES modules (`type: module`).
- Aplikasi frontend React + Vite + TypeScript. Tampilan awal di `src/App.tsx` menggunakan nama sementara “folio”, dengan editor dan pratinjau berdampingan.
- Editor, unggah file Markdown, pratinjau sintaks dasar, pengaturan kertas/tipografi/margin, dan zoom sudah tersedia. Ekspor memakai dialog cetak browser (Save as PDF). Parser awal belum mendukung seluruh spesifikasi Markdown; belum ada dependensi Markdown/PDF khusus. Isi editor tersimpan dalam state sesi, belum persisten.
- Belum ada router, backend, state management eksternal, atau framework pengujian dalam konfigurasi proyek.
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
| `shadcn` | `^4.21.4` | Tooling komponen shadcn dan stylesheet `shadcn/tailwind.css`; konfigurasi di `components.json`. |
| `tailwindcss`, `@tailwindcss/vite` | `^4.3.3` | Styling utility Tailwind v4, terintegrasi lewat plugin Vite. |
| `class-variance-authority` | `^0.7.1` | Mendefinisikan variant dan size Button melalui `cva` serta tipe `VariantProps`. |
| `cn` | `^0.4.0` | Helper class name yang dipakai langsung oleh Button dan diekspor ulang di `src/lib/utils.ts`. |
| `katex` | `^0.19.0` | Merender rumus LaTeX ke HTML/MathML beserta font lokal untuk pratinjau dan cetak. |
| `lowlight` | `^3.3.0` | Syntax highlighting berbasis AST highlight.js, dirender sebagai elemen React tanpa HTML mentah. |
| `lucide-react` | `^1.55.0` | Library ikon yang dipilih di konfigurasi shadcn dan digunakan di antarmuka aplikasi. |
| `tw-animate-css` | `^1.4.0` | Stylesheet utility animasi, diimpor oleh CSS global. |
| `@fontsource-variable/inter` | `^5.3.0` | Font Inter Variable lokal, diimpor oleh CSS global. |

## Dependensi pengembangan

| Paket | Versi deklarasi | Peran |
| --- | --- | --- |
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
- `src/App.tsx`: workspace folio dan renderer Markdown dasar berbasis React; tidak merender HTML mentah.
- `src/components/highlighted-code.tsx`: rendering token syntax highlighting dari AST lowlight ke elemen React, termasuk deteksi bahasa dan fallback teks biasa.
- `src/style.css`: import Tailwind, animasi, shadcn, dan Inter; token warna OKLCH, radius, serta tema terang/gelap dengan kelas `.dark`. Belum ada kontrol UI untuk mengganti tema.
- `src/components/ui/button.tsx`: Button berbasis Base UI dengan variant `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`, serta ukuran biasa dan ikon. Mengekspor `Button`; `buttonVariants` merupakan konstanta internal.
- `src/components/ui/`: komponen resmi shadcn berbasis Base UI untuk kontrol, form, dialog, status, dan notifikasi. Textarea memiliki variant `editor`; helper variant Toggle dipisah ke `toggle-variants.ts` agar kompatibel dengan Fast Refresh.
- `src/lib/toast.ts`: manager notifikasi bersama untuk komponen shadcn Toaster dan aksi aplikasi.
- `src/lib/utils.ts`: re-export `cn` dari paket `cn`; tidak menggunakan implementasi lokal berbasis `clsx`/`tailwind-merge`.
- `src/assets/` dan `public/`: aset gambar/logo serta favicon dan ikon statis.
- `vite.config.ts`: plugin React dan Tailwind; alias `@` menuju `src`.
- `components.json`: shadcn style `base-nova`, TSX aktif, RSC nonaktif, base color `neutral`, CSS variables aktif, ikon Lucide. Alias komponen/UI/lib/utils/hooks mengarah ke `@/...`; folder hooks belum tersedia.
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

Belum ada script `test` dan belum ada versi Node yang dipatok melalui field `engines` di `package.json`.

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
- `npm run build`: berhasil. Vite memberi peringatan penggunaan `__dirname` di `vite.config.ts`, yang tidak didukung oleh `configLoader: 'native'`; pesan tooling menyarankan `import.meta.dirname`. Ini belum diperbaiki.
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
- Renderer di `src/App.tsx` menghasilkan tabel HTML semantik untuk isi dokumen (bukan kontrol UI), dengan `thead`, `tbody`, header `scope="col"`, dan perataan dari titik dua. Inline formatting, syntax highlighting, dan matematika tetap tersedia dalam sel.
- Pagination membagi tabel per baris dan mengulang header. Baris melebihi satu halaman dibagi per sel menggunakan pemotongan logis yang mempertahankan formula dan markup inline. Lebar kolom tetap konsisten antarhalaman melalui table-layout fixed.
- Verifikasi browser: contoh alat ukur tiga baris; tabel 100 baris pada delapan halaman, header berulang, 100 rumus utuh, isi identik, dan tanpa overflow. Satu baris panjang pada tujuh halaman mempertahankan isi setiap sel tanpa overflow. Build/lint berhasil.
