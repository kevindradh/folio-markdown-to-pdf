import { test as base, expect, type Page } from './fixtures'
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
  await expect(page.getByRole('button', { name: 'Siap digunakan offline', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
}
async function previewReady(page: Page) {
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
}

test('development keeps the status icon and tooltip visible without registering an offline worker', async ({ page }, testInfo) => {
  const { createServer: createDevServer } = await import('vite')
  const server = await createDevServer({ logLevel: 'silent', server: { host: '127.0.0.1', port: 0, open: false } })
  try {
    await server.listen()
    const address = server.httpServer!.address() as { port: number }
    await page.goto(`http://127.0.0.1:${address.port}`)
    const status = page.getByRole('button', { name: 'Mode pengembangan · cache offline tidak aktif', exact: true })
    await expect(status).toBeVisible()
    await status.focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(page.locator('[data-slot="tooltip-content"]')).toHaveText('Mode pengembangan · cache offline tidak aktif')
    await page.screenshot({ path: testInfo.outputPath('pwa-development.png') })
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      const nav = await page.locator('.topbar').boundingBox()
      const menu = await page.getByRole('button', { name: 'Changelog', exact: true }).boundingBox()
      const version = await page.locator('.brand-version').boundingBox()
      const actions = await page.locator('.navbar-actions').boundingBox()
      expect(version!.x + version!.width + 4).toBeLessThanOrEqual(actions!.x)
      expect(menu!.x + menu!.width).toBeLessThanOrEqual(width)
      expect(nav!.height).toBe(56)
      await expect(page.getByRole('button', { name: 'Panduan Markdown', exact: true })).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath(`navbar-${width}.png`) })
    }
    expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0)
    await expect(page.getByRole('button', { name: 'Perbarui aplikasi', exact: true })).toHaveCount(0)
  } finally { await server.close() }
})

test('production manifest and cached app preserve documents, images, fonts and export offline', async ({ page, context, site, browserName }, testInfo) => {
  await page.goto(site.url)
  await offlineReady(page)
  const status = page.getByRole('banner').getByRole('button', { name: 'Siap digunakan offline', exact: true })
  await status.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(page.locator('[data-slot="tooltip-content"]')).toBeVisible()
  await expect(page.locator('[data-slot="tooltip-content"]')).toHaveText('Siap digunakan offline')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-slot="tooltip-content"]')).toBeHidden()
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
  await expect(page.getByRole('button', { name: 'Offline · siap menulis', exact: true })).toBeVisible()
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
  const appVersion = JSON.parse(await readFile('package.json', 'utf8')).version
  await page.setViewportSize({ width: 390, height: 844 })
  const versionButton = page.getByRole('button', { name: 'Changelog', exact: true })
  await expect(page.locator('.topbar .brand-version')).toHaveText(`v${appVersion}`)
  await expect(page.locator('.topbar')).toContainText('Changelog')
  await expect(page.locator('.app-footer')).not.toContainText('File diproses di browser kamu.')
  await versionButton.click()
  const changelog = page.getByRole('dialog', { name: 'Riwayat pembaruan', exact: true })
  await expect(changelog).toContainText(`Versi yang sedang digunakan: v${appVersion}`)
  await expect(changelog.getByRole('heading', { name: `v${appVersion}`, exact: true })).toBeVisible()
  const firstVersion = changelog.getByRole('heading', { name: 'v0.0.1', exact: true })
  await firstVersion.scrollIntoViewIfNeeded()
  await expect(firstVersion).toBeVisible()
  expect(await changelog.evaluate(el => el.scrollWidth <= el.clientWidth && el.getBoundingClientRect().bottom <= innerHeight)).toBe(true)
  await changelog.getByRole('heading', { name: `v${appVersion}`, exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('changelog-mobile.png') })
  await page.keyboard.press('Escape')
  await expect(changelog).toBeHidden()
  await expect(versionButton).toBeFocused()
  await page.getByRole('button', { name: 'Panduan Markdown', exact: true }).click()
  await page.getByRole('button', { name: 'Tur aplikasi', exact: true }).click()
  const offlineTour = page.locator('[role="dialog"].coachmark')
  await expect(offlineTour).toContainText('Mulai dari tulisanmu')
  await offlineTour.getByRole('button', { name: 'Lewati', exact: true }).click()
  await expect(offlineTour).toHaveCount(0)
  await page.getByLabel('Pilih file Markdown').setInputFiles({ name: 'offline.md', mimeType: 'text/markdown', buffer: Buffer.from('# Impor offline\n\n![Diagram](diagram.png)') })
  await previewReady(page)
  await expect(page.locator('.paper-pages h1')).toHaveText('Impor offline')
  await page.getByRole('button', { name: 'Riwayat', exact: true }).click()
  await page.getByRole('button', { name: 'Simpan versi', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Riwayat versi', exact: true })).toContainText('Disimpan manual')
  await page.getByRole('dialog', { name: 'Riwayat versi', exact: true }).getByRole('button', { name: 'Close', exact: true }).click()
  await context.setOffline(false)
  await expect(page.getByRole('button', { name: 'Siap digunakan offline', exact: true })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('pwa-mobile.png'), fullPage: true })
  await page.screenshot({ path: testInfo.outputPath('navbar.png'), clip: { x: 0, y: 0, width: 390, height: 90 } })
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
