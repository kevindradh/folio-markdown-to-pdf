import { createId } from '../../lib/create-id'
export const completedKey = 'latih:guide-completed:v1'
export function hasReadGuide() {
  try { return localStorage.getItem(completedKey) === 'true' } catch { return false }
}

const identityKey = 'latih:guide-identity:v1'
const elapsedKey = 'latih:guide-elapsed:v1'
export const guideDuration = 60_000
export type GuideProgress = { identity: string | null; elapsed: number }

export function readGuideProgress(): GuideProgress {
  try {
    let identity = localStorage.getItem(identityKey)
    if (!identity) {
      identity = createId()
      localStorage.setItem(identityKey, identity)
    }
    const record = JSON.parse(sessionStorage.getItem(elapsedKey) ?? 'null')
    const elapsed = record?.identity === identity && Number.isFinite(record.elapsed) && record.elapsed >= 0 ? Math.min(guideDuration, record.elapsed) : 0
    return { identity, elapsed }
  } catch { return { identity: null, elapsed: 0 } }
}

export function storeGuideProgress(progress: GuideProgress): GuideProgress {
  try {
    // A data reset invalidates time from the previous visit, including in the open tab.
    if (progress.identity && localStorage.getItem(identityKey) !== progress.identity) return readGuideProgress()
    if (progress.identity) sessionStorage.setItem(elapsedKey, JSON.stringify(progress))
  } catch { /* Keep counting in memory if browser storage is unavailable. */ }
  return progress
}

export function finishGuide() {
  try { localStorage.setItem(completedKey, 'true') } catch { /* Keep the current app session usable. */ }
  try { sessionStorage.removeItem(elapsedKey) } catch { /* No persisted timer to clean up. */ }
}
