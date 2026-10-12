import MarkdownIt from 'markdown-it'
import footnote from 'markdown-it-footnote'
import { tableCells, tableAlignment } from '@/lib/markdown-table'

export const markdownParser = new MarkdownIt({ html: false, breaks: true, maxNesting: 30 }).use(footnote)
const validateLink = markdownParser.validateLink
markdownParser.validateLink = url => /^folio-image:[a-z\d-]+$/i.test(url) || validateLink(url)

// Retain folio's established table behavior, including literal pipes inside code spans.
markdownParser.block.ruler.at('table', (state, start, end, silent) => {
  if (start + 1 >= end || state.sCount[start] - state.blkIndent >= 4) return false
  const line = (row: number) => state.src.slice(state.bMarks[row] + state.tShift[row], state.eMarks[row])
  const alignment = tableAlignment(line(start), line(start + 1))
  if (!alignment) return false
  if (silent) return true
  const alignments = alignment
  const headers = tableCells(line(start))
  const table = state.push('table_open', 'table', 1)
  function row(cells: string[], tag: 'th' | 'td') {
    state.push('tr_open', 'tr', 1)
    headers.forEach((_, i) => {
      state.push(`${tag}_open`, tag, 1).attrSet('style', `text-align:${alignments[i]}`)
      const inline = state.push('inline', '', 0)
      inline.content = cells[i] ?? ''
      inline.children = []
      state.push(`${tag}_close`, tag, -1)
    })
    state.push('tr_close', 'tr', -1)
  }
  state.push('thead_open', 'thead', 1)
  row(headers, 'th')
  state.push('thead_close', 'thead', -1)
  state.push('tbody_open', 'tbody', 1)
  let next = start + 2
  while (next < end && state.sCount[next] >= state.blkIndent && line(next).trim() && line(next).includes('|')) row(tableCells(line(next++)), 'td')
  state.push('tbody_close', 'tbody', -1)
  state.push('table_close', 'table', -1)
  table.map = [start, next]
  state.line = next
  return true
}, { alt: ['paragraph', 'reference'] })

markdownParser.inline.ruler.before('escape', 'folio_math', (state, silent) => {
  const source = state.src.slice(state.pos)
  const match = source.match(/^\\{1,2}\(([\s\S]+?)\\{1,2}\)/) ?? source.match(/^\$(?!\s|\$)([^$\n]+?)(?<!\s|\\)\$(?!\$)/)
  if (!match) {
    const unclosed = source.match(/^\\{1,2}[[(]/)
    if (!unclosed) return false
    if (!silent) state.push('text', '', 0).content = unclosed[0]
    state.pos += unclosed[0].length
    return true
  }
  if (!silent) {
    const token = state.push('math_inline', '', 0)
    token.content = match[1]
  }
  state.pos += match[0].length
  return true
})

markdownParser.block.ruler.before('fence', 'folio_math_block', (state, start, end, silent) => {
  if (state.sCount[start] - state.blkIndent >= 4) return false
  const first = state.src.slice(state.bMarks[start] + state.tShift[start], state.eMarks[start]).trim()
  const open = first.match(/^(\\{1,2}\[|\$\$)/)
  if (!open) return false
  if (open[0] !== '$$' && state.src.lastIndexOf('\\]') < state.bMarks[start]) return false
  const close = open[0] === '$$' ? /\$\$\s*$/ : /\\{1,2}\]\s*$/
  const parts = [first.slice(open[0].length)]
  let last = start
  // Stop at the current container boundary; never consume unrelated list items.
  while (!close.test(parts.at(-1)!) && last + 1 < end) {
    if (state.sCount[last + 1] < state.blkIndent && state.src.slice(state.bMarks[last + 1], state.eMarks[last + 1]).trim()) break
    last++
    parts.push(state.src.slice(state.bMarks[last] + state.tShift[last], state.eMarks[last]))
  }
  if (!close.test(parts.at(-1)!)) return false
  if (silent) return true
  parts[parts.length - 1] = parts.at(-1)!.replace(close, '')
  const token = state.push('math_block', 'div', 0)
  token.content = parts.join('\n')
  token.map = [start, last + 1]
  state.line = last + 1
  return true
}, { alt: ['paragraph', 'reference', 'blockquote', 'list'] })

// Task boxes are document content, rendered as static symbols rather than UI controls.
markdownParser.core.ruler.after('inline', 'folio_tasks', state => {
  for (let i = 0; i < state.tokens.length - 2; i++) {
    if (state.tokens[i].type !== 'list_item_open' || state.tokens[i + 1].type !== 'paragraph_open') continue
    const inline = state.tokens[i + 2]
    const first = inline.children?.[0]
    if (inline.type !== 'inline' || first?.type !== 'text') continue
    const match = first.content.match(/^\[([ xX])\]\s+/)
    if (!match) continue
    state.tokens[i].attrSet('data-task', match[1].toLowerCase() === 'x' ? 'checked' : 'unchecked')
    first.content = first.content.slice(match[0].length)
  }
})
