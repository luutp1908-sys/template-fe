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
    cache = {
      accessToken: parsed.accessToken || null,
      refreshToken: parsed.refreshToken || null,
      user: parsed.user || null,
    }
  } catch {
    // ignore
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // ignore
  }
}

loadFromStorage()

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

export default { setTokens, clearTokens, getAccessToken, getRefreshToken, getUser, subscribe }
