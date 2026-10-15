import { readFile } from 'node:fs/promises'
import { test, expect } from './fixtures'
import { parseCollection, templateFor, promptFor } from '../src/apps/latih/collections'

test('imports complete AI code blocks without changing JSON string escapes', () => {
  const source = templateFor('multiple-choice')
  const expected = parseCollection(source)
  for (const fence of ['```json', '```JSON', '```']) {
    expect(parseCollection(`\ufeff \n${fence}\r\n${source}\r\n\x60\x60\x60 \n`)).toEqual(expected)
  }
  expect(() => parseCollection(`Here is JSON:\n\x60\x60\x60json\n${source}\n\x60\x60\x60`)).toThrow()
  expect(() => parseCollection(`\x60\x60\x60json\n${source}\n\x60\x60\x60\n\x60\x60\x60json\n${source}\n\x60\x60\x60`)).toThrow()
  expect(() => parseCollection('```json\n' + ' '.repeat(102400) + '\n```')).toThrow('100 KiB')
  for (const type of ['flashcard', 'multiple-choice'] as const) {
    const prompt = promptFor(type)
    expect(prompt).toContain('tombol salin kode di ponsel')
    const fenced = prompt.match(/```json\n[\s\S]*\n```$/)![0]
    expect(parseCollection(fenced)).toEqual(parseCollection(templateFor(type)))
    const matrixField = prompt.match(/Contoh field JSON: ("question": .+)\. Setelah JSON/)![1]
    expect(JSON.parse(`{${matrixField}}`).question).toBe('$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$')
  }
  expect(() => parseCollection(String.raw`{"title":"Matriks","type":"flashcard","questions":[{"question":"$\begin{pmatrix}1\end{pmatrix}$","answer":"1","explanation":""}]}`)).toThrow('escape backslash LaTeX')
})

test('copied matrix JSON renders matrices after paste, import and reload', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('latih:guide-completed:v1', 'true'))
  await page.setViewportSize({ width: 390, height: 844 })
  const source = await readFile('docs/examples/matriks-diperbaiki.json', 'utf8')
  await page.goto('/latih/koleksi')
  await page.getByRole('button', { name: 'Impor soal', exact: true }).click()
  await page.getByLabel('JSON latihan').fill('```json\n' + source + '\n```')
  await page.getByRole('button', { name: 'Tambahkan koleksi', exact: true }).click()
  const card = page.locator('[data-slot="card"]').filter({ hasText: 'Matematika Dasar: Pengenalan dan Operasi Matriks' })
  await expect(card).toBeVisible()
  await page.reload()
  await card.getByRole('button', { name: 'Mulai latihan', exact: true }).click()
  await expect(page.locator('.latih-question-content .katex')).toHaveCount(2)
  await expect(page.locator('.latih-question-content .mtable')).toHaveCount(1)
  await expect(page.locator('.latih-answer .katex')).toHaveCount(4)
  await expect(page.locator('.katex-error')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
