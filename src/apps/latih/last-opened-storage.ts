import { storedCollection, type Collection } from './collections'

const key = 'latih:last-opened:v1'

export function readLastOpened(): Collection | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.version !== 1) return null
    const collection = storedCollection(data.collection)
    return { ...collection, demo: data.collection.demo === true }
  } catch { return null }
}

export function saveLastOpened(collection: Collection) {
  try { localStorage.setItem(key, JSON.stringify({ version: 1, collection })) } catch { /* Opening a collection remains possible when storage is unavailable. */ }
}
