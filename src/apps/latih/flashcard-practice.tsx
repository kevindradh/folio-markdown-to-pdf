import { ArrowRight, BookOpen, Layers, Lightbulb, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import type { Collection } from './collections'
import { MarkdownContent } from './markdown-content'

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
            {revealed ? <><MarkdownContent className="latih-flashcard-prompt" text={question.question} /><h2 className="sr-only">Jawaban kartu</h2><MarkdownContent className="latih-flashcard-primary latih-flashcard-answer" text={String(question.answer)} />{question.explanation.trim() && <div className="latih-flashcard-context"><h3>Penjelasan</h3><MarkdownContent text={question.explanation} /></div>}</> : <><h1 className="sr-only">Pertanyaan kartu</h1><MarkdownContent className="latih-flashcard-primary" text={question.question} />{hintOpen && question.hint && <aside className="latih-flashcard-hint"><Lightbulb aria-hidden="true" /><MarkdownContent text={question.hint} /></aside>}</>}
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
