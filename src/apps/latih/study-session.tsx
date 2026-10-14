import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ArrowLeft, ArrowRight, Check, X, RotateCcw, Lightbulb, BookOpen, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { MarkdownContent } from './markdown-content'
import { cn } from '@/lib/utils'
import type { Collection } from './collections'
import { saveStudy, type StudyProgress } from './study-storage'

const media = '(max-width: 959px)'
function subscribeMobile(callback: () => void) {
  const query = window.matchMedia(media)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}
function mobileSnapshot() { return window.matchMedia(media).matches }

export function StudySession({ collection, initial, onExit }: { collection: Collection; initial: StudyProgress; onExit: () => void }) {
  const [index, setIndex] = useState(initial.index)
  const [selected, setSelected] = useState<string[]>(initial.selected)
  const [revealed, setRevealed] = useState(initial.revealed)
  const [score, setScore] = useState(initial.score)
  const [panel, setPanel] = useState<'hint' | 'explanation' | null>(initial.panel)
  const [expanded, setExpanded] = useState(initial.expanded)
  const [saved, setSaved] = useState(true)
  useEffect(() => {
    const result = saveStudy({ collection, progress: { index, selected, revealed, score, panel, expanded } })
    const frame = requestAnimationFrame(() => setSaved(result))
    return () => cancelAnimationFrame(frame)
  }, [collection, index, selected, revealed, score, panel, expanded])
  const mobile = useSyncExternalStore(subscribeMobile, mobileSnapshot)
  const questionPane = useRef<HTMLElement>(null)
  const multipleChoice = collection.type === 'multiple-choice'
  const done = index === collection.questions.length
  const question = collection.questions[index]
  const correct = !done && Number(selected[0]) === question.answer
  const nextLabel = index === collection.questions.length - 1 ? 'Selesaikan sesi' : 'Berikutnya'

  function advance() {
    if (revealed) {
      setIndex(index + 1); setSelected([]); setRevealed(false); setPanel(null); setExpanded(false)
      questionPane.current?.scrollTo({ top: 0 })
      window.scrollTo({ top: 0 })
    } else {
      setRevealed(true); setPanel('explanation'); setExpanded(false)
      if (correct) setScore(score + 1)
    }
  }
  function restart() { setIndex(0); setScore(0); setSelected([]); setRevealed(false); setPanel(null); setExpanded(false) }

  const explanation = !done && <section className="latih-explanation" aria-live="polite">
    <div className={cn('latih-answer-result', correct ? 'is-correct' : 'is-incorrect')}>
      {multipleChoice ? correct ? <Check aria-hidden="true" /> : <X aria-hidden="true" /> : <BookOpen aria-hidden="true" />}
      <h2>{!multipleChoice ? String(question.answer) : correct ? 'Benar, kamu sudah paham.' : 'Belum tepat'}</h2>
    </div>
    {multipleChoice && !correct && <div className="latih-correct-summary"><p>Jawaban yang benar: {String.fromCharCode(65 + Number(question.answer))}</p><MarkdownContent text={question.options![Number(question.answer)]} interactive={false} /></div>}
    {multipleChoice ? <MarkdownContent text={question.explanation} /> : <p>{question.explanation}</p>}
  </section>
  const panelContent = panel === 'hint' && !done ? <MarkdownContent text={question.hint ?? ''} /> : explanation

  return <div className="latih-shell latih-study latih-quiz">
    <header className="latih-quiz-header">
      <Button variant="ghost" size="icon" aria-label="Kembali ke koleksi" onClick={onExit}><ArrowLeft /></Button>
      <div className="latih-quiz-title"><strong>{collection.title}</strong><span>{done ? 'Sesi selesai' : `${multipleChoice ? 'Soal' : 'Kartu'} ${index + 1} dari ${collection.questions.length}`}</span></div>
      <Badge variant="secondary">{collection.demo ? 'Contoh' : 'Pribadi'}</Badge>
    </header>
    {!saved && <p role="status">Progres belum tersimpan. Refresh dapat mengulang sesi ini.</p>}
    <progress className="latih-quiz-progress" aria-label="Progres latihan" value={done ? collection.questions.length : index + (revealed ? 1 : 0)} max={collection.questions.length} />
    {done ? <main className="latih-study-main"><section className="latih-study-question">
      <Check className="latih-complete-icon" aria-hidden="true" /><h1>Sesi selesai.</h1>
      <p>{multipleChoice ? `${score} dari ${collection.questions.length} jawaban benar.` : `${collection.questions.length} kartu sudah dipelajari.`}</p>
      <div className="flex flex-wrap gap-3"><Button onClick={restart}><RotateCcw data-icon="inline-start" />Ulangi latihan</Button><Button variant="outline" onClick={onExit}>Lihat koleksi</Button></div>
    </section></main> : <>
      <main className="latih-quiz-layout">
        <section className="latih-quiz-question-pane" ref={questionPane}>
          {multipleChoice ? <section aria-label="Teks soal" className="latih-question-content"><h1 className="sr-only">Soal {index + 1}</h1><MarkdownContent text={question.question} /></section> : <h1>{question.question}</h1>}
          {multipleChoice && <ToggleGroup aria-label="Pilih jawaban" value={selected} onValueChange={setSelected} orientation="vertical" variant="outline" className="latih-answers" disabled={revealed}>
            {question.options!.map((option, i) => {
              const isCorrect = revealed && i === question.answer
              const isWrong = revealed && selected[0] === String(i) && !isCorrect
              return <ToggleGroupItem key={i} value={String(i)} className={cn('latih-answer', isCorrect && 'is-correct', isWrong && 'is-incorrect')} render={<div />} nativeButton={false}>
                <span className="latih-answer-letter">{String.fromCharCode(65 + i)}</span>
                <MarkdownContent text={option} interactive={false} />
                {isCorrect ? <span className="latih-option-status"><Check aria-hidden="true" /><span className="sr-only">Jawaban benar</span></span> : isWrong ? <span className="latih-option-status"><X aria-hidden="true" /><span className="sr-only">Jawabanmu belum tepat</span></span> : selected[0] === String(i) ? <span className="latih-option-status"><Check aria-hidden="true" /><span className="sr-only">Dipilih</span></span> : null}
              </ToggleGroupItem>
            })}
          </ToggleGroup>}
        </section>
        {!mobile && <aside className="latih-quiz-panel" aria-label={panel === 'hint' ? 'Petunjuk' : 'Pembahasan'}>
          <h2 className="latih-quiz-panel-title">{panel === 'hint' ? <Lightbulb aria-hidden="true" /> : <BookOpen aria-hidden="true" />}{panel === 'hint' ? 'Petunjuk' : 'Pembahasan'}</h2>
          {panel === 'hint' || revealed ? panelContent : <p className="latih-subtle">Pembahasan muncul setelah jawaban diperiksa.</p>}
        </aside>}
      </main>
      <footer className="latih-quiz-actions">
        <div className="latih-quiz-secondary">
          {!revealed && question.hint?.trim() && <Button variant="outline" onClick={() => setPanel(panel === 'hint' && !mobile ? null : 'hint')}><Lightbulb data-icon="inline-start" />Petunjuk</Button>}
          {revealed && mobile && <Button variant="outline" onClick={() => setPanel('explanation')}><BookOpen data-icon="inline-start" />Pembahasan</Button>}
          {!revealed && multipleChoice && <span className="latih-subtle">{selected.length ? `Jawaban ${String.fromCharCode(65 + Number(selected[0]))} dipilih` : 'Pilih satu jawaban'}</span>}
        </div>
        <Button size="lg" disabled={!revealed && multipleChoice && !selected.length} onClick={advance}>{revealed ? nextLabel : multipleChoice ? 'Periksa jawaban' : 'Lihat jawaban'}<ArrowRight data-icon="inline-end" /></Button>
      </footer>
      {mobile && <Dialog open={panel !== null} onOpenChange={open => { if (!open) setPanel(null) }}>
        <DialogContent className="latih-quiz-sheet" data-expanded={expanded}>
          <DialogHeader><DialogTitle>{panel === 'hint' ? 'Petunjuk' : 'Pembahasan'}</DialogTitle></DialogHeader>
          <div className="latih-sheet-tools"><Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>{expanded ? <Minimize2 data-icon="inline-start" /> : <Maximize2 data-icon="inline-start" />}{expanded ? 'Ringkas' : 'Perluas'}</Button></div>
          <div className="latih-quiz-sheet-content">{panelContent}</div>
          <DialogFooter className="latih-quiz-sheet-footer"><Button variant="outline" onClick={() => setPanel(null)}>Kembali ke soal</Button>{revealed && <Button onClick={advance}>{nextLabel}<ArrowRight data-icon="inline-end" /></Button>}</DialogFooter>
        </DialogContent>
      </Dialog>}
    </>}
  </div>
}
