import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function MathExpression({ expression, display = false }: { expression: string; display?: boolean }) {
  const html = useMemo(() => expression.length > 2000 ? null : katex.renderToString(expression, {
    displayMode: display,
    throwOnError: false,
    trust: false,
    output: 'htmlAndMathml',
    maxSize: 20,
    maxExpand: 1000,
  }), [expression, display])

  if (html === null) return <span className="math-expression" data-math="true"><span className="katex-error" title="Rumus maksimal 2.000 karakter. Pisahkan menjadi beberapa rumus.">{expression}</span></span>

  // Only KaTeX-generated markup enters this element; Markdown HTML is never injected.
  return <span className="math-expression" data-math="true" dangerouslySetInnerHTML={{ __html: html }} />
}
