import { readFile } from 'node:fs/promises'
import { test, expect } from './fixtures'

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } })
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.setItem('latih:guide-completed:v1', 'true'))
})

for (const mode of ['modern', 'missing', 'denied'] as const) {
  test(`mobile template copies complete instructions with ${mode} Clipboard API`, async ({ page }) => {
    await page.addInitScript(mode => {
      const calls: { text: string; success: boolean }[] = []
      Object.assign(window, { clipboardCalls: calls })
      const original = document.execCommand.bind(document)
      document.execCommand = (command, showUI, value) => {
        const field = document.querySelector<HTMLTextAreaElement>('[data-clipboard-fallback]')!
        const text = field.value.slice(field.selectionStart, field.selectionEnd)
        const success = original(command, showUI, value)
        calls.push({ text, success })
        return success
      }
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: mode === 'missing' ? undefined : {
        writeText: async (text: string) => {
          if (mode === 'denied') throw new DOMException('Denied', 'NotAllowedError')
          calls.push({ text, success: true })
        },
      } })
    }, mode)
    await page.goto('/latih/template')
    for (const type of ['Pilihan ganda', 'Flashcard']) {
      await page.getByRole('button', { name: type, exact: true }).tap()
      const prompt = await page.locator('.latih-json').innerText()
      const button = page.getByRole('button', { name: 'Salin instruksi dan JSON', exact: true })
      await button.scrollIntoViewIfNeeded()
      const scroll = await page.evaluate(() => scrollY)
      await button.tap()
      await expect(page.getByRole('button', { name: 'Instruksi disalin', exact: true })).toBeVisible()
      expect(await page.evaluate(() => (window as unknown as { clipboardCalls: unknown[] }).clipboardCalls.at(-1))).toEqual({ text: prompt, success: true })
      await expect(page.locator('[data-clipboard-fallback]')).toHaveCount(0)
      expect(await page.evaluate(() => scrollY)).toBe(scroll)
      await expect(page.getByText('Salin teks di atas secara manual; clipboard tidak tersedia.')).toHaveCount(0)
    }
  })
}

test('blocked copy offers a direct retry and a complete instruction download', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new DOMException('Denied', 'NotAllowedError') } } })
    document.execCommand = () => false
  })
  await page.goto('/latih/template')
  const prompt = await page.locator('.latih-json').innerText()
  await page.getByRole('button', { name: 'Salin instruksi dan JSON', exact: true }).tap()
  await expect(page.getByRole('status')).toContainText('Browser memblokir penyalinan.')
  await expect(page.getByRole('button', { name: 'Instruksi disalin', exact: true })).toHaveCount(0)
  await expect(page.locator('[data-clipboard-fallback]')).toHaveCount(0)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Unduh instruksi (.txt)', exact: true }).tap(),
  ])
  expect(download.suggestedFilename()).toBe('latih-instruksi-multiple-choice.txt')
  expect(await readFile((await download.path())!, 'utf8')).toBe(prompt)
  // The retry calls the synchronous fallback directly in the new tap gesture.
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => { throw new Error('Retry must bypass this API') } } })
    document.execCommand = () => true
  })
  await page.getByRole('button', { name: 'Coba salin lagi', exact: true }).tap()
  await expect(page.getByRole('button', { name: 'Instruksi disalin', exact: true })).toBeVisible()
  await expect(page.getByRole('status')).toHaveCount(0)
})
