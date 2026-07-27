import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson, postJson, setAuthHeaderGetter, setRefreshHandler, parseError } from '../api/client'
import tokenStore, { clearTokens, getAccessToken, setTokens } from '../auth/tokenStore'

type SignInPayload = { email: string; password: string }
type SignUpPayload = { email: string; password: string; displayName?: string }

// --- standalone helpers (not hooks) ---

async function doRefresh() {
  const body = await postJson('/api/v1/auth/refresh', {})
  const data = (body && (body.data ?? body)) as any
  const accessToken = data?.accessToken ?? null
  const userObj = data?.user ?? tokenStore.getUser()
  setTokens({ accessToken, user: userObj })
  return userObj
}

async function fetchMe() {
  const body = await fetchJson('/api/v1/auth/me')
  const meUser = (body && (body.data ?? body)) as any
  setTokens({ user: meUser })
  return meUser
}

// ---

export const useAuth = () => {
  const queryClient = useQueryClient()

  // Wire auth header getter + refresh handler once on mount
  useEffect(() => {
    setAuthHeaderGetter(() => tokenStore.getAccessToken())
    setRefreshHandler(async () => {
      try {
        await doRefresh()
        queryClient.invalidateQueries({ queryKey: ['me'] })
        return true
      } catch {
        return false
      }
    })
    return () => {
      setAuthHeaderGetter(() => null)
      setRefreshHandler(null)
    }
  }, [queryClient])

  // Single deduplicated query for the current user session.
  // - Only fires when an access token is present (initAuth sets it before render).
  // - TanStack deduplicates: multiple components calling useAuth share one request.
  const {
    data: user = tokenStore.getUser(),
    isLoading: loading,
    error: queryError,
    refetch: refetchMe,
  } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    initialData: tokenStore.getUser() ?? undefined,
  })

  const error = queryError ? parseError(queryError) : null

  // --- mutations ---

  const signInMutation = useMutation({
    mutationFn: async (payload: SignInPayload) => {
      const body = await postJson('/api/v1/auth/login', payload)
      const data = (body && (body.data ?? body)) as any
      const accessToken = data?.accessToken ?? null
      const userObj = data?.user ?? null
      setTokens({ accessToken, user: userObj })
      return userObj
    },
    onSuccess: (userObj) => {
      queryClient.setQueryData(['me'], userObj)
    },
  })

  const signUpMutation = useMutation({
    mutationFn: async (payload: SignUpPayload) => {
      const body = await postJson('/api/v1/auth/register', payload)
      const data = (body && (body.data ?? body)) as any
      const accessToken = data?.accessToken ?? null
      const userObj = data?.user ?? null
      setTokens({ accessToken, user: userObj })
      return userObj
    },
    onSuccess: (userObj) => {
      queryClient.setQueryData(['me'], userObj)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try { await fetchJson('/api/v1/auth/logout', { method: 'POST' }) } catch { /* ignore */ }
      clearTokens()
    },
    onSuccess: () => {
      queryClient.setQueryData(['me'], null)
      queryClient.removeQueries({ queryKey: ['me'] })
    },
  })

  const refreshMutation = useMutation({
    mutationFn: doRefresh,
    onSuccess: (userObj) => {
      queryClient.setQueryData(['me'], userObj)
    },
    onError: () => {
      clearTokens()
      queryClient.setQueryData(['me'], null)
    },
  })

  return {
    user,
    loading,
    error,
    signIn: (payload: SignInPayload) => signInMutation.mutateAsync(payload),
    signUp: (payload: SignUpPayload) => signUpMutation.mutateAsync(payload),
    logout: () => logoutMutation.mutateAsync(),
    refresh: () => refreshMutation.mutateAsync(),
    me: refetchMe,
    // raw mutation state for components that want granular status
    signInState: signInMutation,
    signUpState: signUpMutation,
  }
}

export default useAuth
