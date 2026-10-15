import { createId } from './create-id'
export type ImageRecord = { id: string; name: string; data: ArrayBuffer; type: string; createdAt: number }
const MAX_IMAGE = 2 * 1024 * 1024
const MAX_TOTAL = 10 * 1024 * 1024

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('folio-images', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('images', { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Penyimpanan gambar tidak tersedia.'))
    request.onblocked = () => reject(new Error('Tutup tab folio lainnya, lalu coba kembali.'))
  })
}

export async function readImages(): Promise<ImageRecord[]> {
  const db = await database()
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('images').objectStore('images').getAll()
      request.onsuccess = () => resolve((request.result as ImageRecord[]).sort((a, b) => a.createdAt - b.createdAt))
      request.onerror = () => reject(new Error('Gambar tersimpan tidak dapat dibaca.'))
    })
  } finally { db.close() }
}

export async function storeImage(file: File): Promise<ImageRecord> {
  if (file.size > MAX_IMAGE) throw new Error('Gambar maksimal 2 MiB.')
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const valid = (file.type === 'image/png' && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte)) ||
    (file.type === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
    (file.type === 'image/webp' && new TextDecoder().decode(bytes).startsWith('RIFF') && new TextDecoder().decode(bytes).slice(8) === 'WEBP')
  if (!valid) throw new Error('Pilih gambar PNG, JPEG, atau WebP yang valid.')
  const url = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image()
      image.onload = () => image.naturalWidth <= 4096 && image.naturalHeight <= 4096
        ? resolve() : reject(new Error('Dimensi gambar maksimal 4.096 × 4.096 piksel.'))
      image.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'))
      image.src = url
    })
  } finally { URL.revokeObjectURL(url) }
  const db = await database()
  // ArrayBuffer survives IndexedDB structured cloning consistently, including WebKit.
  const record: ImageRecord = { id: createId(), name: file.name, data: await file.arrayBuffer(), type: file.type, createdAt: Date.now() }
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('images', 'readwrite')
      const store = transaction.objectStore('images')
      const request = store.getAll()
      request.onsuccess = () => {
        const total = (request.result as ImageRecord[]).reduce((sum, image) => sum + image.data.byteLength, 0)
        if (total + file.size > MAX_TOTAL) { transaction.abort(); return }
        store.put(record)
      }
      transaction.oncomplete = () => resolve()
      transaction.onabort = () => reject(new Error('Gambar belum tersimpan. Batas penyimpanan lokal 10 MiB atau ruang browser tidak tersedia.'))
      transaction.onerror = () => reject(new Error('Gambar tidak dapat disimpan di browser.'))
    })
    return record
  } finally { db.close() }
}
