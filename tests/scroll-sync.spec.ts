import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

const markdown = Array.from({ length: 24 }, (_, i) => `## Bagian ${i + 1}\n\n${'Kalimat panjang dengan **penekanan**, `kode`, dan $x^2$. '.repeat(i % 3 === 0 ? 35 : 4)}\n\n- Catatan pertama\n- Catatan kedua\n\n| Nama | Nilai |\n| --- | --- |\n| Data ${i + 1} | ${i + 1} |\n\n\`\`\`text\n${'baris kode\n'.repeat(8)}\`\`\`\n`).join('\n')
const editor = '#markdown-editor'
const stage = '.paper-stage'

async function lineTop(page: Page, heading: string) {
  return page.locator(editor).evaluate((el: HTMLTextAreaElement, heading) => {
    const mirror = document.createElement('div')
    const style = getComputedStyle(el)
    mirror.style.cssText = `position:fixed;top:0;left:-99999px;white-space:pre-wrap;overflow-wrap:break-word;box-sizing:border-box;width:${el.clientWidth}px`
    for (const property of ['font', 'line-height', 'letter-spacing', 'tab-size', 'padding']) mirror.style.setProperty(property, style.getPropertyValue(property))
    mirror.append(document.createTextNode(el.value.slice(0, el.value.indexOf(heading))))
    const marker = document.createElement('span'); marker.textContent = heading
    mirror.append(marker); document.body.append(mirror)
    const top = marker.getClientRects()[0].top - mirror.getBoundingClientRect().top
    mirror.remove(); return top
  }, heading)
}
async function prepare(page: Page) {
  await page.goto('/')
  await page.locator(editor).fill(markdown)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
}
async function previewOffset(page: Page, heading: string) {
  return page.locator('.paper-pages h2').filter({ hasText: heading }).evaluate(el => el.getBoundingClientRect().top - el.closest('.paper-stage')!.getBoundingClientRect().top)
}

test('source sections stay aligned in both directions despite wrapping, pagination and zoom', async ({ page }) => {
  await prepare(page)
  const toggle = page.getByRole('button', { name: 'Sinkronkan scroll', exact: true })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await toggle.click()
  const y = await lineTop(page, '## Bagian 12')
  await page.locator(editor).evaluate((el, y) => { el.scrollTop = y }, y)
  await expect.poll(() => previewOffset(page, 'Bagian 12')).toBeLessThan(35)
  await expect.poll(() => previewOffset(page, 'Bagian 12')).toBeGreaterThan(-35)
  await page.locator('.paper-pages h2').filter({ hasText: 'Bagian 18' }).evaluate(el => {
    const stage = el.closest('.paper-stage')!; stage.scrollTop += el.getBoundingClientRect().top - stage.getBoundingClientRect().top
  })
  const reverseY = await lineTop(page, '## Bagian 18')
  await expect.poll(async () => Math.abs(await page.locator(editor).evaluate(el => el.scrollTop) - reverseY)).toBeLessThan(35)
  await page.getByRole('button', { name: 'Perbesar' }).click()
  await expect.poll(() => previewOffset(page, 'Bagian 18')).toBeLessThan(35)
  await expect.poll(() => previewOffset(page, 'Bagian 18')).toBeGreaterThan(-35)
  // No feedback loop continues moving the panels after the initiating scroll has settled.
  const positions = await page.locator(stage).evaluate(el => [el.scrollTop, document.querySelector<HTMLTextAreaElement>('#markdown-editor')!.scrollTop])
  await page.waitForTimeout(350)
  expect(await page.locator(stage).evaluate(el => [el.scrollTop, document.querySelector<HTMLTextAreaElement>('#markdown-editor')!.scrollTop])).toEqual(positions)
})

test('toggle remembers preference, disabled panels scroll independently and endpoints match', async ({ page }) => {
  await prepare(page)
  const toggle = page.getByRole('button', { name: 'Sinkronkan scroll', exact: true })
  await toggle.click()
  await page.locator(editor).evaluate(el => { el.scrollTop = el.scrollHeight })
  await expect.poll(() => page.locator(stage).evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop)).toBeLessThan(2)
  await toggle.click()
  const before = await page.locator(stage).evaluate(el => el.scrollTop)
  await page.locator(editor).evaluate(el => { el.scrollTop = 0 })
  await page.waitForTimeout(250)
  expect(await page.locator(stage).evaluate(el => el.scrollTop)).toBe(before)
  await toggle.click()
  await expect.poll(() => page.locator(stage).evaluate(el => el.scrollTop)).toBe(0)
  await expect(page.locator('#draft-status')).toHaveText('Draft tersimpan')
  await page.reload()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Editor', exact: true }).click()
  await expect(page.locator(stage)).toBeHidden()
  await page.locator(editor).evaluate(el => { el.scrollTop = 800 })
  await page.getByRole('button', { name: 'Berdampingan', exact: true }).click()
  await expect.poll(() => page.locator(stage).evaluate(el => el.scrollTop)).toBeGreaterThan(100)
})

test('updated source and mobile layout retain synchronization without horizontal overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await prepare(page)
  await page.getByRole('button', { name: 'Sinkronkan scroll', exact: true }).click()
  await page.locator(editor).fill(`# Tambahan\n\n${'Pengantar baru. '.repeat(30)}\n\n${markdown}`)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  const y = await lineTop(page, '## Bagian 12')
  await page.locator(editor).evaluate((el, y) => { el.scrollTop = y }, y)
  await expect.poll(async () => Math.abs(await previewOffset(page, 'Bagian 12'))).toBeLessThan(40)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('scroll-sync-mobile.png'), fullPage: true })
})

test('a code block spanning pages follows the corresponding source lines', async ({ page }) => {
  await page.goto('/')
  await page.locator(editor).fill(`\`\`\`text\n${Array.from({ length: 240 }, (_, i) => `baris ${String(i + 1).padStart(3, '0')} = data`).join('\n')}\n\`\`\`\n\n${markdown}`)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Sinkronkan scroll', exact: true }).click()
  const y = await lineTop(page, 'baris 120')
  await page.locator(editor).evaluate((el, y) => { el.scrollTop = y }, y)
  await expect.poll(() => page.locator(stage).evaluate(stage => {
    const pre = Array.from(stage.querySelectorAll('pre')).find(node => node.textContent?.includes('baris 120'))!
    const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const offset = walker.currentNode.textContent!.indexOf('baris 120')
      if (offset < 0) continue
      const range = document.createRange(); range.setStart(walker.currentNode, offset); range.setEnd(walker.currentNode, offset + 9)
      return Math.abs(range.getBoundingClientRect().top - stage.getBoundingClientRect().top)
    }
    return Infinity
  })).toBeLessThan(90)
})

test('keyboard toggle works even when storing the preference fails', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'folio:scroll-sync:v1') throw new DOMException('Unavailable', 'QuotaExceededError')
      original.call(this, key, value)
    }
  })
  await prepare(page)
  const toggle = page.getByRole('button', { name: 'Sinkronkan scroll', exact: true })
  await toggle.focus(); await page.keyboard.press('Space')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await page.locator(editor).evaluate(el => { el.scrollTop = 2000 })
  await expect.poll(() => page.locator(stage).evaluate(el => el.scrollTop)).toBeGreaterThan(100)
  await page.screenshot({ path: testInfo.outputPath('scroll-sync-desktop.png'), fullPage: true })
})

for (const synchronized of [false, true]) test(`inserting a page break in a long document preserves the editing position (sync ${synchronized})`, async ({ page }) => {
  await prepare(page)
  if (synchronized) await page.getByRole('button', { name: 'Sinkronkan scroll', exact: true }).click()
  const position = markdown.indexOf('## Bagian 12')
  const top = await lineTop(page, '## Bagian 12')
  await page.locator(editor).evaluate((el: HTMLTextAreaElement, { position, top }) => {
    el.focus({ preventScroll: true }); el.setSelectionRange(position, position); el.scrollTop = top
  }, { position, top })
  if (synchronized) await expect.poll(async () => Math.abs(await previewOffset(page, 'Bagian 12'))).toBeLessThan(40)
  const before = await page.locator(editor).evaluate(el => el.scrollTop)
  await page.getByRole('button', { name: 'Sisipkan pemisah halaman', exact: true }).click()
  await expect(page.locator(editor)).toHaveValue(markdown.slice(0, position) + '\n\n<!-- pagebreak -->\n\n' + markdown.slice(position))
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  await expect.poll(async () => Math.abs(await page.locator(editor).evaluate(el => el.scrollTop) - before)).toBeLessThan(120)
  expect(await page.locator(editor).evaluate((el: HTMLTextAreaElement) => el.selectionStart)).toBe(position + '\n\n<!-- pagebreak -->\n\n'.length)
  if (synchronized) {
    await expect.poll(async () => Math.abs(await previewOffset(page, 'Bagian 12'))).toBeLessThan(220)
    expect(await page.locator(stage).evaluate(el => el.scrollTop / (el.scrollHeight - el.clientHeight))).toBeLessThan(.8)
  }
  // Typing a directive directly and using another toolbar action must also retain the section.
  await page.locator(editor).pressSequentially('\n\n<!-- pagebreak -->\n\n')
  await page.getByRole('button', { name: 'Tebal', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  await expect.poll(async () => Math.abs(await page.locator(editor).evaluate(el => el.scrollTop) - before)).toBeLessThan(250)
})
