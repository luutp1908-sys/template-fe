export const getApiBase = (): string => {
  const env = (import.meta as any).env || {}
  const envBase = env.VITE_API_ORIGIN || env.VITE_API_BASE || env.VITE_APP_API_URL
  if (envBase) return envBase
  const proto = window.location.protocol
  const host = window.location.hostname
  return `${proto}//${host}:4000`
}

// Generic API response wrapper
export type ApiResponse<T = any> = T

let authHeaderGetter: (() => string | null) | null = null

export function setAuthHeaderGetter(getter: () => string | null) {
  authHeaderGetter = getter
}

export function getAuthHeaderValue(): string | null {
  return authHeaderGetter ? authHeaderGetter() : null
}

let refreshHandler: (() => Promise<boolean>) | null = null
export function setRefreshHandler(fn: (() => Promise<boolean>) | null) {
  refreshHandler = fn
}

export function parseError(err: unknown): string {
  try {
    return typeof err === 'string' ? err : (err && (err as any).message) ? String((err as any).message) : String(err)
  } catch {
    return 'Unknown error'
  }
}

export async function fetchJson<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const base = getApiBase()
  const url = new URL(path, base).toString()

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  const token = getAuthHeaderValue()
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
      const retryToken = getAuthHeaderValue()
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

export async function fetchBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const base = getApiBase()
  const url = new URL(path, base).toString()

  const headers: Record<string, string> = {
    Accept: 'application/pdf, application/octet-stream, */*',
    ...(options.headers as Record<string, string> || {}),
  }

  const token = getAuthHeaderValue()
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
    const refreshed = await refreshHandler()
    if (refreshed) {
      const retryToken = getAuthHeaderValue()
      if (retryToken) {
        init.headers = { ...(init.headers as Record<string, string>), Authorization: `Bearer ${retryToken}` }
      }
      const retry = await fetch(url, init)
      if (!retry.ok) {
        const text = await retry.text().catch(() => '')
        throw new Error(`${retry.status} ${retry.statusText} ${text}`)
      }
      return retry.blob()
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText} ${text}`)
  }

  return res.blob()
}

export async function postJson<T = any>(path: string, body: any, options: RequestInit = {}) {
  return fetchJson<T>(path, { method: 'POST', body: JSON.stringify(body), ...options })
}

export async function patchJson<T = any>(path: string, body: any, options: RequestInit = {}) {
  return fetchJson<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...options })
}

export async function putJson<T = any>(path: string, body: any, options: RequestInit = {}) {
  return fetchJson<T>(path, { method: 'PUT', body: JSON.stringify(body), ...options })
}

export default { getApiBase, fetchJson, postJson, patchJson, putJson, setAuthHeaderGetter, setRefreshHandler, parseError }
