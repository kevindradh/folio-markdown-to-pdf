/** Split table cells without treating escaped pipes or code spans as separators. */
export function tableCells(line: string): string[] {
  const cells: string[] = []
  let cell = ''
  let codeFence = 0
  const text = line.trim()
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '\\' && text[i + 1] === '|') { cell += '|'; i++; continue }
    if (char === '`') {
      let count = 1
      while (text[i + count] === '`') count++
      if (!codeFence) codeFence = count
      else if (codeFence === count) codeFence = 0
      cell += '`'.repeat(count)
      i += count - 1
      continue
    }
    if (char === '|' && !codeFence) { cells.push(cell.trim()); cell = ''; continue }
    cell += char
  }
  cells.push(cell.trim())
  if (text.startsWith('|')) cells.shift()
  if (text.endsWith('|') && !text.endsWith('\\|')) cells.pop()
  return cells
}

export function tableAlignment(header: string, separator?: string) {
  if (!separator || !header.includes('|')) return null
  const columns = tableCells(header)
  const rules = tableCells(separator)
  if (!columns.length || columns.length !== rules.length || !rules.every(rule => /^:?-{3,}:?$/.test(rule))) return null
  return rules.map(rule => rule.startsWith(':') && rule.endsWith(':') ? 'center' : rule.endsWith(':') ? 'right' : 'left') as ('left' | 'center' | 'right')[]
}
