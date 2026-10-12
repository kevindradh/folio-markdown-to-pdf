import type { markdownParser } from '@/lib/markdown-parser'
export type MarkdownToken = ReturnType<typeof markdownParser.parse>[number]
export type LocalImage = { url: string; name: string }
export type LocalImages = Record<string, LocalImage>

export function imageTokens(tokens: MarkdownToken[]): MarkdownToken[] {
  return tokens.flatMap(token => token.type === 'image' ? [token] : token.children ? imageTokens(token.children) : [])
}

export function resolveImage(source: string, images: LocalImages) {
  if (/^(?:https?:|data:|javascript:|\/\/)/i.test(source)) return undefined
  let name = source
  try { name = decodeURIComponent(source) } catch { /* Keep malformed names readable. */ }
  for (const key of [source, name, name.replaceAll('\\', '/').split('/').at(-1)!]) {
    if (Object.hasOwn(images, key)) return images[key]
  }
  return undefined
}
