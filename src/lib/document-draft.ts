export const MAX_DOCUMENT_BYTES = 100 * 1024
export const MAX_DOCUMENT_LINES = 5000
export const DRAFT_KEY = 'folio:draft:v1'

export type Draft = {
  text: string; name: string; paper: string; font: string; margin: string; codeTheme: string; inlineCodeTheme?: string
}

export function inputError(text: string): string | null {
  if (new TextEncoder().encode(text).byteLength > MAX_DOCUMENT_BYTES) return 'Dokumen maksimal 100 KiB. Pisahkan menjadi beberapa dokumen.'
  if (text.split('\n').length > MAX_DOCUMENT_LINES) return 'Dokumen maksimal 5.000 baris. Pisahkan menjadi beberapa dokumen.'
  return null
}

export function readDraft(fallback: Draft): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    // Check length before parsing untrusted or outdated browser storage.
    if (!raw || raw.length > MAX_DOCUMENT_BYTES * 6 + 4096) return fallback
    const value = JSON.parse(raw)
    if (value?.version !== 1 || typeof value.text !== 'string' || inputError(value.text)) return fallback
    return {
      text: value.text,
      name: typeof value.name === 'string' ? value.name.slice(0, 120) : fallback.name,
      paper: ['A4', 'Letter'].includes(value.paper) ? value.paper : fallback.paper,
      font: ['Literary', 'Modern'].includes(value.font) ? value.font : fallback.font,
      margin: ['Normal', 'Lebar', 'Tipis'].includes(value.margin) ? value.margin : fallback.margin,
      codeTheme: ['light', 'dark'].includes(value.codeTheme) ? value.codeTheme : fallback.codeTheme,
      inlineCodeTheme: ['light', 'dark'].includes(value.inlineCodeTheme) ? value.inlineCodeTheme
        : ['light', 'dark'].includes(value.codeTheme) ? value.codeTheme : fallback.inlineCodeTheme ?? fallback.codeTheme,
    }
  } catch {
    return fallback
  }
}

export function saveDraft(draft: Draft, recovery?: { documentId: string; revision: number; pending: boolean }): boolean {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, ...draft, recovery }))
    return true
  } catch {
    return false
  }
}

export function readRecovery(fallback: Draft) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw || raw.length > MAX_DOCUMENT_BYTES * 6 + 4096) return null
    const value = JSON.parse(raw)
    if (value.version !== 1 || typeof value.text !== 'string' || inputError(value.text) || value.recovery?.pending !== true
      || typeof value.recovery.documentId !== 'string' || !Number.isSafeInteger(value.recovery.revision)) return null
    return { draft: readDraft(fallback), documentId: value.recovery.documentId as string, revision: value.recovery.revision as number }
  } catch { return null }
}

export function markdownFilename(name: string): string {
  const safe = Array.from(name, char => char.charCodeAt(0) < 32 ? '-' : char).join('').replace(/[<>:"/\\|?*]/g, '-').replace(/[. ]+$/g, '').trim().slice(0, 120)
  return `${safe || 'Dokumen'}.md`
}
