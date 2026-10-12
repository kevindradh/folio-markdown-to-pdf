/** Flatten nested lists while retaining explicit numbering, indentation and document order. */
export function listFragments(root: HTMLElement): HTMLElement[] {
  type Context = { list: HTMLElement; item: HTMLLIElement; value: number; continued: boolean }
  const fragments: HTMLElement[] = []
  function emit(path: Context[], nodes: Node[]) {
    let outer: HTMLElement | undefined
    let parent: HTMLElement | undefined
    path.forEach((context, depth) => {
      const list = context.list.cloneNode(false) as HTMLElement
      list.classList.add('list-fragment')
      const item = context.item.cloneNode(false) as HTMLLIElement
      if (context.list.tagName === 'OL') item.value = context.value
      if (depth < path.length - 1 || context.continued) item.classList.add('list-context-item')
      if (depth === path.length - 1) item.classList.add('list-leaf')
      list.append(item)
      if (parent) parent.append(list)
      else outer = list
      parent = item
    })
    parent!.append(...nodes.map(node => node.cloneNode(true)))
    fragments.push(outer!)
  }
  function walk(list: HTMLElement, ancestors: Context[]) {
    let value = Number(list.getAttribute('start') ?? 1)
    for (const child of list.children) {
      const item = child as HTMLLIElement
      value = Number(item.getAttribute('value') ?? value)
      let continued = false
      let buffer: Node[] = []
      const flush = () => {
        if (!buffer.length) return
        emit([...ancestors, { list, item, value, continued }], buffer)
        buffer = []
        continued = true
      }
      for (const node of item.childNodes) {
        if (node instanceof HTMLElement && /^(UL|OL)$/.test(node.tagName)) {
          flush()
          walk(node, [...ancestors, { list, item, value, continued: true }])
          continued = true
        } else buffer.push(node)
      }
      flush()
      value++
    }
  }
  walk(root, [])
  return fragments
}
