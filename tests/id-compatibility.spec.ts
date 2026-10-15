import { test, expect } from './fixtures'
import { createId } from '../src/lib/create-id'

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: undefined }))
})

test('UUID fallback keeps v4 format and produces distinct identifiers', async ({ page }) => {
  await page.goto('/latih/')
  const ids: string[] = []
  // Execute the production helper against the browser crypto implementation.
  for (let i = 0; i < 100; i++) ids.push(await page.evaluate(createId))
  expect(new Set(ids).size).toBe(ids.length)
  for (const id of ids) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
})

test('first visit, guide identity, local documents and quiz import work without randomUUID', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await page.locator('#markdown-editor').fill('# Dokumen perangkat baru')
  await expect(page.locator('#draft-status')).toHaveText('Draft tersimpan')
  await expect.poll(() => page.evaluate(async () => {
    const request = indexedDB.open('folio-library')
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
    try {
      const read = db.transaction('documents').objectStore('documents').getAll()
      const docs = await new Promise<unknown[]>((resolve, reject) => { read.onsuccess = () => resolve(read.result); read.onerror = () => reject(read.error) })
      return JSON.stringify(docs).includes('Dokumen perangkat baru')
    } finally { db.close() }
  })).toBe(true)
  await page.goto('/latih/')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('latih:guide-identity:v1'))).toMatch(/^[0-9a-f-]{36}$/)
  await page.evaluate(() => localStorage.setItem('latih:guide-completed:v1', 'true'))
  await page.reload()
  await page.getByRole('button', { name: 'Impor soal', exact: true }).click()
  await page.getByLabel('JSON latihan').fill(JSON.stringify({ title: 'Materi perangkat baru', type: 'multiple-choice', questions: [{ question: 'Satu tambah satu?', options: ['Dua', 'Tiga'], answer: 0, explanation: 'Jawabannya dua.' }] }))
  await page.getByRole('button', { name: 'Tambahkan koleksi', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.reload()
  await page.locator('[data-slot="card"]').filter({ hasText: 'Materi perangkat baru' }).getByRole('button', { name: 'Mulai latihan' }).click()
  await expect(page).toHaveURL(/\/latih\/latihan\/[0-9a-f-]{36}$/)
  await page.locator('.latih-answer').first().click()
  await page.getByRole('button', { name: 'Periksa jawaban', exact: true }).click()
  await expect(page.locator('.latih-explanation')).toContainText('Jawabannya dua.')
  expect(errors).toEqual([])
})
