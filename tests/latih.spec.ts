import { test, expect } from './fixtures'

test('latih preview navigates on desktop and mobile, runs quiz and flashcards', async ({ page }, testInfo) => {
  await page.goto('/latih/')
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`dashboard-${width}.png`), fullPage: true })
    await page.getByRole('link', { name: 'Template', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Template soal' })).toBeVisible()
    await page.getByRole('button', { name: 'Flashcard', exact: true }).click()
    await expect(page.locator('.latih-json')).toContainText('"type": "flashcard"')
    await page.getByRole('link', { name: 'Beranda', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Coba latihan contoh' }).click()
  await expect(page.getByRole('navigation')).toHaveCount(0)
  for (const answer of ['Menguji ingatan secara berkala', 'Memahami alasan jawaban benar', 'Memeriksa pemahaman']) {
    await page.getByRole('button', { name: new RegExp(answer) }).click()
    await page.getByRole('button', { name: 'Periksa jawaban' }).click()
    await expect(page.getByRole('heading', { name: 'Benar, kamu sudah paham.' })).toBeVisible()
    await page.getByRole('button', { name: /Berikutnya|Selesaikan sesi/ }).click()
  }
  await expect(page.getByText('3 dari 3 jawaban benar.')).toBeVisible()
  await page.getByRole('button', { name: 'Kembali ke koleksi' }).click()
  await page.locator('[data-slot="card"]').filter({ hasText: 'Kosakata sehari-hari' }).getByRole('button', { name: 'Mulai belajar' }).click()
  await expect(page.getByRole('heading', { name: 'Curious', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Lihat jawaban' }).click()
  await expect(page.getByRole('heading', { name: 'Ingin tahu', exact: true })).toBeVisible()
})

test('latih validates JSON and imports a collection without changing Folio storage', async ({ page }) => {
  await page.goto('/latih/')
  await page.getByRole('button', { name: 'Impor soal', exact: true }).click()
  await page.getByLabel('JSON latihan').fill('{ invalid }')
  await page.getByRole('button', { name: 'Tambahkan koleksi' }).click()
  await expect(page.getByText('JSON belum valid. Periksa koma, tanda kutip, dan kurungnya.')).toBeVisible()
  await page.getByLabel('JSON latihan').fill(JSON.stringify({ title: 'Materi uji', type: 'multiple-choice', questions: [{ question: 'Dua ditambah dua?', options: ['Tiga', 'Empat'], answer: 1, explanation: '2 + 2 = 4.' }] }))
  await page.getByRole('button', { name: 'Tambahkan koleksi' }).click()
  const collection = page.locator('[data-slot="card"]').filter({ hasText: 'Materi uji' })
  await expect(collection).toContainText('Impor pribadi')
  await collection.getByRole('button', { name: 'Mulai belajar' }).click()
  await page.getByRole('button', { name: /Empat/ }).click()
  await page.getByRole('button', { name: 'Periksa jawaban' }).click()
  await expect(page.getByText('2 + 2 = 4.')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('folio:draft:v1'))).toBeNull()
})
