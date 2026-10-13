import { test, expect, type Page } from './fixtures'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { tableCells, tableAlignment } from '../src/lib/markdown-table'

const source = (count = 80) => '# Dokumen regresi\n\n' + Array.from({ length: count }, (_, i) =>
  `## Bagian ${i + 1}\n\nPenanda${i + 1} awal. ${'Kalimat panjang dengan **penekanan** dan *miring*. '.repeat(8)} Penanda${i + 1} akhir.\n\n` +
  '| Besaran | Rumus |\n|:---|---:|\n' + `| Arus${i + 1} | $x^2$ |\n\n` +
  '```javascript\nconst message = "Halo";\nconsole.log(message);\n```\n\n' +
  String.raw`\[A=\begin{bmatrix}a&b\\c&d\end{bmatrix}\]` + '\n',
).join('\n')

async function ready(page: Page, text: string) {
  await page.locator('#markdown-editor').fill(text)
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(() => page.locator('.paper-template .document-body').textContent()).toContain('Penanda1 awal')
  await expect.poll(() => page.locator('.paper-pages').textContent()).toContain('Penanda80 akhir')
  await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
}

async function integrity(page: Page) {
  const result = await page.evaluate(() => {
    const source = document.querySelector('.paper-template .document-body')!
    const bodies = Array.from(document.querySelectorAll<HTMLElement>('.paper-pages .document-body'))
    const text = (root: Element) => Array.from(root.children).map(child => child.tagName === 'TABLE'
      ? '' : child.textContent).join('')
    const cells = (roots: Element[]) => {
      const columns: string[] = []
      for (const root of roots) for (const row of root.querySelectorAll('tbody tr')) {
        Array.from(row.children).forEach((cell, i) => { columns[i] = (columns[i] ?? '') + cell.textContent })
      }
      return columns
    }
    return {
      originalCells: cells([source]), actualCells: cells(bodies),
      original: text(source), actual: bodies.map(text).join(''),
      overflow: bodies.filter(body => body.scrollHeight > body.clientHeight || body.scrollWidth > body.clientWidth).length,
      originalMath: Array.from(source.querySelectorAll('[data-math]')).map(node => node.innerHTML),
      actualMath: bodies.flatMap(body => Array.from(body.querySelectorAll('[data-math]')).map(node => node.innerHTML)),
      pages: bodies.length,
      counters: Array.from(document.querySelectorAll('.paper-pages .paper-page-number')).map(node => node.textContent),
    }
  })
  expect(result.pages).toBeGreaterThan(1)
  expect(result.actual).toBe(result.original)
  expect(result.actualCells).toEqual(result.originalCells)
  expect(result.overflow).toBe(0)
  expect(result.actualMath).toEqual(result.originalMath)
  expect(result.counters).toEqual(Array.from({ length: result.pages }, (_, i) => `${i + 1} / ${result.pages}`))
  return result.pages
}

test.beforeEach(async ({ page }) => { await page.goto('/') })

test('table parsing preserves escaped pipes, code spans and alignment', () => {
  expect(tableCells('| a\\|b | `x|y` |')).toEqual(['a|b', '`x|y`'])
  expect(tableCells('| ``x`|y`` | z |')).toEqual(['``x`|y``', 'z'])
  expect(tableAlignment('| A | B | C |', '|:---|:---:|---:|')).toEqual(['left', 'center', 'right'])
  expect(tableAlignment('| A | B |', '|--|---|')).toBeNull()
  expect(tableAlignment('| A | B |', '|---|')).toBeNull()
})

test('safe Markdown, math delimiters, code highlighting and table boundaries', async ({ page }) => {
  await page.locator('#markdown-editor').fill([
    '# Sintaks', '**tebal** dan *miring*', '[bahaya](javascript:alert(1))', '[aman](https://example.com)', '<img src=x onerror=alert(1)>',
    '| Besaran | Alat | Pemasangan |', '|---|---|---|',
    '| Arus | Amperemeter | Seri |', '| Tegangan | Voltmeter | Paralel |', '| Hambatan | Ohmmeter | Tanpa daya |',
    '', '### Setelah tabel', String.raw`\(x^2\) dan $x^2$`,
    '$$\\frac{1}{2}$$', String.raw`\[\begin{bmatrix}a&b\\c&d\end{bmatrix}\]`,
    '```javascript', 'const message = "<script>alert(1)</script>";', '```',
    '```text', '$x^2$', '```', String.raw`$$\frac{1}{$$`, '\\[belum ditutup',
  ].join('\n'))
  const body = page.locator('.paper-template .document-body')
  await expect(body.locator('tbody tr')).toHaveCount(3)
  await expect(body.locator('h3')).toHaveText('Setelah tabel')
  await expect(body.locator('.katex')).toHaveCount(4)
  await expect(body.locator('.katex-error')).toHaveCount(1)
  await expect(body.locator('.hljs-keyword')).toContainText(['const'])
  await expect(body.locator('a[href^="javascript:"]')).toHaveCount(0)
  await expect(body.locator('a[href="https://example.com"]')).toHaveAttribute('rel', 'noreferrer')
  await expect(body.locator('img, script')).toHaveCount(0)
  await expect(body).toContainText('\\[belum ditutup')
  await expect(body.locator('pre').last()).toHaveText('$x^2$')
})

for (const paper of ['A4', 'Letter']) {
  test(`${paper}: long documents retain text, formulas and pagination at all zoom levels`, async ({ page, browserName }) => {
    // Repeated pagination plus synchronous print layout is expensive on Linux WebKit.
    if (process.env.CI && browserName === 'webkit') test.slow()
    if (paper === 'Letter') {
      await page.locator('#paper-size').click()
      await page.getByRole('option', { name: 'Letter', exact: true }).click()
      await page.locator('#document-font').click()
      await page.getByRole('option', { name: 'Modern', exact: true }).click()
      await page.locator('#document-margin').click()
      await page.getByRole('option', { name: 'Lebar', exact: true }).click()
    }
    await test.step('Render all 80 sections', () => ready(page, source()))
    const count = await test.step('Check text, formulas, tables and page overflow', () => integrity(page))
    await page.getByRole('group', { name: 'Blok kode', exact: true }).getByRole('button', { name: 'Gelap', exact: true }).click()
    await expect(page.locator('.paper-pages article').first()).toHaveAttribute('data-code-theme', 'dark')
    await expect(page.getByRole('button', { name: 'Ekspor PDF', exact: true })).toBeEnabled()
    expect(await integrity(page)).toBe(count)
    await page.getByRole('button', { name: /Perbesar/ }).click()
    expect(await integrity(page)).toBe(count)
    // beforeprint also covers the native keyboard shortcut, independent of the button.
    await test.step('Recompute print layout and verify all content', async () => {
      await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')))
      expect(await integrity(page)).toBe(count)
    })
  })
}

test('long tables repeat headers, and oversized rows/code preserve every character', async ({ page }) => {
  const cells = ['sel pertama '.repeat(1500), 'sel kedua '.repeat(1200)]
  const code = Array.from({ length: 150 }, (_, i) => `const value${i} = "baris ${i}";`).join('\n')
  await page.locator('#markdown-editor').fill(`| A | B |\n|---|---|\n|${cells[0]}|${cells[1]}|\n\n\`\`\`typescript\n${code}\n\`\`\``)
  await expect.poll(() => page.locator('.paper-pages pre').allTextContents().then(parts => parts.join(''))).toBe(code)
  const actual = await page.locator('.paper-pages').evaluate(root => {
    const rows = Array.from(root.querySelectorAll('tbody tr'))
    return [0, 1].map(i => rows.map(row => row.children[i].textContent).join(''))
  })
  expect(actual).toEqual(cells.map(cell => cell.trim()))
  await expect(page.locator('.paper-pages thead')).toHaveCount(await page.locator('.paper-pages table').count())
  await integrity(page)
})

for (const paper of ['A4', 'Letter']) {
test(`${paper} PDF has the preview page count, physical size, text and footer order`, async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium', 'Playwright PDF generation is supported by Chromium only; WebKit layout is tested separately.')
  if (paper === 'Letter') {
    await page.locator('#paper-size').click()
    await page.getByRole('option', { name: 'Letter', exact: true }).click()
    await page.getByRole('group', { name: 'Blok kode', exact: true }).getByRole('button', { name: 'Gelap', exact: true }).click()
  }
  await ready(page, source())
  const previewCount = await integrity(page)
  const bytes = await page.pdf({ path: testInfo.outputPath(`document-${paper.toLowerCase()}.pdf`), preferCSSPageSize: true, printBackground: true })
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true })
  const pdf = await task.promise
  expect(pdf.numPages).toBe(previewCount)
  for (let i = 1; i <= pdf.numPages; i++) {
    const sheet = await pdf.getPage(i)
    const viewport = sheet.getViewport({ scale: 1 })
    expect(viewport.width).toBeCloseTo((paper === 'A4' ? 210 : 215.9) / 25.4 * 72, 0)
    expect(viewport.height).toBeCloseTo((paper === 'A4' ? 297 : 279.4) / 25.4 * 72, 0)
    const text = (await sheet.getTextContent()).items.flatMap(item => 'str' in item ? [item.str] : []).join(' ')
    expect(text).toContain(`${i} / ${pdf.numPages}`)
    expect(text).toContain('Dibuat dengan folio')
  }
  const text = (await Promise.all(Array.from({ length: pdf.numPages }, async (_, i) => {
    const sheet = await pdf.getPage(i + 1)
    return (await sheet.getTextContent()).items.flatMap(item => 'str' in item ? [item.str] : []).join(' ')
  }))).join(' ')
  for (let i = 1; i <= 80; i++) {
    expect(text).toContain(`Penanda${i} awal`)
    expect(text).toContain(`Penanda${i} akhir`)
    expect(text).toContain(`Arus${i}`)
  }
  await task.destroy()
})
}

test('export button waits for fonts and prints the current document', async ({ page }) => {
  await expect(page).toHaveTitle('folio. – Markdown to PDF')
  await expect(page.locator('.brand-mark')).toHaveJSProperty('naturalWidth', 48)
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon\.svg$/)
  await page.evaluate(() => {
    window.print = () => {
      window.dispatchEvent(new Event('beforeprint'))
      document.body.dataset.printed = String(document.querySelectorAll('.paper-pages article').length)
    }
  })
  await ready(page, source())
  await page.getByRole('button', { name: 'Ekspor PDF', exact: true }).click()
  await expect(page.locator('body')).toHaveAttribute('data-printed', String(await page.locator('.paper-pages article').count()))
  await expect(page).toHaveTitle('Catatan kreatif')
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
  await expect(page).toHaveTitle('folio. – Markdown to PDF')
})
