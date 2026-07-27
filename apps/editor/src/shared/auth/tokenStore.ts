type Tokens = {
  accessToken: string | null
  refreshToken: string | null
  user: any | null
}

const STORAGE_KEY = 'app_auth_tokens_v1'

let cache: Tokens = {
  accessToken: null,
  refreshToken: null,
  user: null,
}

const listeners = new Set<() => void>()

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    // only restore the public `user` profile from storage
    cache.user = parsed.user || null
  } catch {
    // ignore
  }
}

function saveToStorage() {
  try {
    // persist only the `user` profile to avoid storing secrets in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: cache.user }))
  } catch {
    // ignore
  }
}

loadFromStorage()

// Initialize tokenStore wiring with API client. Call from application bootstrap
// (e.g. in `src/main.tsx`) to avoid circular module initialization.
export function initAuthClient(client: { setAuthHeaderGetter?: (fn: () => string | null) => void } | null) {
  if (!client) return
  if (typeof client.setAuthHeaderGetter === 'function') {
    client.setAuthHeaderGetter(() => getAccessToken())
  }
}

export function setTokens(payload: Partial<Tokens>) {
  cache = { ...cache, ...payload }
  saveToStorage()
  listeners.forEach((l) => l())
}

export function clearTokens() {
  cache = { accessToken: null, refreshToken: null, user: null }
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
  listeners.forEach((l) => l())
}

export function getAccessToken() {
  return cache.accessToken
}

export function getRefreshToken() {
  return cache.refreshToken
}

export function getUser() {
  return cache.user
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Attempt a silent refresh using server-set httpOnly cookie to obtain an access token.
export async function initAuth(): Promise<boolean> {
  // avoid duplicate refresh calls when initAuth is invoked multiple times
  // or when called concurrently during app bootstrap
  if ((initAuth as any)._done) return true
  if ((initAuth as any)._promise) return (initAuth as any)._promise as Promise<boolean>

  const p = (async () => {
    try {
      // dynamic import to avoid circular deps at module init
      const client = await import('../api/client')
      const res = await client.postJson('/api/v1/auth/refresh', {})
      const body = (res && (res.data ?? res)) as any
      const accessToken = body?.accessToken ?? null
      const userObj = body?.user ?? cache.user
      cache.accessToken = accessToken
      cache.user = userObj
      // persist only user
      saveToStorage()
      listeners.forEach((l) => l())
      ;(initAuth as any)._done = true
      return true
    } catch {
      return false
    } finally {
      delete (initAuth as any)._promise
    }
  })()

  ;(initAuth as any)._promise = p
  return p
}

export default { setTokens, clearTokens, getAccessToken, getRefreshToken, getUser, subscribe }
