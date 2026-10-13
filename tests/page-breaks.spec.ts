import { test, expect, type Page } from './fixtures'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const directive = '<!-- pagebreak -->'
const chapterText = '# Bab satu\n\nAwal buku.\n\n## Bagian satu\n\nIsi bagian.\n\n# Bab dua\n\nAkhir buku.'
async function ready(page: Page, text?: string) {
  if (text !== undefined) await page.locator('#markdown-editor').fill(text)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
}
async function pages(page: Page) {
  return page.locator('.paper-pages .document-body').allTextContents()
}
async function chapters(page: Page, option: string) {
  await page.locator('#chapter-start').click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await ready(page)
}

test('manual breaks split sections without leading, trailing or duplicate empty pages', async ({ page }) => {
  await page.goto('/')
  await ready(page, `${directive}\n\n# Pembuka\n\nIsi awal.\n${directive}\n${directive}\n\n## Lampiran\n\nData tambahan.\n\n${directive}\n\n\`\`\`text\nKode lampiran\n\`\`\`\n\n${directive}`)
  const bodies = await pages(page)
  expect(bodies).toHaveLength(3)
  expect(bodies[0]).toContain('Isi awal.')
  expect(bodies[1]).toContain('Lampiran')
  expect(bodies[2]).toContain('Kode lampiran')
  expect(bodies.join('')).not.toContain('pagebreak')
  await expect(page.locator('.paper-pages [data-page-break]')).toHaveCount(0)
  await ready(page, `${directive}\n${directive}`)
  expect(await pages(page)).toEqual([''])
})

test('directives inside code, quotes, lists or inline text remain literal and horizontal rules stay ordinary', async ({ page }) => {
  await page.goto('/')
  const text = `# Literal\n\n\`\`\`html\n${directive}\n\`\`\`\n\n    ${directive}\n\n> ${directive}\n\n- ${directive}\n\nInline \`${directive}\` dan teks ${directive}.\n\n---\n\nAkhir.`
  await ready(page, text)
  expect(await pages(page)).toHaveLength(1)
  expect((await pages(page))[0].match(/<!-- pagebreak -->/g)).toHaveLength(6)
  await expect(page.locator('.paper-template [data-page-break]')).toHaveCount(0)
  await expect(page.locator('.paper-pages [data-slot="separator"]')).toHaveCount(1)
})

test('chapter setting changes heading levels and survives reload and version restore', async ({ page }, testInfo) => {
  await page.goto('/')
  await ready(page, chapterText)
  expect(await pages(page)).toHaveLength(1)
  await chapters(page, 'Halaman baru untuk #')
  expect(await pages(page)).toHaveLength(2)
  await chapters(page, 'Halaman baru untuk # dan ##')
  expect(await pages(page)).toHaveLength(3)
  await expect(page.locator('#draft-status')).toHaveText('Draft tersimpan')
  await page.reload(); await ready(page)
  await expect(page.locator('#chapter-start [data-slot="select-value"]')).toHaveText('Halaman baru untuk # dan ##')
  expect(await pages(page)).toHaveLength(3)
  await page.getByRole('button', { name: 'Riwayat', exact: true }).click()
  await page.getByRole('button', { name: 'Simpan versi', exact: true }).click()
  await page.getByRole('dialog', { name: 'Riwayat versi', exact: true }).getByRole('button', { name: 'Close', exact: true }).click()
  await chapters(page, 'Alur biasa')
  await page.getByRole('button', { name: 'Riwayat', exact: true }).click()
  await page.getByRole('button', { name: 'Pulihkan versi ini', exact: true }).first().click()
  await page.getByRole('button', { name: 'Pulihkan', exact: true }).click()
  await expect(page.locator('#chapter-start [data-slot="select-value"]')).toHaveText('Halaman baru untuk # dan ##')
  await ready(page)
  expect(await pages(page)).toHaveLength(3)
  await ready(page, 'Bab Setext\n===\n\nIsi awal.\n\n> # Judul kutipan\n> Isi kutipan.\n\nBagian Setext\n---\n\nIsi akhir.')
  expect(await pages(page)).toHaveLength(2)
  expect((await pages(page))[0]).toContain('Judul kutipan')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('chapter-settings-mobile.png'), fullPage: true })
})

test('toolbar inserts a standalone break without replacing selected text and download retains it', async ({ page }) => {
  await page.goto('/')
  await ready(page, 'Sebelum\n\nSetelah')
  await page.locator('#markdown-editor').evaluate((el: HTMLTextAreaElement) => { el.focus(); el.setSelectionRange(9, 16) })
  await page.getByRole('button', { name: 'Sisipkan pemisah halaman', exact: true }).click()
  await expect(page.locator('#markdown-editor')).toHaveValue(`Sebelum\n\n\n\n${directive}\n\nSetelah`)
  await ready(page)
  expect(await pages(page)).toHaveLength(2)
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Unduh .md', exact: true }).click()
  const stream = await (await downloadEvent).createReadStream()
  const chunks = []; for await (const chunk of stream!) chunks.push(chunk)
  expect(Buffer.concat(chunks).toString()).toContain(directive)
})

for (const paper of ['A4', 'Letter']) test(`${paper}: manual and chapter breaks produce the same pages in PDF`, async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium', 'PDF generation is only supported by Chromium.')
  await page.goto('/')
  if (paper === 'Letter') { await page.locator('#paper-size').click(); await page.getByRole('option', { name: 'Letter', exact: true }).click() }
  await chapters(page, 'Halaman baru untuk # dan ##')
  await ready(page, `# Bab pertama\n\nPenandaAwal\n\n${directive}\n\n# Bab kedua\n\nPenandaTengah\n\n${directive}\n\n\`\`\`text\nPenandaKode\n\`\`\`\n\n${directive}`)
  expect(await pages(page)).toHaveLength(3)
  // beforeprint must honor the latest chapter option and source as well.
  const bytes = await page.pdf({ path: testInfo.outputPath(`page-breaks-${paper}.pdf`), preferCSSPageSize: true, printBackground: true })
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true })
  try {
    const pdf = await task.promise
    expect(pdf.numPages).toBe(3)
    for (let i = 1; i <= 3; i++) {
      const sheet = await pdf.getPage(i)
      const text = (await sheet.getTextContent()).items.flatMap(item => 'str' in item ? [item.str] : []).join(' ')
      expect(text).toContain(['PenandaAwal', 'PenandaTengah', 'PenandaKode'][i - 1])
      expect(text).toContain(`${i} / 3`)
      expect(text).not.toContain('pagebreak')
    }
  } finally { await task.destroy() }
})
