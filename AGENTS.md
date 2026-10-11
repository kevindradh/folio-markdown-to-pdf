# Panduan Proyek

Dokumentasi ini berdasarkan pemeriksaan kode, konfigurasi, dan paket lokal pada 11 Oktober 2026. Perbarui jika struktur atau tooling berubah.

## Gambaran umum

- Tujuan proyek: membangun tool untuk mengonversi Markdown menjadi dokumen PDF. Markdown menjadi input, dan file PDF menjadi hasil konversi. Detail fitur dan alur penggunaan akan ditentukan lebih lanjut bersama pengguna.
- Nama paket: `markdown-to-pdf`; paket privat, versi `0.0.0`, menggunakan ES modules (`type: module`).
- Aplikasi frontend React + Vite + TypeScript. Tampilan awal di `src/App.tsx` menggunakan nama sementara “folio”, dengan editor dan pratinjau berdampingan.
- Editor, unggah file Markdown, pratinjau sintaks dasar, pengaturan kertas/tipografi/margin, dan zoom sudah tersedia. Ekspor memakai dialog cetak browser (Save as PDF). Parser awal belum mendukung seluruh spesifikasi Markdown atau pagination pratinjau; belum ada dependensi Markdown/PDF khusus. Isi editor tersimpan dalam state sesi, belum persisten.
- Belum ada router, backend, state management eksternal, atau framework pengujian dalam konfigurasi proyek.
- Gunakan npm; lockfile yang tersedia adalah `package-lock.json`. `README.md` masih berisi dokumentasi template Vite.
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
- `src/style.css`: import Tailwind, animasi, shadcn, dan Inter; token warna OKLCH, radius, serta tema terang/gelap dengan kelas `.dark`. Belum ada kontrol UI untuk mengganti tema.
- `src/components/ui/button.tsx`: Button berbasis Base UI dengan variant `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`, serta ukuran biasa dan ikon. Mengekspor `Button`; `buttonVariants` merupakan konstanta internal.
- `src/lib/utils.ts`: re-export `cn` dari paket `cn`; tidak menggunakan implementasi lokal berbasis `clsx`/`tailwind-merge`.
- `src/assets/` dan `public/`: aset gambar/logo serta favicon dan ikon statis.
- `vite.config.ts`: plugin React dan Tailwind; alias `@` menuju `src`.
- `components.json`: shadcn style `base-nova`, TSX aktif, RSC nonaktif, base color `neutral`, CSS variables aktif, ikon Lucide. Alias komponen/UI/lib/utils/hooks mengarah ke `@/...`; folder hooks belum tersedia.
- `tsconfig.json`: project references ke konfigurasi aplikasi dan tooling, serta pemetaan `@/*` ke `./src/*`. Konfigurasi anak tidak memakai `extends` ke file ini, sehingga jangan menganggap pemetaan alias otomatis diwarisi saat pemeriksaan tipe aplikasi.
- `tsconfig.app.json`: target ES2023, module ESNext, resolusi bundler, JSX `react-jsx`, `noEmit`, dan pemeriksaan unused locals/parameters. `strict` belum diaktifkan secara eksplisit.
- `tsconfig.node.json`: konfigurasi untuk `vite.config.ts`, target ES2023, module NodeNext, dan tipe Node.
- `eslint.config.js`: memeriksa `**/*.{ts,tsx}` menggunakan recommended JavaScript, TypeScript, React Hooks, dan React Refresh; mengabaikan `dist`.

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
