import { useEffect, useRef, useState } from 'react'
import { readImages, storeImage, type ImageRecord } from '@/lib/local-images'
import type { LocalImages } from '@/lib/image-references'

export function useLocalImages() {
  const [images, setImages] = useState<LocalImages>({})
  const [loading, setLoading] = useState(true)
  const urls = useRef(new Set<string>())
  function register(record: ImageRecord) {
    const url = URL.createObjectURL(new Blob([record.data], { type: record.type }))
    urls.current.add(url)
    const image = { url, name: record.name }
    setImages(previous => ({ ...previous, [`folio-image:${record.id}`]: image, [record.name]: image }))
  }
  useEffect(() => {
    let cancelled = false
    const activeUrls = urls.current
    void readImages().then(records => { if (!cancelled) records.forEach(register) }).catch(() => {
      // Missing assets remain visible as placeholders; normal Markdown editing still works.
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => {
      cancelled = true
      activeUrls.forEach(url => URL.revokeObjectURL(url))
      activeUrls.clear()
    }
  }, [])
  async function addImage(file: File) {
    const record = await storeImage(file)
    register(record)
    return `folio-image:${record.id}`
  }
  return { images, loading, addImage }
}
