import { useState } from 'react'
import { ArrowLeft, Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Collection } from './collections'
export function StudySession({ collection, onExit }: { collection: Collection; onExit: () => void }) {
 const [index, setIndex] = useState(0), [selected, setSelected] = useState<string[]>([]), [revealed, setRevealed] = useState(false), [score, setScore] = useState(0)
 const done = index === collection.questions.length, question = collection.questions[index]
 return <div className="latih-shell latih-study"><header className="latih-study-header"><Button variant="ghost" onClick={onExit}><ArrowLeft data-icon="inline-start" />Kembali ke koleksi</Button><Badge variant="secondary">{collection.demo ? 'Latihan contoh' : 'Latihan pribadi'}</Badge></header><main className="latih-study-main"><p className="latih-subtle">{collection.title}</p>
 {done ? <section className="latih-study-question"><Check className="latih-complete-icon" aria-hidden="true" /><h1>Sesi selesai.</h1><p>{collection.type === 'multiple-choice' ? `${score} dari ${collection.questions.length} jawaban benar.` : `${collection.questions.length} kartu sudah dipelajari.`}</p><Button onClick={() => { setIndex(0); setScore(0); setSelected([]); setRevealed(false) }}><RotateCcw data-icon="inline-start" />Ulangi latihan</Button></section>
 : <section className="latih-study-question"><p className="latih-subtle">{collection.type === 'flashcard' ? 'Kartu' : 'Soal'} {index + 1} dari {collection.questions.length}</p><h1>{question.question}</h1>
 {collection.type === 'multiple-choice' && <ToggleGroup aria-label="Pilih jawaban" value={selected} onValueChange={setSelected} orientation="vertical" variant="outline" className="latih-answers" disabled={revealed}>{question.options!.map((option, i) => <ToggleGroupItem key={i} value={String(i)} className="latih-answer"><span className="latih-answer-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span></ToggleGroupItem>)}</ToggleGroup>}
 {revealed && <section className="latih-explanation" aria-live="polite"><h2>{collection.type === 'flashcard' ? String(question.answer) : Number(selected[0]) === question.answer ? 'Benar, kamu sudah paham.' : `Jawaban yang benar: ${question.options![Number(question.answer)]}`}</h2><p>{question.explanation}</p></section>}
 <Button size="lg" disabled={!revealed && collection.type === 'multiple-choice' && !selected.length} onClick={() => { if (revealed) { setIndex(index + 1); setSelected([]); setRevealed(false) } else { setRevealed(true); if (Number(selected[0]) === question.answer) setScore(score + 1) } }}>{revealed ? index === collection.questions.length - 1 ? 'Selesaikan sesi' : 'Berikutnya' : collection.type === 'flashcard' ? 'Lihat jawaban' : 'Periksa jawaban'}</Button></section>}
 </main></div>
}
