import { MarkdownDocument } from '@/components/markdown-document'
import type { LocalImages } from '@/lib/image-references'
import { cn } from '@/lib/utils'

const noImages: LocalImages = {}

export function MarkdownContent({ text, interactive = true, className }: { text: string; interactive?: boolean; className?: string }) {
  return <div className={cn('document-body font-modern latih-markdown', className)}>
    <MarkdownDocument text={text} images={noImages} interactive={interactive} />
  </div>
}
