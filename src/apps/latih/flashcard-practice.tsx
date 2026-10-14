import { ArrowRight, BookOpen, Layers, Lightbulb, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import type { Collection } from './collections'

export function FlashcardPractice({ question, index, total, revealed, hintOpen, onHint, onReveal, onFront, nextLabel }: {
  question: Collection['questions'][number]
  index: number
  total: number
  revealed: boolean
  hintOpen: boolean
  onHint: () => void
  onReveal: () => void
  onFront: () => void
  nextLabel: string
}) {
  return <>
    <main className="latih-flashcard-stage">
      <Card className="latih-flashcard" data-face={revealed ? 'answer' : 'question'}>
        <CardHeader className="latih-flashcard-meta"><Badge variant="secondary">{revealed ? <BookOpen aria-hidden="true" /> : <Layers aria-hidden="true" />}{revealed ? 'Jawaban' : 'Pertanyaan'}</Badge><span>{index + 1} / {total}</span></CardHeader>
        <CardContent className="latih-flashcard-body">
          <section key={`${index}-${revealed}`} className="latih-flashcard-face" aria-label={revealed ? 'Jawaban kartu' : 'Pertanyaan kartu'} aria-live="polite">
            {revealed ? <><p className="latih-flashcard-prompt">{question.question}</p><h2>{String(question.answer)}</h2>{question.explanation.trim() && <div className="latih-flashcard-context"><h3>Penjelasan</h3><p>{question.explanation}</p></div>}</> : <><h1>{question.question}</h1>{hintOpen && question.hint && <aside className="latih-flashcard-hint"><Lightbulb aria-hidden="true" /><p>{question.hint}</p></aside>}</>}
          </section>
        </CardContent>
      </Card>
    </main>
    <footer className="latih-quiz-actions latih-flashcard-actions">
      <div className="latih-quiz-secondary">{revealed ? <Button variant="outline" onClick={onFront}><RotateCcw data-icon="inline-start" />Lihat pertanyaan</Button> : question.hint?.trim() ? <Button variant="outline" aria-pressed={hintOpen} onClick={onHint}><Lightbulb data-icon="inline-start" />Petunjuk</Button> : <span className="latih-subtle">Ingat jawabannya sebelum membuka kartu.</span>}</div>
      <Button size="lg" onClick={onReveal}>{revealed ? nextLabel : 'Lihat jawaban'}{revealed ? <ArrowRight data-icon="inline-end" /> : <RotateCcw data-icon="inline-end" />}</Button>
    </footer>
  </>
}
