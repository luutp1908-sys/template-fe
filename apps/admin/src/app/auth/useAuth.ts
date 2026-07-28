let currentAccessToken: string | null = null

type ApiEnvelope<T> = {
  success: boolean
  data: T
  timestamp: string
}

type AuthUser = {
  id: string
  email: string
  displayName: string | null
  roles: string[]
  permissions: string[]
}

type AuthPayload = {
  accessToken: string
  tokenType: string
  accessTokenExpiresIn: string
  user: AuthUser
}

try {
  const saved = sessionStorage.getItem('admin_access_token')
  if (saved) currentAccessToken = saved
} catch {}

export async function loginAdmin(email: string, password: string) {
  const base = import.meta.env.VITE_BE_API_BASE || 'http://localhost:4000'
  const url = `${base}/api/v1/auth/login`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(txt || 'Login failed')
  }

  const body = (await res.json()) as ApiEnvelope<AuthPayload>
  currentAccessToken = body?.data?.accessToken ?? null
  try {
    if (currentAccessToken) sessionStorage.setItem('admin_access_token', currentAccessToken)
  } catch {}

  return fetchCurrentUser()
}

export async function fetchCurrentUser() {
  const base = import.meta.env.VITE_BE_API_BASE || 'http://localhost:4000'
  const headers: Record<string, string> = {}
  if (currentAccessToken) headers['Authorization'] = `Bearer ${currentAccessToken}`

  const res = await fetch(`${base}/api/v1/auth/me`, { credentials: 'include', headers })
  if (res.ok) {
    const body = (await res.json()) as ApiEnvelope<AuthUser>
    return body?.data ?? null
  }

  // if unauthorized, try to refresh tokens once and retry
  if (res.status === 401) {
    const refreshed = await refreshTokens()
    if (!refreshed) {
      logoutAdmin()
      return null
    }
    // refresh response includes user context; return immediately if present
    if (refreshed.user) return refreshed.user
    // otherwise retry /me with new token
    const headers2: Record<string, string> = {}
    if (currentAccessToken) headers2['Authorization'] = `Bearer ${currentAccessToken}`
    const res2 = await fetch(`${base}/api/v1/auth/me`, { credentials: 'include', headers: headers2 })
    if (!res2.ok) {
      logoutAdmin()
      return null
    }
    const body2 = (await res2.json()) as ApiEnvelope<AuthUser>
    return body2?.data ?? null
  }

  return null
}

async function refreshTokens() {
  const base = import.meta.env.VITE_BE_API_BASE || 'http://localhost:4000'
  try {
    const res = await fetch(`${base}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    })
    if (!res.ok) return null
    const body = (await res.json()) as ApiEnvelope<AuthPayload>
    const token = body?.data?.accessToken ?? null
    if (token) {
      currentAccessToken = token
      try {
        sessionStorage.setItem('admin_access_token', token)
      } catch {}
    }
    return body?.data ?? null
  } catch {
    return null
  }
}

export function logoutAdmin() {
  currentAccessToken = null
  try {
    sessionStorage.removeItem('admin_access_token')
  } catch {}
}
