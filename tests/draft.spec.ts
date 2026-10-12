import { readFile } from 'node:fs/promises'
import { test, expect } from '@playwright/test'
import { DRAFT_KEY, inputError, markdownFilename, MAX_DOCUMENT_BYTES } from '../src/lib/document-draft'

test('input limits use UTF-8 bytes and line count; download names are safe', () => {
  expect(inputError('x'.repeat(MAX_DOCUMENT_BYTES))).toBeNull()
  expect(inputError('x'.repeat(MAX_DOCUMENT_BYTES + 1))).toContain('100 KiB')
  expect(inputError('🌿'.repeat(MAX_DOCUMENT_BYTES / 4 + 1))).toContain('100 KiB')
  expect(inputError('\n'.repeat(5000))).toContain('5.000 baris')
  expect(markdownFilename('../catatan/ide:baru\u0000')).toBe('..-catatan-ide-baru-.md')
  expect(markdownFilename('  ')).toBe('Dokumen.md')
  expect(markdownFilename('Catatan pribadi')).toBe('Catatan pribadi.md')
})

test('draft, settings and an intentionally empty document survive reload', async ({ page }) => {
  await page.goto('/')
  await page.locator('#markdown-editor').fill('# Draft 🌿\n\nTulisan milik pengguna.')
  await page.locator('#document-name').fill('Catatan saya')
  await page.locator('#paper-size').click()
  await page.getByRole('option', { name: 'Letter', exact: true }).click()
  await page.getByRole('button', { name: 'Gelap', exact: true }).click()
  await expect(page.locator('#draft-status')).toHaveText('Draft tersimpan')
  await page.reload()
  await expect(page.locator('#markdown-editor')).toHaveValue('# Draft 🌿\n\nTulisan milik pengguna.')
  await expect(page.locator('#document-name')).toHaveValue('Catatan saya')
  await expect(page.locator('#paper-size')).toContainText('Letter')
  await expect(page.getByRole('button', { name: 'Gelap', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.locator('#markdown-editor').fill('')
  await page.reload()
  await expect(page.locator('#markdown-editor')).toHaveValue('')
})

test('Markdown download preserves UTF-8 content and current document name', async ({ page, browserName }) => {
  await page.goto('/')
  const text = '# Catatan 🌿\n\n**Teks**, $x^2$, dan `kode`.\n'
  await page.locator('#markdown-editor').fill(text)
  await page.locator('#document-name').fill('Catatan pribadi')
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Unduh .md', exact: true }).click()
  const file = await downloaded
  // Linux WebKit can replace spaces in the suggested filename with underscores.
  // Only accept that specific browser normalization; still require the full name and extension.
  if (browserName === 'webkit') {
    expect(['Catatan pribadi.md', 'Catatan_pribadi.md']).toContain(file.suggestedFilename())
  } else {
    expect(file.suggestedFilename()).toBe('Catatan pribadi.md')
  }
  expect(await readFile((await file.path())!, 'utf8')).toBe(text)
})

test('unavailable storage is visible and does not prevent editing or downloading', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError') } })
  await page.goto('/')
  await page.locator('#markdown-editor').fill('Tetap bisa menulis tanpa penyimpanan.')
  await expect(page.locator('#draft-status')).toContainText('Draft belum tersimpan')
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Unduh .md', exact: true }).click()
  expect(await readFile((await (await downloaded).path())!, 'utf8')).toBe('Tetap bisa menulis tanpa penyimpanan.')
})

test('oversized file is rejected before reading and never replaces the draft', async ({ page }) => {
  await page.goto('/')
  await page.locator('#markdown-editor').fill('Draft yang harus dipertahankan')
  await page.locator('#document-name').fill('Nama tetap')
  await page.evaluate(() => { File.prototype.text = () => { document.body.dataset.fileRead = 'true'; return Promise.resolve('Tidak boleh dibaca') } })
  await page.getByLabel('Pilih file Markdown').setInputFiles({ name: 'besar.md', mimeType: 'text/markdown', buffer: Buffer.alloc(MAX_DOCUMENT_BYTES + 1, 'x') })
  await expect(page.getByText('File terlalu besar.', { exact: true })).toBeVisible()
  await expect(page.locator('body')).not.toHaveAttribute('data-file-read')
  await expect(page.locator('#markdown-editor')).toHaveValue('Draft yang harus dipertahankan')
  await expect(page.locator('#document-name')).toHaveValue('Nama tetap')
  await page.reload()
  await expect(page.locator('#markdown-editor')).toHaveValue('Draft yang harus dipertahankan')
})

test('oversized pasted text and excessive lines preserve accepted content', async ({ page }) => {
  await page.goto('/')
  await page.locator('#markdown-editor').fill('Draft aman')
  await page.locator('#markdown-editor').fill('🌿'.repeat(MAX_DOCUMENT_BYTES / 4 + 1))
  await expect(page.locator('#markdown-editor')).toHaveValue('Draft aman')
  const prevented = await page.locator('#markdown-editor').evaluate(element => {
    const data = new DataTransfer()
    data.setData('text/plain', '\n'.repeat(5000))
    const paste = new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true })
    element.dispatchEvent(paste)
    return paste.defaultPrevented
  })
  expect(prevented).toBe(true)
  await expect(page.locator('#markdown-editor')).toHaveValue('Draft aman')
  await page.reload()
  await expect(page.locator('#markdown-editor')).toHaveValue('Draft aman')
})

for (const kind of ['invalid JSON', 'oversized content']) {
  test(`stored draft with ${kind} falls back safely`, async ({ page }) => {
    const raw = kind === 'invalid JSON' ? '{invalid json' : JSON.stringify({ version: 1, text: 'x'.repeat(MAX_DOCUMENT_BYTES + 1) })
    await page.addInitScript(({ key, raw }) => { localStorage.setItem(key, raw) }, { key: DRAFT_KEY, raw })
    await page.goto('/')
    await expect(page.locator('#markdown-editor')).toHaveValue(/Ruang untuk ide/)
    await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  })
}

test('pagination yields to the browser and cancels stale work after rapid edits', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  await page.evaluate(() => {
    document.body.dataset.ticks = '0'
    const observer = new MutationObserver(() => {
      if (!document.body.dataset.layoutTick) document.body.dataset.layoutTick = document.body.dataset.ticks
    })
    observer.observe(document.querySelector('.paper-measurement')!, { childList: true, subtree: true })
    setInterval(() => { document.body.dataset.ticks = String(Number(document.body.dataset.ticks) + 1) }, 10)
  })
  const text = Array.from({ length: 1200 }, (_, i) => `Paragraf ${i}. Isi dokumen untuk menguji pembagian halaman.`).join('\n')
  await page.locator('#markdown-editor').fill(text)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled({ timeout: 30_000 })
  const ticks = Number(await page.locator('body').getAttribute('data-ticks')) - Number(await page.locator('body').getAttribute('data-layout-tick'))
  expect(ticks).toBeGreaterThan(3)
  expect((await page.locator('.paper-pages .document-body').allTextContents()).join('')).toBe(text.replaceAll('\n', ''))
  await page.locator('#markdown-editor').fill(text + '\nVersi lama')
  await page.waitForTimeout(300)
  await page.locator('#markdown-editor').fill('# Versi terbaru\n\nIsi akhir.')
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  await expect(page.locator('.paper-pages .document-body')).toHaveText('Versi terbaruIsi akhir.')
  await expect(page.locator('.paper-pages article')).toHaveCount(1)
})

test('native print during preview debounce uses the latest text', async ({ page }) => {
  await page.goto('/')
  await page.locator('#markdown-editor').fill('# Baru saja diketik\n\nKonten terbaru sebelum cetak.')
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')))
  await expect(page.locator('.paper-pages .document-body')).toHaveText('Baru saja diketikKonten terbaru sebelum cetak.')
  await page.waitForTimeout(400)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
})

test('valid upload restores its contents and filename after reload', async ({ page }) => {
  await page.goto('/')
  const text = '# Berkas 🌿\n\nTulisan dari file.'
  await page.getByLabel('Pilih file Markdown').setInputFiles({ name: 'berkas.md', mimeType: 'text/markdown', buffer: Buffer.from(text, 'utf8') })
  await expect(page.locator('#markdown-editor')).toHaveValue(text)
  await expect(page.locator('#document-name')).toHaveValue('berkas')
  await page.reload()
  await expect(page.locator('#markdown-editor')).toHaveValue(text)
  await expect(page.locator('#document-name')).toHaveValue('berkas')
})

test('mobile draft status and download control fit without horizontal overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.waitForTimeout(500)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Unduh .md', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('mobile-draft.png'), fullPage: true })
})

test('large code and math fall back to intact literal text instead of expensive rendering', async ({ page }) => {
  await page.goto('/')
  const code = 'const text = "abc";\n'.repeat(500).trimEnd()
  const formula = 'x+'.repeat(1200) + '1'
  await page.locator('#markdown-editor').fill(`\`\`\`javascript\n${code}\n\`\`\`\n\n$$${formula}$$`)
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  const source = page.locator('.paper-template .document-body')
  await expect(source.locator('pre')).toHaveText(code)
  await expect(source.locator('.hljs-keyword')).toHaveCount(0)
  await expect(source.locator('.katex-error')).toHaveText(formula)
  await expect(source.locator('.katex')).toHaveCount(0)
  expect((await page.locator('.paper-pages pre').allTextContents()).join('')).toBe(code)
})
