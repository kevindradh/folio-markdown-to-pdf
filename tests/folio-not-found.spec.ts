import { test, expect } from './fixtures'

test('unknown Folio URLs show a responsive 404 and return to the existing document', async ({ page }, testInfo) => {
  await page.goto('/')
  const editor = page.getByRole('textbox', { name: 'Editor Markdown', exact: true })
  await editor.fill('# Dokumen tetap ada\n\nIsi sebelum membuka halaman yang salah.')
  await expect(page.getByText('Draft tersimpan', { exact: true })).toBeVisible()
  await page.goto('/halaman-tidak-ada')
  await expect(page.getByRole('heading', { name: 'Halaman tidak ditemukan', exact: true })).toBeVisible()
  await expect(page).toHaveTitle('Halaman tidak ditemukan – folio.')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Halaman tidak ditemukan', exact: true })).toBeVisible()
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 390) await page.screenshot({ path: testInfo.outputPath('folio-404-mobile.png') })
  }
  await page.getByRole('link', { name: 'Kembali ke Folio', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page).toHaveTitle('folio. – Markdown to PDF')
  await expect(editor).toHaveValue('# Dokumen tetap ada\n\nIsi sebelum membuka halaman yang salah.')
})

test('latih uses the same not-found layout with its own brand and recovery destination', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('latih:guide-completed:v1', 'true'))
  await page.goto('/latih/halaman-tidak-ada')
  await expect(page.getByRole('heading', { name: 'Halaman tidak ditemukan', exact: true })).toBeVisible()
  await expect(page.locator('.app-not-found.latih-shell')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Beranda latih', exact: true }).locator('img')).toHaveAttribute('src', '/latih.svg')
  await expect(page).toHaveTitle('Halaman tidak ditemukan – latih.')
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 390) await page.screenshot({ path: testInfo.outputPath('latih-404-mobile.png') })
  }
  await page.getByRole('link', { name: 'Buka Beranda', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Beranda', exact: true })).toBeVisible()
  await expect(page).toHaveTitle('latih. – Preview')
})
