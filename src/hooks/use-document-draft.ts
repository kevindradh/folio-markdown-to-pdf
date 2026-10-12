import { useEffect, useState } from 'react'
import { readDraft, saveDraft, type Draft } from '@/lib/document-draft'

export function useDocumentDraft(fallback: Draft) {
  const [draft, setDraft] = useState(() => readDraft(fallback))
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    const persist = () => setSaved(saveDraft(draft))
    // Persist accepted edits immediately after commit, independent of preview debounce.
    persist()
    window.addEventListener('pagehide', persist)
    document.addEventListener('visibilitychange', persist)
    return () => {
      window.removeEventListener('pagehide', persist)
      document.removeEventListener('visibilitychange', persist)
    }
  }, [draft])
  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft(previous => ({ ...previous, [key]: value }))
  }
  return { draft, update, setDraft, saved }
}
