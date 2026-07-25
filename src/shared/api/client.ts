export const getApiBase = (): string => {
  const env = (import.meta as any).env || {}
  const envBase = env.VITE_API_ORIGIN || env.VITE_API_BASE || env.VITE_APP_API_URL
  if (envBase) return envBase
  const proto = window.location.protocol
  const host = window.location.hostname
  return `${proto}//${host}:4000`
}

let authHeaderGetter: (() => string | null) | null = null

export function setAuthHeaderGetter(getter: () => string | null) {
  authHeaderGetter = getter
}

let refreshHandler: (() => Promise<boolean>) | null = null
export function setRefreshHandler(fn: (() => Promise<boolean>) | null) {
  refreshHandler = fn
}

export async function fetchJson(path: string, options: RequestInit = {}) {
  const base = getApiBase()
  const url = new URL(path, base).toString()

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  const token = authHeaderGetter ? authHeaderGetter() : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const init: RequestInit = {
    credentials: 'include',
    headers,
    ...options,
  }

  const res = await fetch(url, init)
  if (res.status === 401 && refreshHandler) {
    // try to refresh tokens once
    const refreshed = await refreshHandler()
    if (refreshed) {
      // retry with new token
      const retryToken = authHeaderGetter ? authHeaderGetter() : null
      if (retryToken) {
        init.headers = { ...(init.headers as Record<string, string>), Authorization: `Bearer ${retryToken}` }
      }
      const retry = await fetch(url, init)
      if (!retry.ok) {
        const text = await retry.text().catch(() => '')
        throw new Error(`${retry.status} ${retry.statusText} ${text}`)
      }
      return retry.json()
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

export async function postJson(path: string, body: any, options: RequestInit = {}) {
  return fetchJson(path, { method: 'POST', body: JSON.stringify(body), ...options })
}

export async function patchJson(path: string, body: any, options: RequestInit = {}) {
  return fetchJson(path, { method: 'PATCH', body: JSON.stringify(body), ...options })
}

export default { getApiBase, fetchJson, postJson, patchJson, setAuthHeaderGetter }
