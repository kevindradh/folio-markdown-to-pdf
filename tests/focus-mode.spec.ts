import { test, expect, type Page } from './fixtures'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const content = Array.from({ length: 70 }, (_, i) => `## Bagian ${i + 1}\n\n${'Tulisan panjang untuk mode fokus. '.repeat(12)}\n\n`).join('')
async function prepare(page: Page) {
  await page.goto('/')
  await page.locator('#markdown-editor').fill(content)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Mode fokus', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Keluar mode fokus', exact: true })).toBeVisible()
}
async function viewportFits(page: Page) {
  // ResizeObserver and tooltip positioning settle after the viewport resize event.
  await expect.poll(() => page.evaluate(() => document.scrollingElement!.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  const dimensions = await page.evaluate(() => {
    const workspace = document.querySelector('.workspace')!.getBoundingClientRect()
    const root = document.scrollingElement!
    return { top: workspace.top, bottom: workspace.bottom, height: innerHeight, width: innerWidth, scrollHeight: root.scrollHeight, scrollWidth: root.scrollWidth }
  })
  expect(dimensions.top).toBe(0)
  expect(dimensions.bottom).toBeLessThanOrEqual(dimensions.height + 1)
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.height + 1)
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width)
}

test('focus fills the viewport and only the editor scrolls; exit restores the page and view', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.locator('#markdown-editor').fill(content)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  await page.locator('#markdown-editor').evaluate(el => { el.scrollTop = 1500 })
  await page.locator('.paper-stage').evaluate(el => { el.scrollTop = 900 })
  await page.getByRole('button', { name: 'Mode fokus', exact: true }).scrollIntoViewIfNeeded()
  const originalY = await page.evaluate(() => scrollY)
  await page.getByRole('button', { name: 'Mode fokus', exact: true }).click()
  await viewportFits(page)
  await expect(page.locator('.preview-pane')).toBeHidden()
  await expect(page.locator('.settings-bar')).toBeHidden()
  await expect(page.locator('#markdown-editor')).toBeFocused()
  expect(await page.locator('#markdown-editor').evaluate(el => el.scrollTop)).toBe(1500)
  const editor = await page.locator('#markdown-editor').boundingBox()
  await page.mouse.move(editor!.x + 80, editor!.y + 100)
  await page.mouse.wheel(0, 700)
  await expect.poll(() => page.locator('#markdown-editor').evaluate(el => el.scrollTop)).toBeGreaterThan(1800)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await page.locator('#markdown-editor').evaluate(el => { el.scrollTop = el.scrollHeight })
  await page.mouse.wheel(0, 1000)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await page.screenshot({ path: testInfo.outputPath('focus-desktop.png') })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Mode fokus', exact: true })).toBeFocused()
  await expect(page.locator('.preview-pane')).toBeVisible()
  await expect(page.locator('.settings-bar')).toBeVisible()
  await expect.poll(() => page.locator('.paper-stage').evaluate(el => el.scrollTop)).toBe(900)
  expect(await page.evaluate(() => scrollY)).toBe(originalY)
  await expect(page.locator('#markdown-editor')).toHaveValue(content)
  await expect(page.locator('#draft-status')).toHaveText('Draft tersimpan')
})

test('preview and split remain bounded after resizing and nested dialogs consume Escape first', async ({ page }, testInfo) => {
  await prepare(page)
  await page.getByRole('button', { name: 'Muat ulang contoh', exact: true }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('alertdialog')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Keluar mode fokus', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Pratinjau', exact: true }).click()
  await viewportFits(page)
  await expect(page.locator('.editor-pane')).toBeHidden()
  await page.locator('.paper-stage').evaluate(el => { el.scrollTop = 900 })
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await page.getByRole('button', { name: 'Editor', exact: true }).click()
  await page.locator('#markdown-editor').evaluate(el => { el.scrollTop = 1300 })
  await expect.poll(() => page.locator('#markdown-editor').evaluate(el => el.scrollTop)).toBe(1300)
  await page.getByRole('button', { name: 'Pratinjau', exact: true }).click()
  await page.getByRole('button', { name: 'Keluar mode fokus', exact: true }).click()
  await expect.poll(() => page.locator('#markdown-editor').evaluate(el => el.scrollTop)).toBe(1300)
  await page.getByRole('button', { name: 'Mode fokus', exact: true }).click()
  await page.getByRole('button', { name: 'Berdampingan', exact: true }).click()
  await page.locator('#markdown-editor').evaluate(el => { el.scrollTop = 0 })
  await page.locator('.paper-stage').evaluate(el => { el.scrollTop = 0 })
  await page.getByRole('button', { name: 'Sinkronkan scroll', exact: true }).click()
  await page.locator('#markdown-editor').evaluate(el => { el.scrollTop = 2000 })
  await expect.poll(() => page.locator('.paper-stage').evaluate(el => el.scrollTop)).toBeGreaterThan(100)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await viewportFits(page)
  for (const selector of ['#markdown-editor', '.paper-stage']) {
    const rect = await page.locator(selector).boundingBox()
    expect(rect!.height).toBeGreaterThan(90)
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(845)
  }
  await page.getByRole('button', { name: 'Editor', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('focus-mobile.png') })
  await page.setViewportSize({ width: 844, height: 390 })
  await viewportFits(page)
  expect((await page.locator('#markdown-editor').boundingBox())!.height).toBeGreaterThan(100)
  await page.getByRole('button', { name: 'Keluar mode fokus', exact: true }).click()
  await expect(page.locator('.topbar')).toBeVisible()
})

test('printing from editor-only focus still exports the complete paginated document', async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium', 'PDF generation is only supported by Chromium.')
  await prepare(page)
  const count = await page.locator('.paper-pages .paper-sheet').count()
  const bytes = await page.pdf({ path: testInfo.outputPath('focus.pdf'), preferCSSPageSize: true, printBackground: true })
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true })
  try {
    const pdf = await task.promise
    expect(pdf.numPages).toBe(count)
    const text = (await Promise.all(Array.from({ length: pdf.numPages }, async (_, i) => {
      const sheet = await pdf.getPage(i + 1)
      return (await sheet.getTextContent()).items.flatMap(item => 'str' in item ? [item.str] : []).join(' ')
    }))).join(' ')
    expect(text).toContain('Bagian 1')
    expect(text).toContain('Bagian 70')
  } finally { await task.destroy() }
  await viewportFits(page)
})
