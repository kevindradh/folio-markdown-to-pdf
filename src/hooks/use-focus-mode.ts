import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

export function useFocusMode(view: string, setView: (view: string) => void, editorRef: RefObject<HTMLTextAreaElement | null>, previewRef: RefObject<HTMLDivElement | null>, buttonRef: RefObject<HTMLButtonElement | null>) {
  const [enabled, setEnabled] = useState(false)
  const bookmark = useRef({ view, x: 0, y: 0, editorTop: 0, editorLeft: 0, previewTop: 0, returning: false })
  const toggle = useCallback(() => {
    const saved = bookmark.current
    const editorElement = editorRef.current, previewElement = previewRef.current
    // A hidden pane reports zero scroll offsets; retain its last visible position.
    if (editorElement?.clientHeight) {
      saved.editorTop = editorElement.scrollTop
      saved.editorLeft = editorElement.scrollLeft
    }
    if (previewElement?.clientHeight) saved.previewTop = previewElement.scrollTop
    if (enabled) {
      saved.returning = true
      setView(saved.view)
    } else {
      saved.view = view; saved.x = scrollX; saved.y = scrollY
      setView('editor')
    }
    setEnabled(!enabled)
  }, [enabled, view, setView, editorRef, previewRef])

  useLayoutEffect(() => {
    const saved = bookmark.current
    const editorElement = editorRef.current, previewElement = previewRef.current
    if (!enabled && !saved.returning) return
    if (enabled) document.documentElement.classList.add('folio-focus')
    if (editorElement) {
      editorElement.scrollTop = saved.editorTop
      editorElement.scrollLeft = saved.editorLeft
    }
    if (previewElement) previewElement.scrollTop = saved.previewTop
    if (enabled) editorRef.current?.focus({ preventScroll: true })
    else {
      saved.returning = false
      buttonRef.current?.focus({ preventScroll: true })
      window.scrollTo(saved.x, saved.y)
    }
    return () => document.documentElement.classList.remove('folio-focus')
  }, [enabled, editorRef, previewRef, buttonRef])

  useEffect(() => {
    if (!enabled) return
    const editorElement = editorRef.current, previewElement = previewRef.current
    const rememberEditor = () => {
      if (editorElement?.clientHeight) {
        bookmark.current.editorTop = editorElement.scrollTop
        bookmark.current.editorLeft = editorElement.scrollLeft
      }
    }
    const rememberPreview = () => {
      if (previewElement?.clientHeight) bookmark.current.previewTop = previewElement.scrollTop
    }
    editorElement?.addEventListener('scroll', rememberEditor, { passive: true })
    previewElement?.addEventListener('scroll', rememberPreview, { passive: true })
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector('[role="dialog"], [role="alertdialog"], [role="listbox"]')) return
      event.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', escape)
    return () => {
      window.removeEventListener('keydown', escape)
      editorElement?.removeEventListener('scroll', rememberEditor)
      previewElement?.removeEventListener('scroll', rememberPreview)
    }
  }, [enabled, toggle, editorRef, previewRef])
  return { enabled, toggle }
}
