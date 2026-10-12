import { createPortal } from 'react-dom'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

// Formula DOM contains duplicate accessible text and positioning elements. Treat it as
// one indivisible character so page splitting preserves the entire rendered formula.
function flowText(node: Node): string {
  if (node instanceof HTMLElement && node.dataset.math) return '\ufffc'
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  return Array.from(node.childNodes).map(flowText).join('')
}

/** Slice text while retaining every ancestor, including a single list item or emphasis. */
function sliceBlock(block: HTMLElement, start: number, end: number) {
  let offset = 0
  function copy(node: Node): Node | null {
    if (node instanceof HTMLElement && node.dataset.math) {
      const included = offset >= start && offset < end
      offset++
      return included ? node.cloneNode(true) : null
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ''
      const from = Math.max(0, start - offset)
      const to = Math.min(text.length, end - offset)
      offset += text.length
      return to > from ? document.createTextNode(text.slice(from, to)) : null
    }
    const clone = node.cloneNode(false)
    for (const child of node.childNodes) {
      const part = copy(child)
      if (part) clone.appendChild(part)
    }
    return clone.hasChildNodes() ? clone : null
  }
  const clone = (copy(block) ?? block.cloneNode(false)) as HTMLElement
  return clone
}

/** Lay out the same DOM that is later printed, at its unscaled physical size. */
function paginate(template: HTMLElement, host: HTMLElement) {
  host.replaceChildren()
  const blocks = Array.from(template.querySelector('.document-body')!.children).flatMap(node => {
    // Allow lists to continue on the next page without keeping the whole list together.
    if (node.tagName !== 'UL') return [node.cloneNode(true) as HTMLElement]
    return Array.from(node.children).map(item => {
      const list = node.cloneNode(false) as HTMLElement
      list.append(item.cloneNode(true))
      list.classList.add('list-fragment')
      return list
    })
  })
  const bodies: HTMLElement[] = []
  function newPage() {
    const wrapper = document.createElement('div')
    wrapper.className = 'paper-sheet'
    const page = template.cloneNode(true) as HTMLElement
    page.removeAttribute('aria-hidden')
    page.classList.remove('paper-template')
    page.setAttribute('aria-label', `Halaman ${bodies.length + 1}`)
    const body = page.querySelector<HTMLElement>('.document-body')!
    body.replaceChildren()
    wrapper.append(page)
    host.append(wrapper)
    bodies.push(body)
    return body
  }
  let body = newPage()
  // A small reserve accommodates subpixel rounding in the browser's print pipeline.
  const fits = () => body.scrollHeight <= body.clientHeight
  for (let index = 0; index < blocks.length; index++) {
    let block = blocks[index]
    body.append(block)
    if (block.classList.contains('math-block')) {
      const ratio = Math.min(1, body.clientWidth / Math.max(1, block.scrollWidth), (body.clientHeight - 2) / Math.max(1, block.offsetHeight))
      if (ratio < 1) block.style.fontSize = `${parseFloat(getComputedStyle(block).fontSize) * ratio * .98}px`
    }
    // Keep a heading with at least the first two lines of the next block.
    if (/^H[1-3]$/.test(block.tagName) && blocks[index + 1]) {
      const reserve = document.createElement('div')
      reserve.style.height = '40px'
      body.append(reserve)
      const headingFits = fits()
      reserve.remove()
      if (!headingFits && body.children.length > 1) {
        block.remove()
        body = newPage()
        body.append(block)
      }
    }
    if (fits()) continue
    block.remove()
    // Prefer moving a complete block before splitting it.
    if (body.children.length) {
      const heading = body.lastElementChild
      const carryHeading = heading && /^H[1-3]$/.test(heading.tagName) ? heading : null
      carryHeading?.remove()
      if (body.children.length) body = newPage()
      if (carryHeading) body.append(carryHeading)
      body.append(block)
      if (fits()) continue
      block.remove()
    }
    // An oversized display formula must shrink as a whole, never slice its layout DOM.
    if (block.classList.contains('math-block')) {
      body.append(block)
      for (let attempt = 0; !fits() && attempt < 20; attempt++) {
        block.style.fontSize = `${parseFloat(getComputedStyle(block).fontSize) * .85}px`
      }
      continue
    }
    while (flowText(block).length) {
      const content = flowText(block)
      const length = content.length
      let low = 0
      let high = length
      while (low < high) {
        const mid = Math.ceil((low + high) / 2)
        const candidate = sliceBlock(block, 0, mid)
        body.append(candidate)
        const ok = fits()
        candidate.remove()
        if (ok) low = mid
        else high = mid - 1
      }
      // Move the break to a word boundary where possible, preserving all whitespace.
      let cut = Math.max(1, low)
      if (cut < length) {
        const prefix = content.slice(0, cut)
        const boundary = prefix.search(/\s+\S*$/)
        if (boundary > cut / 2) cut = boundary + 1
      }
      const fragment = sliceBlock(block, 0, cut)
      body.append(fragment)
      if (cut === length) break
      block = sliceBlock(block, cut, length)
      block.classList.add('continued-block')
      body = newPage()
    }
  }
  host.querySelectorAll('.paper-page-number').forEach((node, index) => {
    node.textContent = `${index + 1} / ${bodies.length}`
  })
  return bodies.length
}

export function PaginatedDocument({ children, name, paper, font, margin, zoom, onPagesChange }: {
  children: ReactNode; name: string; paper: string; font: string; margin: string; zoom: number
  onPagesChange: (pages: number) => void
}) {
  const template = useRef<HTMLElement>(null)
  const measurement = useRef<HTMLDivElement>(null)
  const pages = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const layout = () => {
      if (cancelled || !template.current || !measurement.current || !pages.current) return
      const count = paginate(template.current, measurement.current)
      pages.current.replaceChildren(...Array.from(measurement.current.children))
      onPagesChange(count)
    }
    // React owns the source only. The paginated output consists of safe DOM clones.
    const frame = requestAnimationFrame(layout)
    void document.fonts.ready.then(layout)
    document.fonts.addEventListener('loadingdone', layout)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      document.fonts.removeEventListener('loadingdone', layout)
    }
  }, [children, name, paper, font, margin, onPagesChange])

  useEffect(() => {
    const element = stage.current
    if (!element) return
    const resize = () => {
      const width = paper === 'A4' ? 210 : 215.9
      const available = element.clientWidth - parseFloat(getComputedStyle(element).paddingLeft) - parseFloat(getComputedStyle(element).paddingRight)
      const scale = Math.min(1, Math.max(0.1, available / (width * 96 / 25.4))) * zoom / 100
      element.style.setProperty('--page-scale', String(scale))
    }
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    resize()
    return () => observer.disconnect()
  }, [paper, zoom])

  return <div ref={stage} className="paper-stage" style={{ '--paper-width': paper === 'A4' ? '210mm' : '215.9mm', '--paper-height': paper === 'A4' ? '297mm' : '279.4mm' } as CSSProperties}>
    {createPortal(<div className="paper-measurement" aria-hidden="true" style={{ '--paper-width': paper === 'A4' ? '210mm' : '215.9mm', '--paper-height': paper === 'A4' ? '297mm' : '279.4mm' } as CSSProperties}>
      <article ref={template} className={`paper paper-template font-${font.toLowerCase()} margin-${margin.toLowerCase()}`}>
        <header className="paper-topline">{name || 'Tanpa judul'}</header>
        <div className="document-body">{children}</div>
        <footer className="paper-footer"><span>Dibuat dengan folio</span><span className="paper-page-number" /></footer>
      </article>
      <div ref={measurement} />
    </div>, document.body)}
    <div ref={pages} className="paper-pages" />
  </div>
}
