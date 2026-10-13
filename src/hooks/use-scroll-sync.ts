import { useEffect, useState, type RefObject } from 'react'

const preferenceKey = 'folio:scroll-sync:v1'
type Point = [number, number]

function interpolate(points: Point[], value: number, axis: 0 | 1) {
  const other = axis === 0 ? 1 : 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i]
    if (value <= b[axis]) {
      const ratio = Math.max(0, Math.min(1, (value - a[axis]) / Math.max(1, b[axis] - a[axis])))
      return a[other] + ratio * (b[other] - a[other])
    }
  }
  return points.at(-1)?.[other] ?? 0
}

/** Match source blocks, rather than scroll percentages: paper margins and page breaks differ. */
export function useScrollSync(editorRef: RefObject<HTMLTextAreaElement | null>, previewRef: RefObject<HTMLDivElement | null>, text: string, ready: boolean, split: boolean) {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(preferenceKey) === 'on' } catch { return false }
  })
  useEffect(() => {
    try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off') } catch { /* Preference is optional. */ }
  }, [enabled])

  useEffect(() => {
    const editor = editorRef.current, preview = previewRef.current
    if (!editor || !preview || !enabled || !split || !ready) return
    let frame = 0
    let dirty = true
    let points: Point[] = []
    let follower: HTMLElement | null = null
    let expected = 0
    let leader: HTMLElement = editor
    const mirror = document.createElement('div')
    mirror.setAttribute('aria-hidden', 'true')
    mirror.className = 'scroll-sync-measurement'
    mirror.style.cssText = 'position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;white-space:pre-wrap;overflow-wrap:break-word;'
    document.body.append(mirror)

    const measure = () => {
      const style = getComputedStyle(editor)
      for (const property of ['font', 'line-height', 'letter-spacing', 'tab-size', 'padding', 'word-break', 'overflow-wrap']) {
        mirror.style.setProperty(property, style.getPropertyValue(property))
      }
      mirror.style.width = `${editor.clientWidth}px`
      mirror.style.boxSizing = 'border-box'
      const lines = text.split('\n')
      const spans = lines.map(line => {
        const span = document.createElement('span')
        span.textContent = `${line || '\u200b'}\n`
        return span
      })
      mirror.replaceChildren(...spans)
      const origin = mirror.getBoundingClientRect().top
      const y = spans.map(span => span.getClientRects()[0].top - origin)
      y.push(mirror.offsetHeight - parseFloat(style.paddingBottom))
      const top = preview.getBoundingClientRect().top + preview.clientTop
      const nodes = Array.from(preview.querySelectorAll<HTMLElement>('.paper-pages [data-source-start]'))
        .filter(node => !node.querySelector('[data-source-start]') && !node.closest('thead'))
      const groups = new Map<string, HTMLElement[]>()
      for (const node of nodes) {
        const key = `${node.dataset.sourceStart}:${node.dataset.sourceEnd}`
        groups.set(key, [...(groups.get(key) ?? []), node])
      }
      const candidates: Point[] = [[0, 0]]
      for (const fragments of groups.values()) {
        const start = Number(fragments[0].dataset.sourceStart), end = Number(fragments[0].dataset.sourceEnd)
        if (y[start] === undefined || y[end] === undefined) continue
        const weights = fragments.map(node => Math.max(1, node.textContent?.length ?? 0))
        const total = weights.reduce((a, b) => a + b, 0)
        let offset = 0
        fragments.forEach((node, i) => {
          const rect = node.getBoundingClientRect()
          const from = y[start] + (y[end] - y[start]) * offset / total
          offset += weights[i]
          const to = y[start] + (y[end] - y[start]) * offset / total
          candidates.push([from, rect.top - top + preview.scrollTop], [to, rect.bottom - top + preview.scrollTop])
        })
      }
      // Footnotes and repeated table headers can be rendered out of source order.
      points = []
      for (const point of candidates.sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
        const last = points.at(-1)
        // Two preview positions at the same source boundary keep page gaps out of the block.
        if (!last || (point[0] >= last[0] && point[1] >= last[1] && (point[0] > last[0] || point[1] > last[1]))) points.push(point)
      }
      dirty = false
    }
    const sync = () => {
      frame = 0
      if (!editor.clientHeight || !preview.clientHeight) return
      if (dirty) measure()
      const from = leader, to = from === editor ? preview : editor
      const max = from.scrollHeight - from.clientHeight
      const targetMax = to.scrollHeight - to.clientHeight
      const target = from.scrollTop <= 1 ? 0 : max > 0 && from.scrollTop >= max - 1 ? targetMax
        : interpolate(points, from.scrollTop, from === editor ? 0 : 1)
      follower = to
      to.scrollTop = Math.max(0, Math.min(targetMax, target))
      expected = to.scrollTop
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync) }
    const scroll = (event: Event) => {
      const element = event.currentTarget as HTMLElement
      if (element === follower && Math.abs(element.scrollTop - expected) < 2) return
      leader = element
      follower = null
      schedule()
    }
    const takeControl = (event: Event) => { leader = event.currentTarget as HTMLElement; follower = null }
    const invalidate = () => { dirty = true; leader = editor; follower = null; schedule() }
    const resize = new ResizeObserver(invalidate)
    resize.observe(editor); resize.observe(preview)
    const mutation = new MutationObserver(invalidate)
    mutation.observe(preview, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] })
    for (const element of [editor, preview]) {
      element.addEventListener('scroll', scroll, { passive: true })
      for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) element.addEventListener(event, takeControl, { passive: true })
    }
    document.fonts.addEventListener('loadingdone', invalidate)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect(); mutation.disconnect(); mirror.remove()
      document.fonts.removeEventListener('loadingdone', invalidate)
      for (const element of [editor, preview]) {
        element.removeEventListener('scroll', scroll)
        for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) element.removeEventListener(event, takeControl)
      }
    }
  }, [editorRef, previewRef, text, ready, split, enabled])
  return { enabled, setEnabled }
}
