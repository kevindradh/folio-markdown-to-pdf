import { parseCollection, type Collection } from './collections'

const databaseName = 'latih-library'
const storeName = 'collections'
type StoredCollection = { id: string; createdAt: number; collection: Collection }

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let blocked = false
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: 'id' })
    request.onerror = () => reject(request.error)
    request.onblocked = () => {
      blocked = true
      reject(new Error('Penyimpanan sedang digunakan tab lain. Tutup tab latih lain lalu muat ulang.'))
    }
    request.onsuccess = () => {
      const db = request.result
      if (blocked) { db.close(); return }
      db.onversionchange = () => db.close()
      resolve(db)
    }
  })
}

export async function loadCollections(): Promise<Collection[]> {
  const db = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const request = transaction.objectStore(storeName).getAll()
      transaction.onabort = () => reject(transaction.error ?? new Error('Koleksi tidak dapat dibaca.'))
      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => {
        try {
          const records = request.result as StoredCollection[]
          resolve(records.sort((a, b) => b.createdAt - a.createdAt).map(record => ({ ...parseCollection(JSON.stringify(record.collection)), id: record.id })))
        } catch { reject(new Error('Data koleksi lokal tidak dapat dibaca. Data asli tetap dipertahankan.')) }
      }
    })
  } finally { db.close() }
}

export async function saveCollection(collection: Collection): Promise<Collection> {
  const id = crypto.randomUUID()
  const db = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      transaction.oncomplete = () => resolve()
      transaction.onabort = () => reject(transaction.error ?? new Error('Koleksi gagal disimpan.'))
      transaction.onerror = () => reject(transaction.error)
      transaction.objectStore(storeName).add({ id, createdAt: Date.now(), collection } satisfies StoredCollection)
    })
    return { ...collection, id }
  } finally { db.close() }
}
