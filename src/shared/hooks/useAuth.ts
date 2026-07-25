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
      const data = (body && (body.data ?? body)) as any
      const accessToken = data?.accessToken ?? null
      const userObj = data?.user ?? null
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
      const data = (body && (body.data ?? body)) as any
      const accessToken = data?.accessToken ?? null
      const userObj = data?.user ?? null
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
      const data = (body && (body.data ?? body)) as any
      const accessToken = data?.accessToken ?? null
      const userObj = data?.user ?? tokenStore.getUser()
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
      // backend wraps response as { success, data, timestamp } or returns user directly
      const meUser = (body && (body.data ?? body)) as any
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

  // on mount: silently refresh using httpOnly cookie, then validate session via /me
  useEffect(() => {
    let mounted = true
    const init = async () => {
      // show persisted user immediately for instant UI
      const persistedUser = tokenStore.getUser()
      if (persistedUser && mounted) setUser(persistedUser)

      // if initAuth() in main.tsx already set an access token, skip refresh
      // otherwise attempt silent refresh via httpOnly cookie
      if (!getAccessToken()) {
        try {
          await refresh()
        } catch {
          // no valid session — user is logged out
          return
        }
      }

      // we have an access token — validate with /me to confirm server-side session
      if (!mounted) return
      try {
        await me()
      } catch {
        // /me failed — token may be stale; try one more refresh
        try {
          await refresh()
          if (mounted) await me()
        } catch {
          // give up — clear stale state
          clearTokens()
          if (mounted) setUser(null)
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
