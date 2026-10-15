import { test, expect } from './fixtures'

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`flashcard deck flips accessibly with ${reducedMotion} motion`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion })
    await page.addInitScript(() => localStorage.setItem('latih:guide-completed:v1', 'true'))
    await page.goto('/latih/koleksi')
    await page.getByRole('button', { name: 'Impor soal', exact: true }).click()
    await expect(page.getByRole('dialog')).not.toHaveCSS('animation-name', 'latih-sheet-enter')
    await page.getByLabel('JSON latihan').fill(JSON.stringify({ title: 'Kartu konsep', type: 'flashcard', questions: [
      { question: '**Energi kinetik**\n\nApa hubungan massa dan kecepatan dengan energi kinetik?\n\n[Sumber](https://example.com)', answer: '$E_k = \\frac{1}{2}mv^2$', hint: 'Perhatikan **kuadrat kecepatan**.', explanation: 'Energi bertambah sebanding dengan massa.\n\n' + 'Jika kecepatannya dua kali, energinya empat kali.\n\n'.repeat(25) },
      { question: 'Kartu kedua', answer: 'Jawaban kedua', explanation: '' },
    ] }))
    await page.getByRole('button', { name: 'Tambahkan koleksi', exact: true }).click()
    await page.locator('[data-slot="card"]').filter({ hasText: 'Kartu konsep' }).getByRole('button', { name: 'Mulai latihan' }).click()
    const stage = page.getByRole('main', { name: 'Latihan flashcard' })
    const rotor = page.locator('.latih-flashcard-rotor')
    const front = page.locator('.latih-flashcard[data-face=question]')
    const back = page.locator('.latih-flashcard[data-face=answer]')
    await expect(back).toHaveAttribute('inert', '')
    await expect(page.getByRole('region', { name: 'Jawaban kartu', exact: true })).toHaveCount(0)
    await page.getByRole('button', { name: 'Petunjuk', exact: true }).click()
    const hintSheet = page.getByRole('dialog', { name: 'Petunjuk', exact: true })
    await expect(hintSheet.locator('strong')).toHaveText('kuadrat kecepatan')
    if (reducedMotion === 'no-preference') {
      await expect(hintSheet).toHaveCSS('animation-name', 'latih-sheet-enter')
      const positions = await hintSheet.evaluate(element => {
        const animation = element.getAnimations().find(item => item instanceof CSSAnimation && item.animationName === 'latih-sheet-enter')!
        animation.pause()
        animation.currentTime = 0
        const start = element.getBoundingClientRect()
        animation.currentTime = 280
        const end = element.getBoundingClientRect()
        animation.play()
        return { startY: start.y, endY: end.y, height: end.height, startX: start.x, endX: end.x }
      })
      expect(positions.startY - positions.endY).toBeCloseTo(positions.height, 0)
      expect(positions.startX).toBeCloseTo(positions.endX, 0)
    } else {
      await expect(hintSheet).toHaveCSS('animation-name', 'none')
    }
    await expect(front).not.toContainText('Perhatikan kuadrat kecepatan')
    await page.reload()
    await expect(hintSheet).toBeVisible()
    await expect(rotor).toHaveAttribute('data-revealed', 'false')
    await hintSheet.getByRole('button', { name: 'Kembali ke kartu', exact: true }).click()
    await expect(hintSheet).toBeHidden()
    if (reducedMotion === 'reduce') await expect(rotor).toHaveCSS('transition-duration', '0s')
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      const card = await front.boundingBox()
      expect(card!.height).toBeGreaterThan(280)
      expect(card!.width).toBeGreaterThan(width === 1280 ? 600 : 250)
      if (width < 600) {
        const action = await page.getByRole('button', { name: 'Lihat jawaban', exact: true }).boundingBox()
        expect(action!.width).toBeGreaterThan(width * .4)
        const hint = await page.getByRole('button', { name: 'Petunjuk', exact: true }).boundingBox()
        expect(hint!.width).toBeCloseTo(action!.width, 0)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (reducedMotion === 'no-preference' && width !== 320) await page.screenshot({ path: testInfo.outputPath(`deck-front-${width}.png`) })
    }
    await stage.focus()
    await page.keyboard.press('Space')
    await expect(rotor).toHaveAttribute('data-revealed', 'true')
    if (reducedMotion === 'no-preference') await expect(page.getByRole('button', { name: 'Berikutnya', exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Berikutnya', exact: true })).toBeEnabled()
    await expect(front).toHaveAttribute('inert', '')
    await expect(front).toHaveAttribute('aria-hidden', 'true')
    await expect(page.getByRole('link', { name: 'Sumber', exact: true })).toHaveCount(0)
    await expect(back.locator('.katex')).toHaveCount(1)
    await expect(back).not.toContainText('Energi bertambah sebanding dengan massa.')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      const action = await page.getByRole('button', { name: 'Berikutnya', exact: true }).boundingBox()
      const icon = await page.getByRole('button', { name: 'Lihat pertanyaan', exact: true }).boundingBox()
      const card = await back.boundingBox()
      expect(icon!.x).toBeGreaterThan(card!.x + card!.width * .75)
      expect(icon!.y).toBeLessThan(card!.y + 60)
      expect(action!.y + action!.height).toBeLessThanOrEqual(844)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect(await back.locator('.latih-flashcard-body').evaluate(element => element.scrollHeight > element.clientHeight)).toBe(false)
      if (reducedMotion === 'no-preference' && width !== 320) await page.screenshot({ path: testInfo.outputPath(`deck-back-${width}.png`) })
    }
    // Older sessions set this panel on reveal even though no sheet existed.
    await page.evaluate(() => {
      const snapshot = JSON.parse(sessionStorage.getItem('latih:active-study:v1')!)
      snapshot.progress.panel = 'explanation'
      delete snapshot.progress.flashcardExplanationOpened
      sessionStorage.setItem('latih:active-study:v1', JSON.stringify(snapshot))
    })
    await page.reload()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.getByRole('button', { name: 'Penjelasan', exact: true }).click()
    const sheet = page.getByRole('dialog', { name: 'Penjelasan', exact: true })
    await expect(sheet).toContainText('Energi bertambah sebanding dengan massa.')
    expect(await sheet.locator('.latih-quiz-sheet-content').evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 844 })
      const bounds = await sheet.boundingBox()
      expect(bounds!.width).toBeLessThanOrEqual(760)
      await expect.poll(async () => { const box = await sheet.boundingBox(); return Math.abs(box!.y + box!.height - 844) }).toBeLessThan(.5)
      if (reducedMotion === 'no-preference') await page.screenshot({ path: testInfo.outputPath(`explanation-sheet-${width}.png`) })
    }
    await sheet.getByRole('button', { name: 'Perluas', exact: true }).click()
    await page.reload()
    await expect(sheet).toHaveAttribute('data-expanded', 'true')
    await sheet.getByRole('button', { name: 'Kembali ke kartu', exact: true }).click()
    await expect(sheet).toBeHidden()
    await page.reload()
    await expect(sheet).toBeHidden()
    await expect(rotor).toHaveAttribute('data-revealed', 'true')
    await expect(rotor).toHaveAttribute('data-turning', 'false')
    expect(await rotor.evaluate(element => element.getAnimations().length)).toBe(0)
    await page.getByRole('button', { name: 'Lihat pertanyaan', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Lihat jawaban', exact: true })).toBeEnabled()
    await expect(back).toHaveAttribute('inert', '')
    await expect(back).toBeHidden()
    await stage.focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('button', { name: 'Berikutnya', exact: true })).toBeEnabled()
    if (reducedMotion === 'no-preference') {
      await page.addStyleTag({ content: '.latih-flashcard-sheet[data-closed] { animation-duration: 1s !important; }' })
      await page.getByRole('button', { name: 'Penjelasan', exact: true }).click()
      await sheet.getByRole('button', { name: 'Berikutnya', exact: true }).click()
      await expect(sheet).toHaveAttribute('data-closed', '')
      await expect(sheet).toHaveCSS('animation-name', 'latih-sheet-exit')
      await expect(sheet).toContainText('Energi bertambah sebanding dengan massa.')
      await expect(sheet).toBeHidden()
    } else {
      await stage.focus()
      await page.keyboard.press('Space')
    }
    await expect(rotor).toHaveAttribute('data-revealed', 'false')
    await expect(page.getByRole('region', { name: 'Pertanyaan kartu', exact: true })).toContainText('Kartu kedua')
    await expect(page.locator('.latih-flashcard-answer')).toHaveCount(0)
  })
}
