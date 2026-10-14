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

test('multiple choice renders Markdown and LaTeX safely in questions, options, and explanations', async ({ page }, testInfo) => {
  const data = {
    title: 'Fisika dan matematika', type: 'multiple-choice', questions: [
      { question: '**Hukum II Newton**\n\nBenda bermassa $m = 2\\,\\mathrm{kg}$ memiliki percepatan $a = 3\\,\\mathrm{m/s^2}$.\n\n- Gunakan rumus gaya.\n- Abaikan gesekan.\n\n$$\nF = ma\n$$\n\n<img src=x onerror="window.latihInjected=true">',
        options: ['**A.** $F = 3\\,\\mathrm{N}$', '**B.** $F = 6\\,\\mathrm{N}$\n\n[Referensi](https://example.com)', '`F = 9 N`', '$F = 12\\,\\mathrm{N}$'], answer: 1,
        explanation: '**Pembahasan**\n\n$$\nF = ma = 2 \\times 3 = 6\\,\\mathrm{N}\n$$\n\n| Besaran | Nilai |\n|---|---|\n| Gaya | $6\\,\\mathrm{N}$ |\n\nKode literal: `$x$`.' },
      { question: 'Rumus yang salah: $\\frac{1}{$\n\nRumus panjang: $' + 'x+'.repeat(1050) + 'x$', options: ['Tetap dapat memilih', 'Pilihan kedua'], answer: 0, explanation: 'Sumber rumus ditampilkan ketika tidak dapat dirender.' },
    ],
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/latih/')
  await page.getByRole('button', { name: 'Impor soal', exact: true }).click()
  await page.getByLabel('JSON latihan').fill(JSON.stringify(data))
  await page.getByRole('button', { name: 'Tambahkan koleksi' }).click()
  await page.locator('[data-slot="card"]').filter({ hasText: data.title }).getByRole('button', { name: 'Mulai belajar' }).click()
  const question = page.getByRole('region', { name: 'Teks soal' })
  await expect(question.locator('strong')).toHaveText('Hukum II Newton')
  await expect(question.locator('li')).toHaveCount(2)
  await expect(question.locator('.katex')).toHaveCount(3)
  await expect(question.locator('img, script')).toHaveCount(0)
  await expect(page.locator('.latih-answer a')).toHaveCount(0)
  await expect(page.locator('.latih-answer').nth(1).locator('strong')).toHaveText('B.')
  const correct = page.locator('.latih-answer').nth(1)
  await correct.focus()
  await page.keyboard.press('Enter')
  await expect(correct).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Periksa jawaban' }).click()
  await expect(page.locator('.latih-explanation .katex')).toHaveCount(2)
  await expect(page.locator('.latih-explanation table')).toHaveCount(1)
  await expect(page.locator('.latih-explanation code')).toHaveText('$x$')
  expect(await page.evaluate(() => 'latihInjected' in window)).toBe(false)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('math-question-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'Berikutnya' }).click()
  await expect(page.locator('.latih-question-content .katex-error')).toHaveCount(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('.latih-answer').first().click()
  await page.getByRole('button', { name: 'Periksa jawaban' }).click()
  await expect(page.getByRole('heading', { name: 'Benar, kamu sudah paham.' })).toBeVisible()
})
