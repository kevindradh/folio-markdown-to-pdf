import { useState } from 'react'
import { ArrowLeft, Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MarkdownContent } from './markdown-content'
import type { Collection } from './collections'

export function StudySession({ collection, onExit }: { collection: Collection; onExit: () => void }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const multipleChoice = collection.type === 'multiple-choice'
  const done = index === collection.questions.length
  const question = collection.questions[index]

  function advance() {
    if (revealed) { setIndex(index + 1); setSelected([]); setRevealed(false) }
    else { setRevealed(true); if (Number(selected[0]) === question.answer) setScore(score + 1) }
  }

  return <div className="latih-shell latih-study">
    <header className="latih-study-header">
      <Button variant="ghost" onClick={onExit}><ArrowLeft data-icon="inline-start" />Kembali ke koleksi</Button>
      <Badge variant="secondary">{collection.demo ? 'Latihan contoh' : 'Latihan pribadi'}</Badge>
    </header>
    <main className="latih-study-main">
      <p className="latih-subtle">{collection.title}</p>
      {done ? <section className="latih-study-question">
        <Check className="latih-complete-icon" aria-hidden="true" />
        <h1>Sesi selesai.</h1>
        <p>{multipleChoice ? `${score} dari ${collection.questions.length} jawaban benar.` : `${collection.questions.length} kartu sudah dipelajari.`}</p>
        <Button onClick={() => { setIndex(0); setScore(0); setSelected([]); setRevealed(false) }}><RotateCcw data-icon="inline-start" />Ulangi latihan</Button>
      </section> : <section className="latih-study-question">
        <p className="latih-subtle">{multipleChoice ? 'Soal' : 'Kartu'} {index + 1} dari {collection.questions.length}</p>
        {multipleChoice ? <section aria-label="Teks soal" className="latih-question-content"><h1 className="sr-only">Soal {index + 1}</h1><MarkdownContent text={question.question} /></section> : <h1>{question.question}</h1>}
        {multipleChoice && <ToggleGroup aria-label="Pilih jawaban" value={selected} onValueChange={setSelected} orientation="vertical" variant="outline" className="latih-answers" disabled={revealed}>
          {question.options!.map((option, i) => <ToggleGroupItem key={i} value={String(i)} className="latih-answer" render={<div />} nativeButton={false}>
            <span className="latih-answer-letter">{String.fromCharCode(65 + i)}</span>
            <MarkdownContent text={option} interactive={false} />
          </ToggleGroupItem>)}
        </ToggleGroup>}
        {revealed && <section className="latih-explanation" aria-live="polite">
          <h2>{!multipleChoice ? String(question.answer) : Number(selected[0]) === question.answer ? 'Benar, kamu sudah paham.' : 'Jawaban yang benar:'}</h2>
          {multipleChoice && Number(selected[0]) !== question.answer && <MarkdownContent text={question.options![Number(question.answer)]} interactive={false} />}
          {multipleChoice ? <MarkdownContent text={question.explanation} /> : <p>{question.explanation}</p>}
        </section>}
        <Button size="lg" disabled={!revealed && multipleChoice && !selected.length} onClick={advance}>
          {revealed ? index === collection.questions.length - 1 ? 'Selesaikan sesi' : 'Berikutnya' : multipleChoice ? 'Periksa jawaban' : 'Lihat jawaban'}
        </Button>
      </section>}
    </main>
  </div>
}
