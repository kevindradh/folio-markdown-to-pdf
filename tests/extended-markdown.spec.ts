import { test, expect, type Page } from './fixtures'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'

async function ready(page: Page) {
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled({ timeout: 30_000 })
}

async function image(page: Page) {
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 640; canvas.height = 360
    const context = canvas.getContext('2d')!
    context.fillStyle = '#4263eb'; context.fillRect(0, 0, 640, 360)
    context.fillStyle = 'white'; context.font = '32px sans-serif'; context.fillText('Gambar lokal folio', 45, 180)
    return canvas.toDataURL('image/png').split(',')[1]
  })
  await page.getByLabel('Pilih gambar lokal').setInputFiles({ name: 'diagram.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') })
  await expect(page.getByText('Gambar tersimpan di browser.', { exact: true })).toBeVisible()
  await ready(page)
}

test.beforeEach(async ({ page }) => { await page.goto('/') })

test('ordered, nested, and task lists retain numbering, hierarchy and all content across pages', async ({ page }) => {
  const source = Array.from({ length: 80 }, (_, i) => `${i + 7}. Induk ${i + 7}\n    - Anak ${i + 7}A\n      1. Tingkat ketiga ${i + 7}\n    - [x] Tugas selesai ${i + 7}\n    - [ ] Tugas tersisa ${i + 7}`).join('\n\n')
  await page.locator('#markdown-editor').fill(source)
  await ready(page)
  const template = page.locator('.paper-template .document-body')
  await expect(template.locator(':scope > ol')).toHaveAttribute('start', '7')
  await expect(template.locator('ol ul ol')).toHaveCount(80)
  await expect(template.getByRole('img', { name: 'Selesai', exact: true, includeHidden: true })).toHaveCount(80)
  await expect(template.getByRole('img', { name: 'Belum selesai', exact: true, includeHidden: true })).toHaveCount(80)
  const result = await page.locator('.paper-pages').evaluate(root => ({
    values: Array.from(root.querySelectorAll<HTMLLIElement>('.document-body > ol > li.list-leaf')).map(item => item.value),
    text: Array.from(root.querySelectorAll('.document-body')).map(body => body.textContent).join(''),
    overflow: Array.from(root.querySelectorAll<HTMLElement>('.document-body')).some(body => body.scrollHeight > body.clientHeight),
  }))
  expect(result.values).toEqual(Array.from({ length: 80 }, (_, i) => i + 7))
  expect(result.text).toBe(await template.textContent())
  expect(result.overflow).toBe(false)
  await expect(page.locator('.paper-pages article')).not.toHaveCount(1)
})

test('footnotes support repeated references, multiline text, code and math with unique destinations', async ({ page }) => {
  await page.locator('#markdown-editor').fill('# Makalah\n\nTeks[^sumber], ulang[^sumber], dan lainnya[^dua].\n\n[^sumber]: Sumber **penting** dengan $x^2$.\n    Baris lanjutan dengan `kode`.\n\n[^dua]: Catatan kedua.')
  await ready(page)
  const output = page.locator('.paper-pages')
  await expect(output.locator('sup')).toHaveText(['[1]', '[1]', '[2]'])
  await expect(output.locator('#folio-footnote-1')).toHaveCount(1)
  await expect(output.locator('#folio-footnote-2')).toHaveCount(1)
  await expect(output.locator('.footnotes .katex')).toHaveCount(1)
  await expect(output.locator('.footnotes')).toContainText('Baris lanjutan')
  const anchors = await output.evaluate(root => Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#folio-"]')).every(anchor => document.getElementById(anchor.hash.slice(1))))
  expect(anchors).toBe(true)
  await expect(page.locator('.paper-template [id^="folio-footnote"]')).toHaveCount(0)
})

test('tables retain escaped pipes and pipes in code spans with the new parser', async ({ page }) => {
  await page.locator('#markdown-editor').fill('| A | B |\n|---|---|\n| `x|y` | a\\|b |\n\n## Setelah tabel')
  await ready(page)
  await expect(page.locator('.paper-pages tbody td')).toHaveText(['x|y', 'a|b'])
  await expect(page.locator('.paper-pages h2')).toHaveText('Setelah tabel')
})

test('local images connect relative Markdown paths and survive reload without network requests', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('blob:')) requests.push(request.url()) })
  await page.locator('#markdown-editor').fill('# Diagram\n\n![Diagram lokal](./gambar/diagram.png)')
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeDisabled()
  await expect(page.locator('.paper-pages .image-unavailable')).toContainText('Diagram lokal')
  await image(page)
  await expect(page.locator('#markdown-editor')).toHaveValue('# Diagram\n\n![Diagram lokal](./gambar/diagram.png)')
  await expect(page.locator('.paper-pages img')).toHaveCount(1)
  await expect(page.locator('.paper-pages img')).toHaveJSProperty('naturalWidth', 640)
  await page.reload()
  await ready(page)
  await expect(page.locator('.paper-pages img')).toHaveJSProperty('naturalWidth', 640)
  expect(requests).toEqual([])
})

test('image insert uses a persistent reference and rejects invalid or oversized files', async ({ page }) => {
  await page.locator('#markdown-editor').fill('# Baru')
  await page.getByRole('button', { name: 'Sisipkan gambar', exact: true }).click()
  await image(page)
  await expect(page.locator('#markdown-editor')).toHaveValue(/folio-image:/)
  const text = await page.locator('#markdown-editor').inputValue()
  await page.getByLabel('Pilih gambar lokal').setInputFiles({ name: 'besar.png', mimeType: 'image/png', buffer: Buffer.alloc(2 * 1024 * 1024 + 1) })
  await expect(page.getByText('Gambar maksimal 2 MiB.', { exact: true })).toBeVisible()
  await page.getByLabel('Pilih gambar lokal').setInputFiles({ name: 'palsu.png', mimeType: 'image/png', buffer: Buffer.from('<svg onload="alert(1)"></svg>') })
  await expect(page.getByText('Pilih gambar PNG, JPEG, atau WebP yang valid.', { exact: true })).toBeVisible()
  await expect(page.locator('#markdown-editor')).toHaveValue(text)
  await page.reload()
  await ready(page)
  await expect(page.locator('.paper-pages img')).toHaveJSProperty('naturalWidth', 640)
})

test('long paragraphs retain inline images, task markers and footnote targets when split', async ({ page }) => {
  await page.locator('#markdown-editor').fill('# Panjang\n\n' + 'Teks panjang '.repeat(2200) + '![Diagram](diagram.png)\n\n- [x] ' + 'Tugas panjang '.repeat(1500) + '\n\nAkhir[^a].\n\n[^a]: ' + 'Catatan panjang '.repeat(1500))
  await image(page)
  const expected = await page.locator('.paper-template .document-body').textContent()
  expect((await page.locator('.paper-pages .document-body').allTextContents()).join('')).toBe(expected)
  await expect(page.locator('.paper-pages img')).toHaveCount(1)
  await expect(page.locator('.paper-pages .task-marker')).toHaveCount(1)
  await expect(page.locator('.paper-pages #folio-footnote-1')).toHaveCount(1)
  const overflow = await page.locator('.paper-pages .document-body').evaluateAll(nodes => nodes.some(node => node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth))
  expect(overflow).toBe(false)
})

test('PDF embeds local images, list text and footnotes with the preview page count', async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium', 'PDF generation is supported by Chromium only.')
  await page.locator('#markdown-editor').fill('# Makalah lengkap\n\n![Diagram](diagram.png)\n\n7. Nomor tujuh\n    - Anak pertama\n8. Nomor delapan\n\n- [x] Sudah selesai\n- [ ] Belum selesai\n\nReferensi[^a].\n\n[^a]: Sumber makalah.')
  await image(page)
  const count = await page.locator('.paper-pages article').count()
  const bytes = await page.pdf({ path: testInfo.outputPath('extended-markdown.pdf'), preferCSSPageSize: true, printBackground: true })
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true })
  const pdf = await task.promise
  expect(pdf.numPages).toBe(count)
  let embedded = 0
  let text = ''
  for (let i = 1; i <= count; i++) {
    const sheet = await pdf.getPage(i)
    text += (await sheet.getTextContent()).items.flatMap(item => 'str' in item ? [item.str] : []).join(' ')
    embedded += (await sheet.getOperatorList()).fnArray.filter(op => op === OPS.paintImageXObject || op === OPS.paintInlineImageXObject).length
  }
  expect(embedded).toBeGreaterThan(0)
  for (const value of ['Nomor tujuh', 'Anak pertama', 'Nomor delapan', 'Sudah selesai', 'Belum selesai', 'Sumber makalah']) expect(text).toContain(value)
  await task.destroy()
})
