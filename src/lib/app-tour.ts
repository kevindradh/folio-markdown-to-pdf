import { DRAFT_KEY } from '@/lib/document-draft'

export const TOUR_KEY = 'folio:tour:v1'

export function isFirstVisit() {
  try { return !localStorage.getItem(TOUR_KEY) && !localStorage.getItem(DRAFT_KEY) }
  catch { return false }
}

export function rememberTour() {
  try { localStorage.setItem(TOUR_KEY, 'done') }
  catch { /* The tour can still close when browser storage is unavailable. */ }
}
