import { Fragment, createElement, useMemo, type ReactNode } from 'react'
import { resolveImage, type MarkdownToken as Token, type LocalImages } from '@/lib/image-references'
import { markdownParser } from '@/lib/markdown-parser'
import { HighlightedCode } from '@/components/highlighted-code'
import { MathExpression } from '@/components/math-expression'
import { Separator } from '@/components/ui/separator'

function sourceLines(token: Token) {
  return token.map ? { 'data-source-start': token.map[0], 'data-source-end': token.map[1] } : {}
}

function render(tokens: Token[], images: LocalImages): ReactNode[] {
  let index = 0
  function children(): ReactNode[] {
    const output: ReactNode[] = []
    while (index < tokens.length) {
      const token = tokens[index++]
      const key = index
      if (token.nesting === -1) break
      if (token.nesting === 1) {
        const content = children()
        if (token.hidden) { output.push(<Fragment key={key}>{content}</Fragment>); continue }
        if (token.type === 'footnote_block_open') { output.push(<section key={key} className="footnotes" aria-label="Catatan kaki"><Separator /><ol>{content}</ol></section>); continue }
        if (token.type === 'footnote_open') { output.push(<li key={key} value={Number(token.meta?.id ?? 0) + 1} data-anchor={`folio-footnote-${Number(token.meta?.id ?? 0) + 1}`}>{content}</li>); continue }
        const props: Record<string, unknown> = { key, ...sourceLines(token) }
        if (token.type === 'link_open') {
          const href = String(token.attrGet('href') ?? '')
          props.href = /^(https?:\/\/|mailto:|#)/i.test(href) ? href : undefined
          if (/^https?:/i.test(href)) { props.target = '_blank'; props.rel = 'noreferrer' }
        }
        if (token.type === 'table_open') props.className = 'markdown-table'
        if (token.type === 'ordered_list_open') props.start = Number(token.attrGet('start') ?? 1)
        const align = String(token.attrGet('style') ?? '').match(/text-align:(left|center|right)/)?.[1]
        if (align) props.style = { textAlign: align }
        if (token.tag === 'th') props.scope = 'col'
        const task = token.attrGet('data-task')
        if (task) {
          props.className = 'task-item'
          output.push(createElement('li', props, <span data-atomic="true" className="task-marker" role="img" aria-label={task === 'checked' ? 'Selesai' : 'Belum selesai'}>{task === 'checked' ? '☑' : '☐'}</span>, ...content))
        } else output.push(createElement(token.tag, props, ...content))
        continue
      }
      if (token.type === 'inline') output.push(<Fragment key={key}>{render(token.children ?? [], images)}</Fragment>)
      else if (token.type === 'text') output.push(token.content)
      else if (token.type === 'softbreak' || token.type === 'hardbreak') output.push(<br key={key} data-atomic="true" />)
      else if (token.type === 'code_inline') output.push(<HighlightedCode key={key} text={token.content} />)
      else if (token.type === 'fence' || token.type === 'code_block') output.push(<pre key={key} {...sourceLines(token)}><HighlightedCode text={token.content.replace(/\n$/, '')} language={token.info.trim().split(/\s+/)[0] || undefined} /></pre>)
      else if (token.type === 'math_inline') output.push(<MathExpression key={key} expression={token.content} />)
      else if (token.type === 'math_block') output.push(<div key={key} {...sourceLines(token)} className="math-block"><MathExpression expression={token.content} display /></div>)
      else if (token.type === 'hr') output.push(<Separator key={key} {...sourceLines(token)} className="my-5" />)
      else if (token.type === 'image') {
        const source = String(token.attrGet('src') ?? '')
        const image = resolveImage(source, images)
        const alt = token.children?.map(child => child.content).join('') || token.content
        output.push(image ? <img key={key} data-atomic="true" className="markdown-image" src={image.url} alt={alt} title={token.attrGet('title') ? String(token.attrGet('title')) : undefined} /> : <span key={key} data-atomic="true" className="image-unavailable">Gambar belum tersedia: {alt || source}. Pilih file melalui Sisipkan gambar.</span>)
      } else if (token.type === 'footnote_ref') {
        const id = Number(token.meta?.id ?? 0) + 1
        output.push(<sup key={key} data-atomic="true"><a href={`#folio-footnote-${id}`} data-anchor={`folio-ref-${id}-${Number(token.meta?.subId ?? 0)}`} aria-label={`Catatan kaki ${id}`}>[{id}]</a></sup>)
      } else if (token.type === 'footnote_anchor') output.push(<a key={key} className="footnote-backref" href={`#folio-ref-${Number(token.meta?.id ?? 0) + 1}-${Number(token.meta?.subId ?? 0)}`} aria-label="Kembali ke referensi">↩</a>)
      else output.push(token.content)
    }
    return output
  }
  return children()
}

export function MarkdownDocument({ text, images, parsed }: { text: string; images: LocalImages; parsed?: Token[] }) {
  const tokens = useMemo(() => parsed ?? markdownParser.parse(text, {}), [text, parsed])
  return render(tokens, images)
}
