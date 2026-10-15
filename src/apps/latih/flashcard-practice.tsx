import { useEffect, useEffectEvent, useRef, useState, type MouseEvent } from 'react'
import { ArrowRight, BookOpen, Lightbulb, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import type { Collection } from './collections'
import { MarkdownContent } from './markdown-content'

export function FlashcardPractice({ question, revealed, hintOpen, onHint, onReveal, onFront, onExplanation, nextLabel }: {
  question: Collection['questions'][number]
  revealed: boolean
  hintOpen: boolean
  onHint: () => void
  onReveal: () => void
  onFront: () => void
  onExplanation: () => void
  nextLabel: string
}) {
  const [answerAvailable, setAnswerAvailable] = useState(revealed)
  const [turning, setTurning] = useState(false)
  const pointer = useRef({ x: 0, y: 0, moved: false })
  useEffect(() => {
    if (!turning) return
    // Fallback if a browser suppresses transitionend (e.g. motion preference changes).
    const timer = window.setTimeout(() => setTurning(false), 650)
    return () => clearTimeout(timer)
  }, [turning])
  function flip() {
    if (turning) return
    setTurning(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    if (revealed) onFront()
    else { setAnswerAvailable(true); onReveal() }
  }
  function forward() {
    if (turning) return
    if (revealed) onReveal()
    else flip()
  }
  const onSpace = useEffectEvent(() => forward())
  useEffect(() => {
    function handleKey(event: globalThis.KeyboardEvent) {
      if (event.key !== ' ' || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target
      if (target instanceof Element && target.closest('input, textarea, select, a, [contenteditable]:not([contenteditable=false]), [role=textbox]')) return
      if (document.querySelector('[role=dialog], [role=alertdialog]') || window.getSelection()?.toString()) return
      // Own Space during practice, even when a footer button retained focus.
      // Prevent its native key-up click from firing a second, different action.
      event.preventDefault()
      event.stopPropagation()
      if (!event.repeat) onSpace()
    }
    document.addEventListener('keydown', handleKey, true)
    return () => document.removeEventListener('keydown', handleKey, true)
  }, [])
  function handleCardClick(event: MouseEvent<HTMLDivElement>) {
    if (pointer.current.moved || (event.target as Element).closest('a, button, input, textarea, select, [contenteditable]') || window.getSelection()?.toString()) return
    forward()
  }

  return <>
    <main className="latih-flashcard-stage" tabIndex={0} aria-label="Latihan flashcard" aria-keyshortcuts="Space">
      <div className="latih-flashcard-deck">
        <div className="latih-flashcard-rotor" data-revealed={revealed} data-turning={turning} onTransitionEnd={event => { if (event.target === event.currentTarget && event.propertyName === 'transform') setTurning(false) }}>
          {(['question', 'answer'] as const).map(face => {
            const answer = face === 'answer'
            const active = answer === revealed
            return <Card key={face} className="latih-flashcard" data-face={face} data-active={active} aria-hidden={!active} inert={!active} onClick={handleCardClick} onPointerCancel={() => { pointer.current.moved = true }} onPointerDown={event => { pointer.current = { x: event.clientX, y: event.clientY, moved: false } }} onPointerMove={event => { if (Math.hypot(event.clientX - pointer.current.x, event.clientY - pointer.current.y) > 8) pointer.current.moved = true }}>
              <CardHeader className="latih-flashcard-edge"><span className="latih-flashcard-sides" aria-hidden="true"><i data-active={!answer} /><i data-active={answer} /></span>{answer && <Button variant="ghost" size="icon" className="latih-flashcard-return" aria-label="Lihat pertanyaan" disabled={turning} onClick={flip}><RotateCcw /></Button>}</CardHeader>
              <CardContent className="latih-flashcard-body">
                <section className="latih-flashcard-face" aria-label={answer ? 'Jawaban kartu' : 'Pertanyaan kartu'} aria-live={active ? 'polite' : 'off'}>
                  {answer ? answerAvailable && <><h2 className="sr-only">Jawaban kartu</h2><MarkdownContent className="latih-flashcard-primary latih-flashcard-answer" text={String(question.answer)} /></> : <><h1 className="sr-only">Pertanyaan kartu</h1><MarkdownContent className="latih-flashcard-primary" text={question.question} /></>}
                </section>
              </CardContent>
            </Card>
          })}
        </div>
      </div>
      <p className="latih-flashcard-shortcuts"><span>Spasi / klik kartu <span>{revealed ? nextLabel.toLowerCase() : 'lihat jawaban'}</span></span></p>
    </main>
    <footer className="latih-quiz-actions latih-flashcard-actions">
      <div className="latih-quiz-secondary">{revealed ? <Button variant="outline" disabled={turning || !question.explanation.trim()} onClick={onExplanation}><BookOpen data-icon="inline-start" />Penjelasan</Button> : question.hint?.trim() ? <Button variant="outline" disabled={turning} aria-haspopup="dialog" aria-expanded={hintOpen} onClick={onHint}><Lightbulb data-icon="inline-start" />Petunjuk</Button> : <span className="latih-subtle">Jawaban masih tersembunyi</span>}</div>
      <Button size="lg" disabled={turning} onClick={forward}>{revealed ? nextLabel : 'Lihat jawaban'}{revealed ? <ArrowRight data-icon="inline-end" /> : <RotateCcw data-icon="inline-end" />}</Button>
    </footer>
  </>
}
