import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { test as base, expect } from './fixtures'
import { parseCollection, templateFor } from '../src/apps/latih/collections'

// Apply the committed hosting headers to the actual build for browser enforcement.
const test = base.extend<{ betaSite: string }>({
  // eslint-disable-next-line no-empty-pattern
  betaSite: async ({}, runFixture) => {
    const config = JSON.parse(await readFile('vercel.json', 'utf8')) as { headers: { source: string; headers: { key: string; value: string }[] }[] }
    const root = resolve('dist')
    const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' }
    const server = createServer(async (request, response) => {
      const path = new URL(request.url!, 'http://localhost').pathname
      const file = resolve(root, '.' + decodeURIComponent(path === '/' ? '/index.html' : path))
      if (!file.startsWith(root + '/')) { response.writeHead(403); response.end(); return }
      for (const rule of config.headers) if (rule.source === '/(.*)' || rule.source === path) for (const header of rule.headers) response.setHeader(header.key, header.value)
      try {
        const bytes = await readFile(file)
        response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream')
        response.end(bytes)
      } catch {
        if (request.headers.accept?.includes('text/html')) { response.setHeader('Content-Type', 'text/html'); response.end(await readFile(resolve(root, 'index.html'))) }
        else { response.writeHead(404); response.end() }
      }
    })
    await new Promise<void>(done => server.listen(0, '127.0.0.1', done))
    try { await runFixture(`http://127.0.0.1:${(server.address() as { port: number }).port}`) }
    finally { server.closeAllConnections(); await new Promise<void>(done => server.close(() => done())) }
  },
})

test('production security headers allow local documents, math, quiz and offline routes', async ({ page, context, betaSite, browserName }, testInfo) => {
  await context.addInitScript(() => {
    localStorage.setItem('latih:guide-completed:v1', 'true')
    const violations: string[] = []
    Object.assign(window, { betaPolicyViolations: violations })
    document.addEventListener('securitypolicyviolation', event => violations.push(event.violatedDirective))
  })
  const response = await page.goto(betaSite)
  expect(response!.headers()['content-security-policy']).toContain("script-src 'self'")
  expect(response!.headers()['x-content-type-options']).toBe('nosniff')
  expect(response!.headers()['x-frame-options']).toBe('DENY')
  await expect(page.locator('.pwa-status')).toHaveAttribute('data-offline-ready', 'true')
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await page.locator('#markdown-editor').fill('# Beta\n\nRumus $F=ma$.\n\n![Gambar](diagram.png)')
  const bytes = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 50; canvas.height = 50
    canvas.getContext('2d')!.fillRect(0, 0, 50, 50)
    return canvas.toDataURL('image/png').split(',')[1]
  })
  await page.getByLabel('Pilih gambar lokal').setInputFiles({ name: 'diagram.png', mimeType: 'image/png', buffer: Buffer.from(bytes, 'base64') })
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
  await expect(page.locator('.paper-pages .katex')).toHaveCount(1)
  await expect(page.locator('.paper-pages img')).toHaveJSProperty('naturalWidth', 50)
  expect(await page.evaluate(() => (window as unknown as { betaPolicyViolations: string[] }).betaPolicyViolations)).toEqual([])
  if (browserName === 'chromium') {
    const pdf = await page.pdf({ path: testInfo.outputPath('beta-with-security-headers.pdf'), printBackground: true, preferCSSPageSize: true })
    expect(pdf.length).toBeGreaterThan(1000)
  }
  await page.goto(`${betaSite}/latih/template`)
  await expect(page.getByRole('heading', { name: 'Template soal', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Impor soal', exact: true }).click()
  await page.getByLabel('JSON latihan').fill(templateFor('multiple-choice'))
  await page.getByRole('button', { name: 'Tambahkan koleksi', exact: true }).click()
  await page.locator('[data-slot="card"]').filter({ hasText: 'Judul materi kamu' }).getByRole('button', { name: 'Mulai latihan' }).click()
  await expect(page.locator('.latih-question-content .katex')).toHaveCount(1)
  await page.locator('.latih-answer').nth(1).click()
  await page.getByRole('button', { name: 'Periksa jawaban', exact: true }).click()
  await expect(page.locator('.latih-explanation .katex')).toHaveCount(1)
  expect(await page.evaluate(() => (window as unknown as { betaPolicyViolations: string[] }).betaPolicyViolations)).toEqual([])
  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('.latih-explanation .katex')).toHaveCount(1)
  expect(await page.evaluate(() => (window as unknown as { betaPolicyViolations: string[] }).betaPolicyViolations)).toEqual([])
})

test('untrusted quiz markup cannot execute code or load remote images', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('latih:guide-completed:v1', 'true'))
  const external: string[] = []
  page.on('request', request => { if (request.url().includes('attacker.invalid')) external.push(request.url()) })
  await page.goto('/latih/koleksi')
  await page.getByRole('button', { name: 'Impor soal', exact: true }).click()
  await page.getByLabel('JSON latihan').fill(JSON.stringify({ title: '<img src=x onerror=alert(1)>', type: 'multiple-choice', questions: [{
    question: '<script>window.betaInjected=true</script>\n\n<img src=x onerror="window.betaInjected=true">\n\n[Click](javascript:alert(1))\n\n![Remote](https://attacker.invalid/image.png)\n\n$\\href{javascript:alert(1)}{Unsafe}$',
    options: ['<svg onload="window.betaInjected=true">', 'Safe'], answer: 1, hint: '[Unsafe](data:text/html,attack)', explanation: '<iframe src="https://attacker.invalid"></iframe>',
  }] }))
  await page.getByRole('button', { name: 'Tambahkan koleksi', exact: true }).click()
  await page.locator('[data-slot="card"]').filter({ hasText: '<img src=x onerror=alert(1)>' }).getByRole('button', { name: 'Mulai latihan' }).click()
  await expect(page.locator('.latih-question-content script, .latih-question-content img, .latih-question-content iframe')).toHaveCount(0)
  await expect(page.locator('.latih-question-content a[href^="javascript:"], .latih-question-content a[href^="data:"]')).toHaveCount(0)
  await page.locator('.latih-answer').nth(1).click()
  await page.getByRole('button', { name: 'Periksa jawaban', exact: true }).click()
  await expect(page.locator('.latih-explanation iframe')).toHaveCount(0)
  expect(await page.evaluate(() => 'betaInjected' in window)).toBe(false)
  expect(external).toEqual([])
})

test('quiz import rejects oversized and malformed content with explicit validation', () => {
  const valid = JSON.parse(templateFor('multiple-choice'))
  for (const input of [null, {}, { ...valid, questions: [] }, { ...valid, questions: Array(101).fill(valid.questions[0]) }, { ...valid, title: 'x'.repeat(121) }, { ...valid, questions: [{ ...valid.questions[0], answer: -1 }] }, { ...valid, questions: [{ ...valid.questions[0], options: Array(7).fill('Option') }] }, { ...valid, questions: [{ ...valid.questions[0], hint: {} }] }]) expect(() => parseCollection(JSON.stringify(input))).toThrow()
  expect(() => parseCollection('x'.repeat(102401))).toThrow('100 KiB')
})

test('beta pages remain usable at mobile, tablet and desktop widths', async ({ page, betaSite }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('latih:guide-completed:v1', 'true'))
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const pages = [['/', 'Konversi Markdown Menjadi PDF'], ['/latih/', 'Beranda'], ['/latih/koleksi', 'Koleksi latihan'], ['/latih/template', 'Template soal'], ['/latih/panduan', 'Panduan penggunaan']]
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const [path, heading] of pages) {
      await page.goto(betaSite + path)
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (width === 1280 || width === 390) await page.screenshot({ path: testInfo.outputPath(`beta-${path.replaceAll('/', '-') || 'folio'}-${width}.png`) })
    }
  }
  expect(errors).toEqual([])
})

test('production CSP blocks inline script execution', async ({ page, betaSite }) => {
  await page.goto(betaSite)
  await page.evaluate(() => {
    const script = document.createElement('script')
    script.textContent = 'window.betaInlineExecuted = true'
    document.body.append(script)
  })
  expect(await page.evaluate(() => 'betaInlineExecuted' in window)).toBe(false)
})
