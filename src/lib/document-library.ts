import { inputError, type Draft } from './document-draft'

export const LIBRARY_DB = 'folio-library'
export const MAX_PROJECTS = 20
export const MAX_DOCUMENTS = 100
export const MAX_VERSIONS = 20
export const MAX_LIBRARY_BYTES = 20 * 1024 * 1024
export type Project = { id: string; name: string; createdAt: number }
export type LibraryDocument = { id: string; projectId: string; draft: Draft; createdAt: number; updatedAt: number; revision: number }
export type DocumentVersion = { id: string; documentId: string; draft: Draft; createdAt: number; kind: 'automatic' | 'manual' | 'before-restore'; bytes: number }
type Meta = { key: 'library'; activeId: string; bytes: number }
export type Library = { projects: Project[]; documents: LibraryDocument[]; activeId: string }
const bytes = (draft: Draft) => new TextEncoder().encode(JSON.stringify(draft)).byteLength
const same = (left: Draft, right: Draft) => JSON.stringify(left) === JSON.stringify(right)
const get = <T>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(LIBRARY_DB, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore('projects', { keyPath: 'id' })
      db.createObjectStore('documents', { keyPath: 'id' })
      const versions = db.createObjectStore('versions', { keyPath: 'id' })
      versions.createIndex('document', ['documentId', 'createdAt'])
      versions.createIndex('time', 'createdAt')
      db.createObjectStore('meta', { keyPath: 'key' })
    }
    let blocked = false
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return }
      request.result.onversionchange = () => request.result.close(); resolve(request.result)
    }
    request.onerror = () => reject(new Error('Penyimpanan project tidak tersedia. Unduh .md untuk menyimpan tulisan.'))
    request.onblocked = () => { blocked = true; reject(new Error('Tutup tab folio lainnya, lalu muat ulang.')) }
  })
}

async function transaction<T>(mode: IDBTransactionMode, work: (tx: IDBTransaction) => Promise<T>): Promise<T> {
  const db = await database()
  const tx = db.transaction(['projects', 'documents', 'versions', 'meta'], mode)
  const done = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error ?? new Error('Penyimpanan tidak berhasil. Unduh .md sebelum menutup halaman.'))
    tx.onerror = () => { /* Abort reports the final transaction error. */ }
  })
  // Work can reject before the transaction's abort event fires.
  void done.catch(() => {})
  try { const result = await work(tx); await done; return result }
  catch (error) { try { tx.abort() } catch { /* Already complete. */ } throw error }
  finally { db.close() }
}

function validate(draft: Draft) {
  if (!draft || typeof draft.text !== 'string' || typeof draft.name !== 'string' || draft.name.length > 120 || inputError(draft.text)
    || !['A4', 'Letter'].includes(draft.paper) || !['Literary', 'Modern'].includes(draft.font)
    || !['Normal', 'Lebar', 'Tipis'].includes(draft.margin) || !['light', 'dark'].includes(draft.codeTheme)
    || draft.inlineCodeTheme !== undefined && !['light', 'dark'].includes(draft.inlineCodeTheme)) {
    throw new Error('Dokumen tidak valid atau melewati batas ukuran.')
  }
}

async function meta(tx: IDBTransaction): Promise<Meta> {
  const value = await get<Meta>(tx.objectStore('meta').get('library'))
  if (!value || !Number.isFinite(value.bytes)) throw new Error('Data project tidak dapat dibaca. Simpan salinan .md sebelum memperbaiki data browser.')
  return value
}

async function makeRoom(tx: IDBTransaction, info: Meta, delta: number) {
  if (info.bytes + delta <= MAX_LIBRARY_BYTES) { info.bytes += delta; return }
  // Trim oldest history globally before ever discarding a current document.
  let cursor = await get(tx.objectStore('versions').index('time').openCursor())
  while (info.bytes + delta > MAX_LIBRARY_BYTES && cursor) {
    info.bytes -= (cursor.value as DocumentVersion).bytes
    await get(cursor.delete())
    const request = cursor.request
    cursor.continue()
    cursor = await get(request)
  }
  if (info.bytes + delta > MAX_LIBRARY_BYTES) throw new Error('Penyimpanan project penuh. Unduh dan hapus dokumen yang tidak diperlukan.')
  info.bytes += delta
}

async function checkpoint(tx: IDBTransaction, document: LibraryDocument, kind: DocumentVersion['kind'], info: Meta) {
  const store = tx.objectStore('versions')
  const range = IDBKeyRange.bound([document.id, 0], [document.id, Number.MAX_SAFE_INTEGER])
  const latest = await get(store.index('document').openCursor(range, 'prev'))
  if (latest && same((latest.value as DocumentVersion).draft, document.draft)) {
    if (kind === 'manual' && latest.value.kind !== 'manual') {
      await get(latest.update({ ...latest.value, kind: 'manual' })); return true
    }
    return false
  }
  const list = await get<DocumentVersion[]>(store.index('document').getAll(range))
  for (const old of list.slice(0, Math.max(0, list.length - MAX_VERSIONS + 1))) {
    await get(store.delete(old.id)); info.bytes -= old.bytes
  }
  const size = bytes(document.draft)
  await makeRoom(tx, info, size)
  const version: DocumentVersion = { id: crypto.randomUUID(), documentId: document.id, draft: document.draft,
    createdAt: Math.max(Date.now(), (latest?.value.createdAt ?? 0) + 1), kind, bytes: size }
  await get(store.put(version))
  return true
}

export async function loadLibrary(fallback: Draft): Promise<Library> {
  return transaction('readwrite', async tx => {
    const projects = await get<Project[]>(tx.objectStore('projects').getAll())
    const documents = await get<LibraryDocument[]>(tx.objectStore('documents').getAll())
    if (!projects.length && !documents.length) {
      validate(fallback)
      const now = Date.now()
      const project: Project = { id: crypto.randomUUID(), name: 'Umum', createdAt: now }
      const document: LibraryDocument = { id: crypto.randomUUID(), projectId: project.id, draft: fallback, createdAt: now, updatedAt: now, revision: 0 }
      const info: Meta = { key: 'library', activeId: document.id, bytes: bytes(fallback) }
      await get(tx.objectStore('projects').put(project))
      await get(tx.objectStore('documents').put(document))
      await checkpoint(tx, document, 'automatic', info)
      await get(tx.objectStore('meta').put(info))
      return { projects: [project], documents: [document], activeId: document.id }
    }
    if (!projects.length || !documents.length || projects.length > MAX_PROJECTS || documents.length > MAX_DOCUMENTS) throw new Error('Data project tidak dapat dibaca.')
    for (const document of documents) {
      validate(document.draft)
      if (!projects.some(project => project.id === document.projectId)) throw new Error('Project dokumen tidak ditemukan.')
    }
    const info = await meta(tx)
    return { projects, documents, activeId: documents.some(document => document.id === info.activeId) ? info.activeId : documents[0].id }
  })
}

export async function saveLibraryDocument(id: string, draft: Draft, expectedRevision: number) {
  validate(draft)
  return transaction('readwrite', async tx => {
    const store = tx.objectStore('documents')
    const old = await get<LibraryDocument>(store.get(id))
    if (!old || old.revision !== expectedRevision) throw new Error('Dokumen berubah di tab lain. Unduh tulisan saat ini, lalu muat ulang sebelum melanjutkan.')
    if (same(old.draft, draft)) return old
    const info = await meta(tx)
    await makeRoom(tx, info, bytes(draft) - bytes(old.draft))
    const next = { ...old, draft, updatedAt: Date.now(), revision: old.revision + 1 }
    await get(store.put(next))
    await get(tx.objectStore('meta').put(info))
    return next
  })
}

export async function saveVersion(id: string, kind: DocumentVersion['kind']) {
  return transaction('readwrite', async tx => {
    const document = await get<LibraryDocument>(tx.objectStore('documents').get(id))
    if (!document) throw new Error('Dokumen tidak ditemukan.')
    const info = await meta(tx)
    const added = await checkpoint(tx, document, kind, info)
    await get(tx.objectStore('meta').put(info))
    return added
  })
}

export async function listVersions(id: string) {
  return transaction('readonly', async tx => {
    const list = await get<DocumentVersion[]>(tx.objectStore('versions').index('document').getAll(IDBKeyRange.bound([id, 0], [id, Number.MAX_SAFE_INTEGER])))
    for (const version of list) validate(version.draft)
    return list.sort((a, b) => b.createdAt - a.createdAt)
  })
}

export async function selectDocument(id: string) {
  return transaction('readwrite', async tx => {
    if (!await get(tx.objectStore('documents').get(id))) throw new Error('Dokumen tidak ditemukan.')
    const info = await meta(tx); info.activeId = id
    await get(tx.objectStore('meta').put(info))
  })
}

export async function createProject(name: string) {
  return transaction('readwrite', async tx => {
    if (await get(tx.objectStore('projects').count()) >= MAX_PROJECTS) throw new Error('Maksimal 20 project.')
    const project: Project = { id: crypto.randomUUID(), name: name.trim().slice(0, 120) || 'Project baru', createdAt: Date.now() }
    await get(tx.objectStore('projects').add(project)); return project
  })
}

export async function renameProject(id: string, name: string) {
  return transaction('readwrite', async tx => {
    const store = tx.objectStore('projects'); const project = await get<Project>(store.get(id))
    if (!project) throw new Error('Project tidak ditemukan.')
    await get(store.put({ ...project, name: name.trim().slice(0, 120) || 'Project tanpa nama' }))
  })
}

export async function createDocument(projectId: string, draft: Draft) {
  validate(draft)
  return transaction('readwrite', async tx => {
    if (!await get(tx.objectStore('projects').get(projectId))) throw new Error('Project tidak ditemukan.')
    if (await get(tx.objectStore('documents').count()) >= MAX_DOCUMENTS) throw new Error('Maksimal 100 dokumen. Unduh dokumen sebelum menghapus yang tidak diperlukan.')
    const now = Date.now()
    const document: LibraryDocument = { id: crypto.randomUUID(), projectId, draft, createdAt: now, updatedAt: now, revision: 0 }
    const info = await meta(tx)
    await makeRoom(tx, info, bytes(draft))
    await get(tx.objectStore('documents').add(document))
    await checkpoint(tx, document, 'automatic', info)
    info.activeId = document.id
    await get(tx.objectStore('meta').put(info)); return document
  })
}

export async function moveDocument(id: string, projectId: string) {
  return transaction('readwrite', async tx => {
    if (!await get(tx.objectStore('projects').get(projectId))) throw new Error('Project tidak ditemukan.')
    const store = tx.objectStore('documents'); const document = await get<LibraryDocument>(store.get(id))
    if (!document) throw new Error('Dokumen tidak ditemukan.')
    await get(store.put({ ...document, projectId, revision: document.revision + 1 }))
  })
}

export async function deleteProject(id: string) {
  return transaction('readwrite', async tx => {
    const projects = tx.objectStore('projects')
    if (await get(projects.count()) <= 1) throw new Error('Sisakan setidaknya satu project.')
    const documents = await get<LibraryDocument[]>(tx.objectStore('documents').getAll())
    if (documents.some(document => document.projectId === id)) throw new Error('Project masih berisi dokumen. Pindahkan atau hapus dokumennya terlebih dahulu.')
    await get(projects.delete(id))
  })
}

export async function deleteDocument(id: string, empty: Draft) {
  return transaction('readwrite', async tx => {
    const store = tx.objectStore('documents'); const document = await get<LibraryDocument>(store.get(id))
    if (!document) throw new Error('Dokumen tidak ditemukan.')
    const info = await meta(tx)
    const versions = await get<DocumentVersion[]>(tx.objectStore('versions').index('document').getAll(IDBKeyRange.bound([id, 0], [id, Number.MAX_SAFE_INTEGER])))
    for (const version of versions) await get(tx.objectStore('versions').delete(version.id))
    info.bytes -= bytes(document.draft) + versions.reduce((total, version) => total + version.bytes, 0)
    await get(store.delete(id))
    const remaining = await get<LibraryDocument[]>(store.getAll())
    if (!remaining.length) {
      const replacement = { ...document, id: crypto.randomUUID(), draft: empty, createdAt: Date.now(), updatedAt: Date.now(), revision: 0 }
      await get(store.add(replacement)); remaining.push(replacement); info.bytes += bytes(empty)
      await checkpoint(tx, replacement, 'automatic', info)
    }
    if (info.activeId === id) info.activeId = (remaining.find(item => item.projectId === document.projectId) ?? remaining[0]).id
    await get(tx.objectStore('meta').put(info))
  })
}

export async function restoreVersion(documentId: string, versionId: string, expectedRevision: number) {
  return transaction('readwrite', async tx => {
    const documents = tx.objectStore('documents')
    const document = await get<LibraryDocument>(documents.get(documentId))
    const version = await get<DocumentVersion>(tx.objectStore('versions').get(versionId))
    if (!document || document.revision !== expectedRevision || !version || version.documentId !== documentId) throw new Error('Versi atau dokumen berubah. Muat ulang riwayat dan coba kembali.')
    validate(version.draft)
    const info = await meta(tx)
    await checkpoint(tx, document, 'before-restore', info)
    await makeRoom(tx, info, bytes(version.draft) - bytes(document.draft))
    const restored = { ...document, draft: version.draft, revision: document.revision + 1, updatedAt: Date.now() }
    await get(documents.put(restored)); await get(tx.objectStore('meta').put(info)); return restored
  })
}
