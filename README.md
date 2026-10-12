# folio — Markdown to PDF

Aplikasi React, Vite, dan TypeScript untuk menulis Markdown, melihat pratinjau dokumen, lalu menyimpannya sebagai PDF melalui dialog cetak browser.

## Menjalankan proyek

Gunakan npm dan lockfile yang tersedia:

```sh
npm ci
npm run dev
```

Perintah lainnya:

| Perintah | Fungsi |
| --- | --- |
| `npm run build` | Memeriksa TypeScript dan membuat build produksi di `dist/`. |
| `npm run lint` | Memeriksa kode dengan ESLint. |
| `npm run preview` | Menjalankan pratinjau build produksi. |

## Fitur

- Editor Markdown, toolbar format, dan impor file `.md`, `.markdown`, atau `.txt`.
- Mode editor, pratinjau, atau tampilan berdampingan.
- Pratinjau beberapa halaman sesuai ukuran A4 atau Letter, dengan nomor halaman.
- Pilihan tipografi Literary/Modern, margin Normal/Lebar/Tipis, dan zoom.
- Syntax highlighting untuk kode inline dan blok kode.
- Rumus LaTeX inline dan blok melalui KaTeX, termasuk matriks, pecahan, dan operator.
- Pemrosesan lokal di browser; isi editor hanya tersimpan selama sesi aplikasi.

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

Warna membedakan token seperti keyword, string, angka, nama fungsi, dan komentar. Highlighting tidak menjalankan kode atau memvalidasi kesalahan program. Kode dirender sebagai elemen React dari AST lowlight, tanpa menyisipkan HTML mentah.

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

Parser saat ini mendukung judul, paragraf, daftar berpoin, kutipan, pemisah, tautan, penekanan teks, dan kode. Belum mendukung seluruh spesifikasi Markdown, termasuk tabel dan gambar. Belum ada backend, penyimpanan persisten, atau script pengujian otomatis.

Build dan lint berhasil. Pengujian browser mencakup pagination A4/Letter, pengaturan dokumen, syntax highlighting, serta kode TypeScript 150 baris yang terbagi enam halaman tanpa kehilangan teks atau overflow. File PDF dari dialog cetak belum diverifikasi langsung; rincian pemeriksaan tercatat di AGENTS.md.
