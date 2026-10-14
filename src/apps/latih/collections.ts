export type Collection = { title: string; type: 'multiple-choice' | 'flashcard'; demo?: boolean; questions: { question: string; options?: string[]; answer: number | string; explanation: string }[] }
export const examples: Collection[] = [
 { title: 'Kenali cara belajarmu', type: 'multiple-choice', demo: true, questions: [
  { question: 'Cara mana yang membantu mengingat materi lebih lama?', options: ['Membaca ulang tanpa jeda', 'Menguji ingatan secara berkala', 'Menyalin seluruh buku', 'Belajar sekali semalam penuh'], answer: 1, explanation: 'Mengambil kembali informasi dari ingatan dan mengulangnya dengan jeda membantu retensi.' },
  { question: 'Apa yang sebaiknya dilakukan setelah menjawab salah?', options: ['Melewati pembahasan', 'Menghafal huruf jawaban', 'Memahami alasan jawaban benar', 'Berhenti belajar'], answer: 2, explanation: 'Pembahasan membantu menemukan konsep yang belum dipahami.' },
  { question: 'Mengapa menjelaskan materi dengan kata-kata sendiri?', options: ['Memeriksa pemahaman', 'Mengganti sumber belajar', 'Memperpanjang catatan', 'Menghindari latihan'], answer: 0, explanation: 'Menjelaskan kembali membantu melihat hubungan antaride.' }
 ] },
 { title: 'Kosakata sehari-hari', type: 'flashcard', demo: true, questions: [
  { question: 'Curious', answer: 'Ingin tahu', explanation: 'I am curious about how it works.' },
  { question: 'Improve', answer: 'Meningkatkan', explanation: 'Practice helps you improve.' },
  { question: 'Remember', answer: 'Mengingat', explanation: 'Try to remember the main idea.' }
 ] }
]
export function templateFor(type: Collection['type']) {
 return JSON.stringify({ title: 'Judul materi kamu', type, questions: [type === 'multiple-choice' ? {
  question: 'Sebuah benda bermassa **2 kg** mengalami percepatan $a = 3\\,\\mathrm{m/s^2}$.\n\nMenurut hukum Newton, berapa gaya yang bekerja pada benda?',
  options: ['$F = 3\\,\\mathrm{N}$', '$F = 6\\,\\mathrm{N}$', '$F = 9\\,\\mathrm{N}$', '$F = 12\\,\\mathrm{N}$'],
  answer: 1,
  explanation: 'Gunakan **hukum II Newton**:\n\n$$\nF = ma = 2 \\times 3 = 6\\,\\mathrm{N}\n$$\n\nJadi gaya yang bekerja adalah **6 N**.'
 } : { question: 'Istilah atau pertanyaan', answer: 'Jawaban singkat', explanation: 'Konteks tambahan.' }] }, null, 2)
}
export function parseCollection(source: string): Collection {
 if (new TextEncoder().encode(source).length > 102400) throw new Error('JSON maksimal 100 KiB.')
 let data: Collection
 try { data = JSON.parse(source) } catch { throw new Error('JSON belum valid. Periksa koma, tanda kutip, dan kurungnya.') }
 if (!data || typeof data.title !== 'string' || !data.title.trim() || data.title.length > 120 || !['multiple-choice', 'flashcard'].includes(data.type) || !Array.isArray(data.questions) || !data.questions.length || data.questions.length > 100) throw new Error('Gunakan format template latih. dengan judul, jenis latihan, dan 1–100 soal.')
 for (const item of data.questions) {
  if (!item || typeof item.question !== 'string' || !item.question.trim() || typeof item.explanation !== 'string') throw new Error('Setiap soal membutuhkan question dan explanation berupa teks.')
  if (data.type === 'multiple-choice' && (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 6 || item.options.some(option => typeof option !== 'string' || !option.trim()) || !Number.isInteger(item.answer) || Number(item.answer) < 0 || Number(item.answer) >= item.options.length)) throw new Error('Gunakan 2–6 opsi dan answer berupa indeks jawaban, dimulai dari 0.')
  if (data.type === 'flashcard' && (typeof item.answer !== 'string' || !item.answer.trim())) throw new Error('Jawaban flashcard harus berupa teks.')
 }
 return { title: data.title.trim(), type: data.type, questions: data.questions.map(item => ({ question: item.question, options: item.options, answer: item.answer, explanation: item.explanation })) }
}
