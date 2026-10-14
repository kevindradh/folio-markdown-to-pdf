import { parseCollection, type Collection } from './collections'

export type StudyProgress = {
  index: number
  selected: string[]
  revealed: boolean
  score: number
  panel: 'hint' | 'explanation' | null
  expanded: boolean
}
export type SavedStudy = { collection: Collection; progress: StudyProgress }
export const initialProgress: StudyProgress = { index: 0, selected: [], revealed: false, score: 0, panel: null, expanded: false }
const key = 'latih:active-study:v1'

export function readStudy(): SavedStudy | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.version !== 1) return null
    const collection = parseCollection(JSON.stringify(data.collection))
    const p = data.progress as StudyProgress
    if (!p || !Number.isInteger(p.index) || p.index < 0 || p.index > collection.questions.length || !Array.isArray(p.selected) || p.selected.length > 1 || typeof p.revealed !== 'boolean' || typeof p.expanded !== 'boolean' || ![null, 'hint', 'explanation'].includes(p.panel) || !Number.isInteger(p.score) || p.score < 0 || p.score > p.index + Number(p.revealed)) return null
    const question = collection.questions[p.index]
    if (p.selected.length && (!question || collection.type !== 'multiple-choice' || !question.options?.some((_, index) => String(index) === p.selected[0]))) return null
    if (question && collection.type === 'multiple-choice' && p.revealed && !p.selected.length) return null
    if (!question && (p.revealed || p.selected.length || p.panel)) return null
    if (p.panel === 'explanation' && !p.revealed || p.panel === 'hint' && (!question?.hint || p.revealed)) return null
    return { collection: { ...collection, demo: data.collection.demo === true }, progress: p }
  } catch { return null }
}

export function saveStudy(study: SavedStudy): boolean {
  try { sessionStorage.setItem(key, JSON.stringify({ version: 1, ...study })); return true } catch { return false }
}

export function clearStudy() {
  try { sessionStorage.removeItem(key) } catch { /* Storage unavailable: the quiz can still be exited. */ }
}
