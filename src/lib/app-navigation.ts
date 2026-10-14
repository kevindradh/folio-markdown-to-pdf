export type Application = 'folio' | 'latih'
const transitionKey = 'folio:app-transition:v1'

export function markAppTransition(application: Application) {
  try { sessionStorage.setItem(transitionKey, application) } catch { /* Navigation still works without session storage. */ }
}

export function consumeAppTransition(application: Application) {
  try {
    const target = sessionStorage.getItem(transitionKey)
    sessionStorage.removeItem(transitionKey)
    return target === application
  } catch { return false }
}
