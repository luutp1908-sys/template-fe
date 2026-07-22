import { useEffect, useState } from 'react'
import client, { fetchJson, postJson, setAuthHeaderGetter, setRefreshHandler } from '../api/client'
import tokenStore, { clearTokens, getAccessToken, getRefreshToken, setTokens, subscribe } from '../auth/tokenStore'

type SignInPayload = { email: string; password: string }
type SignUpPayload = { email: string; password: string; displayName?: string }

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(tokenStore.getUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // register auth header getter so client includes Authorization header
  useEffect(() => {
    setAuthHeaderGetter(() => tokenStore.getAccessToken())
    setRefreshHandler(async () => {
      try {
        await refresh()
        return true
      } catch {
        return false
      }
    })
    const unsub = subscribe(() => {
      // update local user when tokenStore changes
      setUser(tokenStore.getUser())
    })
    return () => {
      unsub()
      setAuthHeaderGetter(() => null)
      setRefreshHandler(null)
    }
  }, [])

  const signIn = async (payload: SignInPayload) => {
    setLoading(true)
    setError(null)
    try {
      const body = await postJson('/api/v1/auth/login', payload)
      const auth = body as any
      const accessToken = auth?.accessToken ?? null
      const userObj = auth?.user ?? null
      setTokens({ accessToken, user: userObj })
      setUser(userObj)
      return userObj
    } catch (err: any) {
      setError(String(err?.message ?? err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (payload: SignUpPayload) => {
    setLoading(true)
    setError(null)
    try {
      const body = await postJson('/api/v1/auth/register', payload)
      const auth = body as any
      const accessToken = auth?.accessToken ?? null
      const userObj = auth?.user ?? null
      setTokens({ accessToken, user: userObj })
      setUser(userObj)
      return userObj
    } catch (err: any) {
      setError(String(err?.message ?? err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    try {
      // attempt server logout if possible
      await fetchJson('/api/v1/auth/logout', { method: 'POST' })
    } catch {
      // ignore errors on logout
    } finally {
      clearTokens()
      setUser(null)
      setLoading(false)
    }
  }

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const body = await postJson('/api/v1/auth/refresh', {})
      const auth = body as any
      const accessToken = auth?.accessToken ?? null
      const userObj = auth?.user ?? tokenStore.getUser()
      setTokens({ accessToken, user: userObj })
      setUser(userObj)
      return userObj
    } catch (err: any) {
      setError(String(err?.message ?? err))
      clearTokens()
      setUser(null)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const me = async () => {
    setLoading(true)
    setError(null)
    try {
      const body = await fetchJson('/api/v1/auth/me')
      const meUser = body as any
      // the backend returns the user object directly in /me
      setTokens({ user: meUser })
      setUser(meUser)
      return meUser
    } catch (err: any) {
      setError(String(err?.message ?? err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  // on mount: if we have tokens, attempt to validate user via /me; if fails try refresh
  useEffect(() => {
    let mounted = true
    const init = async () => {
      const access = getAccessToken()
      const refreshTok = getRefreshToken()
      if (!access && !refreshTok) return
      try {
        await me()
      } catch {
        if (refreshTok) {
          try {
            await refresh()
          } catch {
            // give up
          }
        }
      }
    }
    if (mounted) init()
    return () => {
      mounted = false
    }
  }, [])

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
    refresh,
    me,
  }
}

export default useAuth
