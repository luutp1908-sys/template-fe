export const getApiBase = (): string => {
  const env = (import.meta as any).env || {}
  const envBase = env.VITE_API_ORIGIN || env.VITE_API_BASE || env.VITE_APP_API_URL
  if (envBase) return envBase
  const proto = window.location.protocol
  const host = window.location.hostname
  return `${proto}//${host}:4000`
}

export async function fetchJson(path: string, options: RequestInit = {}) {
  const base = getApiBase()
  const url = new URL(path, base).toString()

  const init: RequestInit = {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  }

  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

export default { getApiBase, fetchJson }
