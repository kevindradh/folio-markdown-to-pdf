function legacyCopy(text: string): boolean {
  const active = document.activeElement as HTMLElement | null
  const selection = window.getSelection()
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange()) : []
  const field = document.createElement('textarea')
  field.value = text
  field.readOnly = true
  field.tabIndex = -1
  field.dataset.clipboardFallback = ''
  // Keep the field selectable on iOS, without moving the viewport or opening a keyboard.
  field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;'
  document.body.append(field)
  try {
    field.focus({ preventScroll: true })
    field.select()
    field.setSelectionRange(0, text.length)
    return document.execCommand('copy')
  } catch { return false }
  finally {
    field.remove()
    active?.focus({ preventScroll: true })
    if (selection) {
      selection.removeAllRanges()
      ranges.forEach(range => selection.addRange(range))
    }
  }
}

export async function copyText(text: string, legacyOnly = false): Promise<boolean> {
  if (!legacyOnly && typeof navigator.clipboard?.writeText === 'function') {
    try { await navigator.clipboard.writeText(text); return true }
    catch { /* Some mobile browsers expose the API but deny writes. */ }
  }
  // Missing Clipboard API (e.g. local-network HTTP) reaches this synchronously
  // within the user's tap. Retrying can also use this path directly.
  return legacyCopy(text)
}
