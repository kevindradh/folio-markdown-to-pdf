import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function MathExpression({ expression, display = false }: { expression: string; display?: boolean }) {
  const html = useMemo(() => katex.renderToString(expression, {
    displayMode: display,
    throwOnError: false,
    trust: false,
    output: 'htmlAndMathml',
    maxSize: 20,
    maxExpand: 1000,
  }), [expression, display])

  // Only KaTeX-generated markup enters this element; Markdown HTML is never injected.
  return <span className="math-expression" data-math="true" dangerouslySetInnerHTML={{ __html: html }} />
}
