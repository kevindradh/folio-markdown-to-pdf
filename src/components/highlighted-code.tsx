import { useMemo, type ReactNode } from 'react'
import { common, createLowlight } from 'lowlight'
import type { Element, RootContent } from 'hast'

const highlighter = createLowlight(common)
highlighter.registerAlias({ typescript: ['tsx'], javascript: ['jsx'], xml: ['html'] })
const autoLanguages = ['javascript', 'typescript', 'python', 'bash', 'json', 'css', 'xml', 'sql']

function renderTokens(nodes: RootContent[]): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.type === 'text') return node.value
    if (node.type !== 'element') return null
    const classes = (node as Element).properties.className
    return <span key={index} className={Array.isArray(classes) ? classes.join(' ') : undefined}>
      {renderTokens(node.children)}
    </span>
  })
}

export function HighlightedCode({ text, language }: { text: string; language?: string }) {
  const tokens = useMemo(() => {
    // Avoid costly grammar autodetection on very large code blocks. Preserve all text.
    if (text.length > 8000) return text
    const selected = language?.toLowerCase()
    // Explicit plain text and unsupported languages remain readable without guessing.
    if (selected && !highlighter.registered(selected)) return text
    const tree = selected
      ? highlighter.highlight(selected, text)
      : highlighter.highlightAuto(text, { subset: autoLanguages })
    return renderTokens(tree.children)
  }, [text, language])

  return <code className="syntax-code" data-language={language || 'auto'}>{tokens}</code>
}
