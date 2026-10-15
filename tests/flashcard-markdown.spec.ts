import { test, expect } from './fixtures'
import { parseCollection, promptFor, templateFor } from '../src/apps/latih/collections'

test('AI prompts include valid JSON examples and math rules for both formats', () => {
  for (const type of ['multiple-choice', 'flashcard'] as const) {
    const prompt = promptFor(type)
    expect(prompt).toContain('Markdown dan LaTeX')
    expect(prompt).toContain('Jangan bungkus rumus dengan backtick')
    const field = prompt.match(/Contoh field JSON: (.+)\. Jangan menulis/)![1]
    expect(JSON.parse(`{${field}}`).answer).toBe('$\\frac{a}{b}$')
    const template = templateFor(type)
    expect(prompt).toContain(template)
    const collection = parseCollection(template)
    expect(collection.questions[0].explanation).toContain('$$\n')
    expect(Array.from(collection.questions[0].explanation).some(char => char.charCodeAt(0) < 32 && !['\n', '\r', '\t'].includes(char))).toBe(false)
    if (type === 'flashcard') expect(collection.questions[0].answer).toBe('$L = \\pi r^2$')
  }
})

test('flashcards render Markdown and math on both faces, hints and explanations', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('latih:guide-completed:v1', 'true'))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/latih/template')
  await page.getByRole('button', { name: 'Flashcard', exact: true }).click()
  await expect(page.locator('.latih-json')).toContainText('Markdown dan LaTeX')
  const collection = JSON.parse(templateFor('flashcard'))
  collection.title = 'Kartu rumus'
  collection.questions[0] = {
    question: '**Pecahan**\n\nHitung $\\frac{1}{2} + \\frac{1}{2}$.',
    answer: '\\[\n\\frac{1}{2} + \\frac{1}{2} = 1\n\\]',
    hint: 'Gunakan **penyebut sama**: \\(\\sqrt{4}=2\\).',
    explanation: '**Hasil**\n\n| Nilai | Rumus |\n|---|---|\n| Satu | $1^2 = 1$ |\n\nKode literal: `$x$`.\n\n<script>window.flashcardInjected=true</script>\n\n[Buruk](javascript:alert(1))',
  }
  await page.getByRole('button', { name: 'Impor soal', exact: true }).click()
  await page.getByLabel('JSON latihan').fill(JSON.stringify(collection))
  await page.getByRole('button', { name: 'Tambahkan koleksi', exact: true }).click()
  await page.locator('[data-slot="card"]').filter({ hasText: collection.title }).getByRole('button', { name: 'Mulai latihan' }).click()
  await expect(page.locator('.latih-flashcard-primary strong')).toHaveText('Pecahan')
  await expect(page.locator('.latih-flashcard-primary .katex')).toHaveCount(1)
  await expect(page.locator('.latih-flashcard-answer')).toHaveCount(0)
  await page.getByRole('button', { name: 'Petunjuk', exact: true }).click()
  await expect(page.locator('.latih-flashcard-hint strong')).toHaveText('penyebut sama')
  await expect(page.locator('.latih-flashcard-hint .katex')).toHaveCount(1)
  await page.getByRole('button', { name: 'Lihat jawaban', exact: true }).click()
  await expect(page.locator('.latih-flashcard-answer .katex-display')).toHaveCount(1)
  await expect(page.locator('.latih-flashcard-context table .katex')).toHaveCount(1)
  await expect(page.locator('.latih-flashcard-context code')).toHaveText('$x$')
  await expect(page.locator('.latih-flashcard script, .latih-flashcard a[href^="javascript:"]')).toHaveCount(0)
  expect(await page.evaluate(() => 'flashcardInjected' in window)).toBe(false)
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const action = await page.getByRole('button', { name: 'Selesaikan sesi', exact: true }).boundingBox()
    expect(action!.y + action!.height).toBeLessThanOrEqual(844)
    if (width !== 320) await page.screenshot({ path: testInfo.outputPath(`flashcard-math-${width}.png`) })
  }
  await page.reload()
  await expect(page.locator('.latih-flashcard-answer .katex')).toHaveCount(1)
  await page.getByRole('button', { name: 'Lihat pertanyaan', exact: true }).click()
  await expect(page.locator('.latih-flashcard-primary .katex')).toHaveCount(1)
  await expect(page.locator('.latih-flashcard-answer')).toHaveCount(0)
})
