import { createId } from '../../lib/create-id'
export type Collection = { id?: string; title: string; type: 'multiple-choice' | 'flashcard'; demo?: boolean; questions: { question: string; options?: string[]; answer: number | string; explanation: string; hint?: string }[] }
export const examples: Collection[] = [
 { id: 'contoh-cara-belajar', title: 'Kenali cara belajarmu', type: 'multiple-choice', demo: true, questions: [
  { question: 'Cara mana yang membantu mengingat materi lebih lama?', options: ['Membaca ulang tanpa jeda', 'Menguji ingatan secara berkala', 'Menyalin seluruh buku', 'Belajar sekali semalam penuh'], hint: 'Pikirkan kegiatan yang membuat kamu mengambil informasi dari ingatan.', answer: 1, explanation: 'Mengambil kembali informasi dari ingatan dan mengulangnya dengan jeda membantu retensi.' },
  { question: 'Apa yang sebaiknya dilakukan setelah menjawab salah?', options: ['Melewati pembahasan', 'Menghafal huruf jawaban', 'Memahami alasan jawaban benar', 'Berhenti belajar'], answer: 2, explanation: 'Pembahasan membantu menemukan konsep yang belum dipahami.' },
  { question: 'Mengapa menjelaskan materi dengan kata-kata sendiri?', options: ['Memeriksa pemahaman', 'Mengganti sumber belajar', 'Memperpanjang catatan', 'Menghindari latihan'], answer: 0, explanation: 'Menjelaskan kembali membantu melihat hubungan antaride.' }
 ] },
 { id: 'contoh-kosakata', title: 'Kosakata sehari-hari', type: 'flashcard', demo: true, questions: [
  { question: 'Curious', answer: 'Ingin tahu', explanation: 'I am curious about how it works.' },
  { question: 'Improve', answer: 'Meningkatkan', explanation: 'Practice helps you improve.' },
  { question: 'Remember', answer: 'Mengingat', explanation: 'Try to remember the main idea.' }
 ] }
]
export function templateFor(type: Collection['type']) {
 return JSON.stringify({ title: 'Judul materi kamu', type, questions: [type === 'multiple-choice' ? {
  question: 'Sebuah benda bermassa **2 kg** mengalami percepatan $a = 3\\,\\mathrm{m/s^2}$.\n\nMenurut hukum Newton, berapa gaya yang bekerja pada benda?',
  options: ['$F = 3\\,\\mathrm{N}$', '$F = 6\\,\\mathrm{N}$', '$F = 9\\,\\mathrm{N}$', '$F = 12\\,\\mathrm{N}$'],
  hint: 'Gunakan hukum II Newton: $F = ma$.',
  answer: 1,
  explanation: 'Gunakan **hukum II Newton**:\n\n$$\nF = ma = 2 \\times 3 = 6\\,\\mathrm{N}\n$$\n\nJadi gaya yang bekerja adalah **6 N**.'
 } : { question: '**Luas lingkaran**\n\nApa rumus luas lingkaran dengan jari-jari $r$?', answer: '$L = \\pi r^2$', hint: 'Luas sebanding dengan kuadrat jari-jari: $r^2$.', explanation: 'Untuk $r = 2\\,\\mathrm{cm}$:\n\n$$\nL = \\pi \\times 2^2 = 4\\pi\\,\\mathrm{cm}^2\n$$' }] }, null, 2)
}
export function promptFor(type: Collection['type']) {
 const format = type === 'multiple-choice'
  ? 'type harus multiple-choice. Setiap soal memiliki question, options (2–6 teks pilihan), answer (angka indeks opsi benar mulai dari 0), dan explanation.'
  : 'type harus flashcard. Setiap kartu memiliki question, answer (teks jawaban singkat, bukan angka indeks), dan explanation. Jangan sertakan options.'
 return [
  'Buat latihan untuk materi [ISI MATERI], sebanyak [JUMLAH SOAL] (1–100). Gunakan bahasa Indonesia. Pastikan soal, jawaban, dan pembahasan akurat.',
  'Kembalikan satu objek JSON valid di dalam satu blok kode berlabel json (```json), tanpa pengantar atau teks lain. Ini menjaga karakter Markdown dan backslash saat pengguna memakai tombol salin kode di ponsel. Gunakan title, type, dan questions sesuai template. Total hasil maksimal 100 KiB.',
  format,
  'question, explanation, hint opsional, serta teks options atau answer flashcard mendukung Markdown dan LaTeX. hint memberi petunjuk konsep tanpa membocorkan jawaban. Jangan gunakan HTML mentah.',
  String.raw`Di dalam nilai string JSON, tulis rumus inline di dalam $...$ dan rumus blok di dalam $$...$$ pada baris tersendiri. Jangan bungkus rumus dengan backtick atau fenced code di dalam string: isinya akan ditampilkan sebagai kode literal. Blok kode json hanya membungkus objek JSON terluar. Gunakan sintaks KaTeX, tanpa preamble LaTeX, paket, atau dokumen lengkap.`,
  String.raw`Escape JSON wajib: setiap backslash LaTeX harus ditulis sebagai \\ di sumber JSON, tanda kutip di dalam teks sebagai \", dan baris baru sebagai \n. Contoh field JSON: "answer": "$\\frac{a}{b}$". Jangan menulis backslash tunggal untuk perintah seperti \frac, \times, atau \begin karena dapat menjadi escape JSON yang salah atau karakter kontrol.`,
  String.raw`Untuk matriks, gunakan \\begin{pmatrix} dan \\end{pmatrix} dalam sumber JSON; pemisah baris matriks ditulis \\\\. Contoh field JSON: "question": "$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$". Setelah JSON dibaca, perintah memiliki satu backslash dan pemisah baris matriks dua. Jangan menambah lapisan escape lagi.`,
  'Ganti seluruh isi contoh berikut dengan materi yang diminta. Pertahankan struktur dan tipe datanya:',
  '```json\n' + templateFor(type) + '\n```',
 ].join('\n\n')
}
export function parseCollection(source: string): Collection {
 if (new TextEncoder().encode(source).length > 102400) throw new Error('JSON maksimal 100 KiB.')
 // Accept one complete code block copied from an AI response, never surrounding prose.
 const trimmed = source.trim()
 const codeBlock = trimmed.match(/^```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n```$/i)
 const json = codeBlock ? codeBlock[1] : trimmed
 let data: Collection
 try { data = JSON.parse(json) } catch {
  if (/\\(?:begin|end|frac|times|text|boxed|sqrt|quad)\b/.test(json)) throw new Error('JSON belum valid. Periksa escape backslash LaTeX. Salin lewat tombol salin pada blok kode JSON di AI, atau minta AI membuat ulang memakai template latih.')
  throw new Error('JSON belum valid. Periksa koma, tanda kutip, dan kurungnya.')
 }
 if (!data || typeof data.title !== 'string' || !data.title.trim() || data.title.length > 120 || !['multiple-choice', 'flashcard'].includes(data.type) || !Array.isArray(data.questions) || !data.questions.length || data.questions.length > 100) throw new Error('Gunakan format template latih. dengan judul, jenis latihan, dan 1–100 soal.')
 for (const item of data.questions) {
  if (item && item.hint !== undefined && typeof item.hint !== 'string') throw new Error('hint harus berupa teks Markdown atau dihilangkan.')
  if (!item || typeof item.question !== 'string' || !item.question.trim() || typeof item.explanation !== 'string') throw new Error('Setiap soal membutuhkan question dan explanation berupa teks.')
  if (data.type === 'multiple-choice' && (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 6 || item.options.some(option => typeof option !== 'string' || !option.trim()) || !Number.isInteger(item.answer) || Number(item.answer) < 0 || Number(item.answer) >= item.options.length)) throw new Error('Gunakan 2–6 opsi dan answer berupa indeks jawaban, dimulai dari 0.')
  if (data.type === 'flashcard' && (typeof item.answer !== 'string' || !item.answer.trim())) throw new Error('Jawaban flashcard harus berupa teks.')
 }
 return { title: data.title.trim(), type: data.type, questions: data.questions.map(item => ({ question: item.question, options: item.options, answer: item.answer, explanation: item.explanation, hint: item.hint })) }
}

// Internal identifiers belong to local records, not to the JSON import format.
export function storedCollection(data: Collection): Collection {
 const collection = parseCollection(JSON.stringify({ title: data.title, type: data.type, questions: data.questions }))
 const id = typeof data.id === 'string' && /^(?:contoh-cara-belajar|contoh-kosakata|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(data.id) ? data.id : undefined
 return { ...collection, id, demo: data.demo === true }
}
export function identifyCollection(item: Collection, available: Collection[]): Collection {
 if (item.id) return item
 const content = (data: Collection) => JSON.stringify(parseCollection(JSON.stringify({ title: data.title, type: data.type, questions: data.questions })))
 const source = content(item)
 return available.find(other => content(other) === source) ?? { ...item, id: createId() }
}
