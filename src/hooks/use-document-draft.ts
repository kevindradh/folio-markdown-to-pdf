import { useEffect, useRef, useState, type SetStateAction } from 'react'
import { readDraft, readRecovery, saveDraft, type Draft } from '@/lib/document-draft'
import * as storage from '@/lib/document-library'
import { toast } from '@/lib/toast'

export function useDocumentDraft(fallback: Draft) {
  const [draft, reactSetDraft] = useState(() => readDraft(fallback))
  const [library, setLibrary] = useState<storage.Library>({ projects: [], documents: [], activeId: '' })
  const [ready, setReady] = useState(false)
  const [available, setAvailable] = useState(false)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [historyTick, setHistoryTick] = useState(0)
  const initial = useRef(draft)
  const currentDraft = useRef(draft)
  const currentId = useRef('')
  const records = useRef(new Map<string, storage.LibraryDocument>())
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const blocked = useRef(false)
  const generation = useRef(0)
  const blank: Draft = { text: '', name: 'Dokumen baru', paper: 'A4', font: 'Literary', margin: 'Normal', codeTheme: 'light' }

  function adopt(value: storage.Library) {
    records.current = new Map(value.documents.map(document => [document.id, document]))
    const record = records.current.get(value.activeId)!
    currentId.current = value.activeId
    currentDraft.current = record.draft
    setLibrary(value); reactSetDraft(record.draft); setSaved(true); setError('')
    saveDraft(record.draft, { documentId: record.id, revision: record.revision, pending: false })
  }

  useEffect(() => {
    let active = true
    const recovery = readRecovery(initial.current)
    storage.loadLibrary(initial.current).then(async value => {
      if (!active) return
      const target = recovery && value.documents.find(document => document.id === recovery.documentId)
      if (target && target.revision === recovery.revision) {
        await storage.saveLibraryDocument(target.id, recovery.draft, target.revision)
        value = await storage.loadLibrary(initial.current)
      }
      if (active) { adopt(value); setAvailable(true); setReady(true) }
    }).catch(reason => {
      if (active) { setError(reason instanceof Error ? reason.message : 'Penyimpanan project tidak tersedia.'); setReady(true) }
    })
    return () => { active = false }
  }, [])

  function enqueue<T>(work: () => Promise<T>): Promise<T> {
    const result = queue.current.catch(() => {}).then(work)
    queue.current = result
    void result.catch(() => {})
    return result
  }

  async function persist(id: string, value: Draft) {
    const record = records.current.get(id)
    if (!record) throw new Error('Dokumen tidak ditemukan.')
    const next = await storage.saveLibraryDocument(id, value, record.revision)
    records.current.set(id, next)
    if (currentId.current === id) saveDraft(currentDraft.current, { documentId: id, revision: next.revision, pending: JSON.stringify(currentDraft.current) !== JSON.stringify(next.draft) })
    return next
  }

  useEffect(() => {
    if (!ready) return
    const id = library.activeId
    const token = ++generation.current
    const record = records.current.get(id)
    saveDraft(draft, record ? { documentId: id, revision: record.revision, pending: true } : undefined)
    if (!available) return
    void enqueue(() => persist(id, draft)).then(next => {
      if (token !== generation.current || currentId.current !== id) return
      setSaved(true); setError('')
      setLibrary(previous => ({ ...previous, documents: previous.documents.map(document => document.id === id ? next : document) }))
    }).catch(reason => {
      if (token === generation.current) { setSaved(false); setError(reason instanceof Error ? reason.message : 'Draft belum tersimpan.') }
    })
    // Persist each accepted edit independently of preview debounce.
  }, [draft, ready, available, library.activeId])

  useEffect(() => {
    if (!ready || !available) return
    const id = library.activeId
    const timer = window.setTimeout(() => {
      void enqueue(async () => {
        if (currentId.current !== id || blocked.current) return false
        await persist(id, currentDraft.current)
        return storage.saveVersion(id, 'automatic')
      }).then(added => { if (added) setHistoryTick(value => value + 1) }).catch(reason => setError(reason instanceof Error ? reason.message : 'Versi otomatis belum tersimpan.'))
    }, 15_000)
    return () => clearTimeout(timer)
  }, [draft, ready, available, library.activeId])

  function setDraft(action: SetStateAction<Draft>) {
    if (!ready || blocked.current) return
    const next = typeof action === 'function' ? action(currentDraft.current) : action
    if (next === currentDraft.current) return
    currentDraft.current = next
    const record = records.current.get(currentId.current)
    saveDraft(next, record ? { documentId: record.id, revision: record.revision, pending: true } : undefined)
    setSaved(false)
    reactSetDraft(next)
  }
  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft(previous => ({ ...previous, [key]: value })) }

  async function action<T>(work: () => Promise<T>): Promise<T | undefined> {
    if (!available || blocked.current) return
    blocked.current = true; setBusy(true)
    try {
      await queue.current.catch(() => {})
      await persist(currentId.current, currentDraft.current)
      const result = await work()
      adopt(await storage.loadLibrary(initial.current))
      setHistoryTick(value => value + 1)
      return result
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Perubahan tidak dapat disimpan.'
      setError(message)
      toast.add({ title: 'Perubahan belum diterapkan.', description: message, type: 'error' })
      return undefined
    } finally { blocked.current = false; setBusy(false) }
  }

  const activeDocument = library.documents.find(document => document.id === library.activeId)
  return {
    draft, setDraft, update, saved, ready, available, busy, error, library, activeDocument, historyTick,
    openDocument: (id: string) => action(async () => {
      await storage.saveVersion(currentId.current, 'automatic')
      await storage.selectDocument(id); return true
    }),
    newDocument: (projectId: string, value = blank) => action(async () => {
      await storage.saveVersion(currentId.current, 'automatic')
      return storage.createDocument(projectId, value)
    }),
    newProject: (name: string) => action(() => storage.createProject(name)),
    renameProject: (id: string, name: string) => action(async () => { await storage.renameProject(id, name); return true }),
    moveDocument: (id: string, projectId: string) => action(async () => { await storage.moveDocument(id, projectId); return true }),
    deleteDocument: (id: string) => action(async () => { await storage.deleteDocument(id, blank); return true }),
    deleteProject: (id: string) => action(async () => { await storage.deleteProject(id); return true }),
    saveVersion: () => action(async () => { await storage.saveVersion(currentId.current, 'manual'); return true }),
    restoreVersion: (versionId: string) => action(async () => {
      const id = currentId.current
      await storage.restoreVersion(id, versionId, records.current.get(id)!.revision); return true
    }),
    versions: () => storage.listVersions(currentId.current),
  }
}

export type DocumentLibraryController = ReturnType<typeof useDocumentDraft>
