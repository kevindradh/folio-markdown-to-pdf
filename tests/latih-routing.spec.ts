import { test, expect } from './fixtures'
import { examples } from '../src/apps/latih/collections'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('latih:guide-completed:v1', 'true'))
})

test('clean page URLs support direct access, client navigation, refresh, and history', async ({ page }) => {
  await page.goto('/latih/')
  await page.evaluate(() => { Object.assign(window, { routingMarker: 'same-document' }) })
  await page.getByRole('link', { name: 'Koleksi', exact: true }).click()
  await expect(page).toHaveURL(/\/latih\/koleksi$/)
  await expect(page.getByRole('link', { name: 'Koleksi', exact: true })).toHaveAttribute('aria-current', 'page')
  expect(await page.evaluate(() => (window as unknown as { routingMarker: string }).routingMarker)).toBe('same-document')
  await page.getByRole('link', { name: 'Template', exact: true }).click()
  await expect(page).toHaveURL(/\/latih\/template$/)
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Koleksi latihan', exact: true })).toBeVisible()
  await page.goForward()
  await expect(page.getByRole('heading', { name: 'Template soal', exact: true })).toBeVisible()
  await page.goto('/latih/panduan')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Panduan penggunaan', exact: true })).toBeVisible()
  await expect(page).toHaveTitle('latih. – Preview')
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/latih.svg')
  await page.getByRole('link', { name: 'Bantuan impor', exact: true }).click()
  await expect(page).toHaveURL(/\/latih\/panduan#bantuan-impor$/)
  expect(await page.getByRole('heading', { name: 'Bantuan impor', exact: true }).evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(900)
})

test('legacy hashes redirect and unavailable routes have an explicit recovery', async ({ page }) => {
  for (const path of ['koleksi', 'template', 'panduan']) {
    await page.goto(`/latih/#${path}`)
    await expect(page).toHaveURL(new RegExp(`/latih/${path}$`))
  }
  await page.goto('/latih/#format-soal')
  await expect(page).toHaveURL(/\/latih\/panduan#format-soal$/)
  await page.goto('/latih/tidak-ada')
  await expect(page.getByText('Halaman tidak ditemukan', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Buka Beranda', exact: true }).click()
  await expect(page).toHaveURL(/\/latih\/$/)
  await page.goto('/latih/latihan/tidak-ada')
  await expect(page.getByText('Latihan tidak ditemukan', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Buka koleksi', exact: true }).click()
  await expect(page).toHaveURL(/\/latih\/koleksi$/)
})

test('existing IndexedDB collection IDs become stable study URLs, including another tab', async ({ page, context }) => {
  await page.goto('/latih/koleksi')
  await page.getByRole('button', { name: 'Impor soal', exact: true }).click()
  await page.getByLabel('JSON latihan').fill(JSON.stringify({ title: 'Latihan dengan URL', type: 'multiple-choice', questions: [{ question: 'Dua ditambah dua?', options: ['Empat', 'Lima'], answer: 0, explanation: 'Hasilnya empat.' }] }))
  await page.getByRole('button', { name: 'Tambahkan koleksi' }).click()
  const card = page.locator('[data-slot="card"]').filter({ hasText: 'Latihan dengan URL' })
  await card.getByRole('button', { name: 'Mulai latihan' }).click()
  await expect(page).toHaveURL(/\/latih\/latihan\/[0-9a-f-]{36}$/)
  const studyUrl = page.url()
  await page.locator('.latih-answer').first().click()
  await page.getByRole('button', { name: 'Periksa jawaban' }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Benar, kamu sudah paham.', exact: true })).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Koleksi latihan', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Koleksi latihan', exact: true })).toBeVisible()
  await page.goForward()
  await expect(page.getByRole('heading', { name: 'Benar, kamu sudah paham.', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Kembali ke koleksi', exact: true }).click()
  await card.getByRole('button', { name: 'Mulai latihan' }).click()
  expect(page.url()).toBe(studyUrl)
  const other = await context.newPage()
  await other.goto(studyUrl)
  await expect(other.getByRole('region', { name: 'Teks soal', exact: true })).toContainText('Dua ditambah dua?')
  await other.close()
})


test('legacy stored collections and active sessions migrate without losing their existing record', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const collection = { title: 'Materi sebelum router', type: 'multiple-choice', questions: [{ question: 'Soal lama', options: ['Ya', 'Tidak'], answer: 0, explanation: 'Pembahasan lama.' }] }
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('latih-library', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('collections', { keyPath: 'id' })
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('collections', 'readwrite')
        tx.objectStore('collections').put({ id: '11111111-1111-4111-8111-111111111111', createdAt: Date.now(), collection })
        tx.oncomplete = () => { db.close(); resolve() }
        tx.onabort = () => { db.close(); reject(tx.error) }
      }
    })
    localStorage.setItem('latih:last-opened:v1', JSON.stringify({ version: 1, collection }))
    sessionStorage.setItem('latih:active-study:v1', JSON.stringify({ version: 1, collection, progress: { index: 0, selected: ['0'], revealed: true, score: 1, panel: 'explanation', expanded: false } }))
  })
  await page.goto('/latih/#beranda')
  await expect(page).toHaveURL(/\/latih\/latihan\/11111111-1111-4111-8111-111111111111$/)
  await expect(page.getByRole('heading', { name: 'Benar, kamu sudah paham.', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Kembali ke koleksi', exact: true }).click()
  await page.getByRole('link', { name: 'Beranda', exact: true }).click()
  await page.reload()
  await expect(page.locator('.latih-last-opened')).toContainText('Materi sebelum router')
})

test('deep links and study reload continue working offline after the production app is cached', async ({ page, context }) => {
  await page.goto('/')
  await expect(page.locator('.pwa-status-label')).toHaveText('Siap digunakan offline')
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await page.goto('/latih/template')
  await expect(page.getByRole('heading', { name: 'Template soal', exact: true })).toBeVisible()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Template soal', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Koleksi', exact: true }).click()
  await page.locator('[data-slot="card"]').filter({ hasText: 'Kosakata sehari-hari' }).getByRole('button', { name: 'Mulai latihan' }).click()
  await expect(page).toHaveURL(/\/latih\/latihan\/contoh-kosakata$/)
  await page.getByRole('button', { name: 'Lihat jawaban', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Ingin tahu', exact: true })).toBeVisible()
})


test('an old example session keeps the built-in stable example URL', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(collection => {
    const legacy = { title: collection.title, type: collection.type, demo: true, questions: collection.questions.map(item => ({ question: item.question, options: item.options, answer: item.answer, explanation: item.explanation, hint: item.hint })) }
    sessionStorage.setItem('latih:active-study:v1', JSON.stringify({ version: 1, collection: legacy, progress: { index: 0, selected: [], revealed: false, score: 0, panel: null, expanded: false } }))
  }, examples[0])
  await page.goto('/latih/')
  await expect(page).toHaveURL(/\/latih\/latihan\/contoh-cara-belajar$/)
  await expect(page.getByRole('region', { name: 'Teks soal', exact: true })).toContainText('Cara mana')
})
