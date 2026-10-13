# Changelog folio

Nomor awal dipetakan dari urutan commit pada main: commit pertama adalah v0.0.1. v0.0.1–v0.0.19 merupakan rekonstruksi riwayat pengembangan, bukan klaim rilis/tag yang pernah dipublikasikan. Catatan disusun dari yang terbaru. Versi aplikasi menunjukkan build yang sedang digunakan, termasuk saat offline.

## v0.0.32 — 2026-10-13

Ikon pengaturan dokumen

- Ikon pengaturan dokumen diganti menjadi slider agar lebih sesuai dengan fungsi pengaturan.

## v0.0.31 — 2026-10-13

Versi dan changelog pada navbar

- Nomor versi ditampilkan di samping logo folio, dengan menu Changelog di navbar bersama Panduan Markdown.
- Teks File diproses di browser kamu. Tanpa unggah ke server. beserta ikon centangnya dihapus dari footer.

## v0.0.30 — 2026-10-13

Navbar lebih ringkas

- Navbar lebih langsing pada desktop dan ponsel, dengan ukuran logo serta jarak identitas aplikasi yang lebih proporsional.
- Indikator offline dan Panduan Markdown tetap tersedia pada navbar.

## v0.0.29 — 2026-10-13

Mode fokus untuk menulis tanpa scroll halaman luar

- Mode fokus memenuhi area browser dan membuka editor saja, dengan scroll halaman luar dikunci agar tulisan lebih nyaman diedit.
- Pratinjau dan tampilan berdampingan tetap tersedia; tombol keluar atau Escape mengembalikan tampilan sebelumnya tanpa mengubah dokumen.

## v0.0.28 — 2026-10-13

Posisi editor tetap saat menyisipkan pemisah halaman

- Menyisipkan pemisah halaman pada dokumen panjang mempertahankan posisi scroll dan kursor, sehingga editor serta pratinjau tidak meloncat ke bagian terakhir.
- Tombol pemformatan editor juga mempertahankan posisi tulisan selama penyisipan.

## v0.0.27 — 2026-10-13

Pemisah halaman dan awal bab

- Sisipkan pemisah halaman dari toolbar atau tulis <!-- pagebreak --> pada baris tersendiri untuk memulai bagian berikutnya pada halaman baru.
- Pengaturan Awal bab dapat memulai judul # atau # dan ## pada halaman baru, berlaku pada pratinjau dan PDF serta tersimpan bersama dokumen.

## v0.0.26 — 2026-10-13

Scroll editor dan pratinjau tersinkronisasi

- Kontrol Sinkronkan scroll menghubungkan posisi editor dan pratinjau berdasarkan bagian Markdown, termasuk saat dokumen terbagi halaman atau zoom berubah.
- Sinkronisasi bisa diaktifkan atau dinonaktifkan; pilihan diingat di browser dan berlaku saat kedua panel ditampilkan.

## v0.0.25 — 2026-10-13

Indikator offline tetap terlihat pada mode pengembangan

- Ikon status dan tooltip tetap tampil saat aplikasi dibuka pada mode pengembangan, dengan penjelasan bahwa cache offline belum aktif.
- Browser tanpa dukungan offline menampilkan keterangan yang jelas; status dan pembaruan PWA pada build produksi tetap tersedia.

## v0.0.24 — 2026-10-13

Pengaturan dokumen yang lebih rapi

- Pengaturan dikelompokkan menjadi Halaman dan Tema kode, dengan label serta kontrol yang sejajar.
- Tata letak menyesuaikan layar desktop, tablet, dan ponsel agar pengaturan tetap mudah dibaca.

## v0.0.23 — 2026-10-13

Perbaikan kode yang hilang saat bahasa tidak terdeteksi

- Kode inline seperti Console.WriteLine(), Program, dan eko kini tetap tampil ketika bahasa tidak dikenali otomatis.
- Blok kode tanpa nama bahasa juga mempertahankan teks asli jika deteksi highlighting menghasilkan keluaran kosong.

## v0.0.22 — 2026-10-13

Tema kode inline dan blok yang terpisah

- Tema terang atau gelap dapat dipilih secara terpisah untuk kode inline dan blok kode.
- Pilihan tersimpan bersama dokumen serta riwayatnya, dan berlaku pada pratinjau maupun cetak. Dokumen lama mempertahankan tema sebelumnya untuk kedua jenis kode.

## v0.0.21 — 2026-10-13

Tur aplikasi untuk pengguna baru

- Tur singkat menyorot editor, pratinjau, pengaturan, pengelolaan dokumen, dan ekspor PDF pada kunjungan pertama.
- Tur dapat dilewati dan dibuka kembali melalui Panduan Markdown, termasuk saat offline.

## v0.0.20 — 2026-10-13

Versi aplikasi dan changelog

- Nomor versi tampil di footer dan membuka riwayat pembaruan.
- Riwayat sejak commit pertama tersedia dalam bahasa Indonesia, termasuk saat aplikasi digunakan offline.

## v0.0.19 — 2026-10-13

Status offline yang ringkas

- Status offline menjadi ikon dengan tooltip pada navbar; ikon pembaruan muncul ketika versi baru tersedia.

Commit: [6aaf410](https://github.com/kevindradh/folio-markdown-to-pdf/commit/6aaf41070abd0783aa0b83ffe65b2b1882c50d0a)

## v0.0.18 — 2026-10-12

Penggunaan offline

- Aplikasi dapat dibuka ulang tanpa internet setelah siap; pembaruan menunggu tindakan pengguna dan penyimpanan draft.

Commit: [ed35acc](https://github.com/kevindradh/folio-markdown-to-pdf/commit/ed35accec943a1e7f21f2ce9f46734dcb2f364ea)

## v0.0.17 — 2026-10-12

Pengujian WebKit lebih stabil

- Pengujian otomatis disesuaikan untuk beban runner dan animasi; alur penggunaan aplikasi tetap sama.

Commit: [bda99ca](https://github.com/kevindradh/folio-markdown-to-pdf/commit/bda99ca5c0477a88b30b6e922414c911f3b0dc3b)

## v0.0.16 — 2026-10-12

Pemulihan versi lebih aman

- Aksi riwayat tidak lagi berpindah mengikuti dokumen di tab lain; konfirmasi pemulihan mempertahankan versi yang dipilih.

Commit: [d492f5f](https://github.com/kevindradh/folio-markdown-to-pdf/commit/d492f5fc8d48b16c780bcc1d444e7851fe4acbf2)

## v0.0.15 — 2026-10-12

Project dan riwayat dokumen

- Beberapa dokumen dapat dikelompokkan dalam project, disimpan otomatis, dan dipulihkan melalui riwayat versi.

Commit: [fb1dda9](https://github.com/kevindradh/folio-markdown-to-pdf/commit/fb1dda9ae4515040ac803cf0637803a7140e2139)

## v0.0.14 — 2026-10-12

Pemeriksaan unduhan Safari

- Pengujian menerima penyesuaian nama unduhan WebKit tanpa mengubah isi file Markdown.

Commit: [416ac19](https://github.com/kevindradh/folio-markdown-to-pdf/commit/416ac19154c26d62c5f2cc7c68fc3c687f66c748)

## v0.0.13 — 2026-10-12

Persiapan publikasi

- Konfigurasi repository, pemeriksaan otomatis, dan panduan deployment diperbarui.

Commit: [9568262](https://github.com/kevindradh/folio-markdown-to-pdf/commit/95682626177f25f9276e6adff438dc2c7ccd1cdd)

## v0.0.12 — 2026-10-12

Gambar, daftar, dan catatan kaki

- Gambar lokal, daftar bertingkat, checklist, dan catatan kaki didukung dalam pratinjau serta PDF.

Commit: [f79c9f6](https://github.com/kevindradh/folio-markdown-to-pdf/commit/f79c9f6d0d1eb727086835f95b19725351a4c94e)

## v0.0.11 — 2026-10-12

Identitas folio

- Ikon folio dan judul browser diterapkan; nama dokumen digunakan ketika mengekspor PDF.

Commit: [7ac673b](https://github.com/kevindradh/folio-markdown-to-pdf/commit/7ac673b5e64fddec1876509c52ff29aab958da62)

## v0.0.10 — 2026-10-12

Draft otomatis dan dokumen besar

- Draft tersimpan otomatis; batas input dan pemrosesan bertahap membantu menjaga editor tetap responsif.

Commit: [64ac2b8](https://github.com/kevindradh/folio-markdown-to-pdf/commit/64ac2b844b2e6788983e90c33a0bb68c59fafe0d)

## v0.0.9 — 2026-10-12

Verifikasi PDF dan dependensi

- Pemeriksaan hasil PDF diperluas dan dependensi yang rentan dibersihkan.

Commit: [59aeb61](https://github.com/kevindradh/folio-markdown-to-pdf/commit/59aeb61fb5f329f055c3e40b0183bb72a9b4e102)

## v0.0.8 — 2026-10-12

Tema kode terang dan gelap

- Tema kode dapat dipilih untuk pratinjau serta dokumen PDF.

Commit: [343cbf9](https://github.com/kevindradh/folio-markdown-to-pdf/commit/343cbf9ad38354b2068dea1226819e143eaa7e75)

## v0.0.7 — 2026-10-12

Tabel Markdown

- Tabel dapat ditampilkan dan dibagi per halaman dengan header berulang; toolbar editor disederhanakan.

Commit: [ac29733](https://github.com/kevindradh/folio-markdown-to-pdf/commit/ac29733c88c7fc0c13632e45433bc0a619702a30)

## v0.0.6 — 2026-10-12

Dukungan rumus matematika

- Rumus LaTeX dapat ditampilkan; rumus tetap utuh saat konten dibagi ke beberapa halaman.

Commit: [1a0973a](https://github.com/kevindradh/folio-markdown-to-pdf/commit/1a0973aefdcd64b7cfe65ee994b015713cd86133)

## v0.0.5 — 2026-10-12

Teks antarmuka diperjelas

- Penjelasan aplikasi dan kredit pembuat diperbarui.

Commit: [44bc593](https://github.com/kevindradh/folio-markdown-to-pdf/commit/44bc59306cfd1fee264085c8303bd6b83431290e)

## v0.0.4 — 2026-10-12

Kode lebih mudah dibaca

- Syntax highlighting ditambahkan untuk kode; panduan penggunaan Markdown dan ekspor PDF diperjelas.

Commit: [4894b13](https://github.com/kevindradh/folio-markdown-to-pdf/commit/4894b134c957ca4f29c430fd6d12db6c5826c0fb)

## v0.0.3 — 2026-10-12

Pratinjau per halaman

- Pratinjau dibagi sesuai ukuran fisik kertas sehingga susunan halaman lebih dekat dengan hasil cetak.

Commit: [4619d61](https://github.com/kevindradh/folio-markdown-to-pdf/commit/4619d611a1de372f2263adb3f9fdbafbe3e6265b)

## v0.0.2 — 2026-10-12

Kontrol yang lebih konsisten

- Kontrol antarmuka memakai shadcn; tata letak workspace diperbaiki untuk layar kecil.

Commit: [4f461f6](https://github.com/kevindradh/folio-markdown-to-pdf/commit/4f461f61d3449703dab9248fcc775aa565086e26)

## v0.0.1 — 2026-10-11

Fondasi folio

- Editor Markdown, pratinjau dokumen, impor file, pengaturan dokumen, dan ekspor melalui dialog cetak tersedia.

Commit: [b67590f](https://github.com/kevindradh/folio-markdown-to-pdf/commit/b67590ff4e1c2e4735592a9f98836ac1e6c0e1ff)
