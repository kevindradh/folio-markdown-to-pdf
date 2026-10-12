import { test as base, expect, type Page } from '@playwright/test'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'

// Serve the real production build; vary only the SW bytes to simulate a deployment.
const test = base.extend<{ site: { url: string; deploy: () => void } }>({
  // Playwright requires an object pattern even for a fixture with no dependencies.
  // eslint-disable-next-line no-empty-pattern
  site: async ({}, runFixture) => {
    let version = 1
    const root = resolve('dist')
    const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' }
    const server = createServer(async (request, response) => {
      const path = new URL(request.url!, 'http://localhost').pathname
      const file = resolve(root, '.' + (path === '/' ? '/index.html' : path))
      if (!file.startsWith(root + '/')) { response.writeHead(403); response.end(); return }
      try {
        const bytes = await readFile(file)
        response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
        response.end(path === '/sw.js' ? Buffer.concat([bytes, Buffer.from(`\n// deployment ${version}\n`)]) : bytes)
      } catch { response.writeHead(404); response.end() }
    })
    await new Promise<void>(done => server.listen(0, '127.0.0.1', done))
    const address = server.address() as { port: number }
    try { await runFixture({ url: `http://127.0.0.1:${address.port}`, deploy: () => { version++ } }) }
    finally { server.closeAllConnections(); await new Promise<void>(done => server.close(() => done())) }
  },
})

async function offlineReady(page: Page) {
  await expect(page.getByText('Siap digunakan offline', { exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
}
async function previewReady(page: Page) {
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
}

test('production manifest and cached app preserve documents, images, fonts and export offline', async ({ page, context, site, browserName }, testInfo) => {
  await page.goto(site.url)
  await offlineReady(page)
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')!
    return (await fetch(link.href)).json()
  })
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(['192x192', '512x512', '512x512'])
  await page.locator('#markdown-editor').fill('# Catatan offline\n\nRumus $x^2$.\n\n![Diagram](diagram.png)')
  const bytes = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 90
    canvas.getContext('2d')!.fillRect(0, 0, 160, 90)
    return canvas.toDataURL('image/png').split(',')[1]
  })
  await page.getByLabel('Pilih gambar lokal').setInputFiles({ name: 'diagram.png', mimeType: 'image/png', buffer: Buffer.from(bytes, 'base64') })
  await previewReady(page)
  await expect(page.locator('#draft-status')).toHaveText('Draft tersimpan')
  await context.setOffline(true)
  await page.reload()
  await previewReady(page)
  await expect(page.getByText('Offline · siap menulis', { exact: true })).toBeVisible()
  await expect(page.locator('.paper-pages img')).toHaveJSProperty('naturalWidth', 160)
  await expect(page.locator('.paper-pages .katex')).toHaveCount(1)
  expect(await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px "Inter Variable"') })).toBe(true)
  await page.locator('#markdown-editor').fill('# Diedit tanpa internet\n\n![Diagram](diagram.png)')
  await expect(page.locator('#draft-status')).toHaveText('Draft tersimpan')
  await page.reload()
  await previewReady(page)
  await expect(page.locator('#markdown-editor')).toHaveValue('# Diedit tanpa internet\n\n![Diagram](diagram.png)')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Unduh .md', exact: true }).click()
  expect((await download).suggestedFilename()).toMatch(/\.md$/)
  if (browserName === 'chromium') {
    const pdf = await page.pdf({ path: testInfo.outputPath('offline.pdf'), preferCSSPageSize: true, printBackground: true })
    expect(pdf.length).toBeGreaterThan(1000)
  }
  const next = await context.newPage()
  await next.goto(site.url)
  await expect(next.locator('#markdown-editor')).toHaveValue('# Diedit tanpa internet\n\n![Diagram](diagram.png)')
  await page.getByLabel('Pilih file Markdown').setInputFiles({ name: 'offline.md', mimeType: 'text/markdown', buffer: Buffer.from('# Impor offline\n\n![Diagram](diagram.png)') })
  await previewReady(page)
  await expect(page.locator('.paper-pages h1')).toHaveText('Impor offline')
  await page.getByRole('button', { name: 'Riwayat', exact: true }).click()
  await page.getByRole('button', { name: 'Simpan versi', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Riwayat versi', exact: true })).toContainText('Disimpan manual')
  await page.getByRole('dialog', { name: 'Riwayat versi', exact: true }).getByRole('button', { name: 'Close', exact: true }).click()
  await context.setOffline(false)
  await expect(page.getByText('Siap digunakan offline', { exact: true })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('pwa-mobile.png'), fullPage: true })
})

test('new worker waits for consent, saves the latest draft and leaves other tabs open', async ({ page, context, site }) => {
  await page.goto(site.url)
  await offlineReady(page)
  const other = await context.newPage()
  await other.goto(site.url)
  await offlineReady(other)
  await other.evaluate(() => { IDBDatabase.prototype.transaction = () => { throw new DOMException('Storage unavailable', 'SecurityError') } })
  await other.locator('#markdown-editor').fill('# Perubahan tab lain belum tersimpan')
  await expect(other.locator('#draft-status')).toHaveText('Draft belum tersimpan; unduh .md')
  let navigations = 0
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations++ })
  let otherNavigations = 0
  other.on('framenavigated', frame => { if (frame === other.mainFrame()) otherNavigations++ })
  site.deploy()
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration!.update() })
  const update = page.getByRole('button', { name: 'Perbarui aplikasi', exact: true })
  await expect(update).toBeVisible()
  expect(navigations).toBe(0)
  await page.locator('#markdown-editor').fill('# Tulisan sebelum pembaruan')
  await expect(update).toBeEnabled()
  await Promise.all([page.waitForEvent('framenavigated', frame => frame === page.mainFrame()), update.click()])
  await expect(page.locator('#markdown-editor')).toHaveValue('# Tulisan sebelum pembaruan')
  await expect(update).toHaveCount(0)
  expect(otherNavigations).toBe(0)
  await expect(other.locator('#markdown-editor')).toHaveValue('# Perubahan tab lain belum tersimpan')
  await page.emulateMedia({ media: 'print' })
  await expect(page.getByRole('complementary', { name: 'Status aplikasi' })).toBeHidden()
})

test('failed persistence prevents an update from discarding the draft', async ({ page, site }) => {
  await page.goto(site.url)
  await offlineReady(page)
  site.deploy()
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())!.update() })
  const update = page.getByRole('button', { name: 'Perbarui aplikasi', exact: true })
  await expect(update).toBeEnabled()
  const source = await page.locator('#markdown-editor').inputValue()
  await page.evaluate(() => { IDBDatabase.prototype.transaction = () => { throw new DOMException('Storage unavailable', 'SecurityError') } })
  let navigations = 0
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations++ })
  await update.click()
  await expect(page.getByText('Draft belum tersimpan.', { exact: true })).toBeVisible()
  await expect(page.locator('#markdown-editor')).toBeEnabled()
  await expect(page.locator('#markdown-editor')).toHaveValue(source)
  expect(navigations).toBe(0)
  await page.locator('#markdown-editor').fill('# Tetap bisa menulis saat storage gagal')
  await expect(page.locator('#draft-status')).toHaveText('Draft belum tersimpan; unduh .md')
  await expect(update).toBeDisabled()
})
