import { test as base } from '@playwright/test'

// Existing feature tests represent users who have already dismissed the tour.
// coachmark.spec.ts uses the unmodified Playwright fixture for first visits.
export const test = base.extend({
  context: async ({ context }, runFixture) => {
    await context.addInitScript(() => {
      try { localStorage.setItem('folio:tour:v1', 'done') } catch { /* Storage failure scenarios. */ }
    })
    await runFixture(context)
  },
})
export { expect, type Page } from '@playwright/test'
